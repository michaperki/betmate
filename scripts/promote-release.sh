#!/usr/bin/env bash
set -euo pipefail

# Promote dev -> release, bump versions, tag and update submodule pointers.
# Usage: scripts/promote-release.sh [patch|minor|major|<exact>] [--include-microservice] [--push]

BUMP_SPEC="${1:-patch}"
INCLUDE_MS=0
DO_PUSH=0

for arg in "$@"; do
  case "$arg" in
    --include-microservice) INCLUDE_MS=1 ;;
    --push) DO_PUSH=1 ;;
  esac
done

ROOT_DIR=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
FRONT_DIR="$ROOT_DIR/frontend"
BACK_DIR="$ROOT_DIR/backend"
MS_DIR="$ROOT_DIR/microservice"

require_clean() {
  local dir=$1
  if [[ -n "$(git -C "$dir" status --porcelain 2>/dev/null)" ]]; then
    echo "[promote] $dir has uncommitted changes. Please commit or stash before running." >&2
    git -C "$dir" status --porcelain || true
    exit 1
  fi
}

ensure_branch() {
  local dir=$1; local branch=$2
  if git -C "$dir" show-ref --verify --quiet "refs/heads/$branch"; then
    git -C "$dir" checkout "$branch"
  else
    git -C "$dir" checkout -b "$branch"
  fi
}

merge_dev_into_release() {
  local dir=$1
  ensure_branch "$dir" release
  git -C "$dir" fetch origin --prune || true
  # Ensure local dev is updated from remote before merging
  if git -C "$dir" show-ref --verify --quiet refs/remotes/origin/dev; then
    if git -C "$dir" show-ref --verify --quiet refs/heads/dev; then
      git -C "$dir" checkout dev && git -C "$dir" pull --ff-only origin dev
    fi
    git -C "$dir" checkout release
    git -C "$dir" merge --no-ff -m "merge(dev->release): promote for release" origin/dev || true
  fi
}

echo "[promote] Preflight checks"
require_clean "$ROOT_DIR"
require_clean "$FRONT_DIR"
require_clean "$BACK_DIR"
if (( INCLUDE_MS )); then
  require_clean "$MS_DIR"
fi

echo "[promote] Promoting dev -> release in submodules"
merge_dev_into_release "$FRONT_DIR"
merge_dev_into_release "$BACK_DIR"
if (( INCLUDE_MS )); then
  ensure_branch "$MS_DIR" release
  git -C "$MS_DIR" fetch origin --prune || true
  if git -C "$MS_DIR" show-ref --verify --quiet refs/remotes/origin/dev; then
    if git -C "$MS_DIR" show-ref --verify --quiet refs/heads/dev; then
      git -C "$MS_DIR" checkout dev && git -C "$MS_DIR" pull --ff-only origin dev
    fi
    git -C "$MS_DIR" checkout release
    git -C "$MS_DIR" merge --no-ff -m "merge(dev->release): promote for release" origin/dev || true
  fi
fi

echo "[promote] Bumping versions (frontend/backend): $BUMP_SPEC"
pushd "$FRONT_DIR" >/dev/null
FRONT_TAG=$(npm version "$BUMP_SPEC" -m "release(frontend): v%s")
FRONT_VERSION=${FRONT_TAG#v}
popd >/dev/null

pushd "$BACK_DIR" >/dev/null
BACK_TAG=$(npm version "$BUMP_SPEC" -m "release(backend): v%s")
BACK_VERSION=${BACK_TAG#v}
popd >/dev/null

if (( INCLUDE_MS )); then
  echo "[promote] Tagging microservice for traceability"
  pushd "$MS_DIR" >/dev/null
  MS_TAG="microservice-v${FRONT_VERSION}"
  git tag -a "$MS_TAG" -m "Microservice release (aligned with frontend v$FRONT_VERSION)"
  popd >/dev/null
fi

echo "[promote] Updating root pointers and tagging"
git add frontend backend microservice 2>/dev/null || git add frontend backend || true
git commit -m "chore(release): bump submodules frontend v$FRONT_VERSION, backend v$BACK_VERSION" || true

# Root tags
git tag -a "frontend-v$FRONT_VERSION" -m "Frontend release v$FRONT_VERSION" || true
git tag -a "backend-v$BACK_VERSION" -m "Backend release v$BACK_VERSION" || true
git tag -a "app-v$FRONT_VERSION+$BACK_VERSION" -m "App release (frontend v$FRONT_VERSION, backend v$BACK_VERSION)" || true
if (( INCLUDE_MS )); then
  git tag -a "microservice-v$FRONT_VERSION" -m "Microservice release aligned with v$FRONT_VERSION" || true
fi

echo "\n[promote] Done. Versions: FE v$FRONT_VERSION, BE v$BACK_VERSION"
echo "Next steps:"
echo "  git -C frontend push --follow-tags origin release"
echo "  git -C backend  push --follow-tags origin release"
if (( INCLUDE_MS )); then
  echo "  git -C microservice push --follow-tags origin release"
fi
echo "  git push --follow-tags origin release"

if (( DO_PUSH )); then
  echo "[promote] Pushing branches + tags"
  git -C "$FRONT_DIR" push --follow-tags origin release || true
  git -C "$BACK_DIR"  push --follow-tags origin release || true
  if (( INCLUDE_MS )); then
    git -C "$MS_DIR"   push --follow-tags origin release || true
  fi
  git push --follow-tags origin release || true
fi

