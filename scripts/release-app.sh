#!/usr/bin/env bash
set -euo pipefail

# Combined release helper for both frontend and backend submodules.
# Bumps versions, tags each, and creates a single root commit updating both submodules.
# Usage: scripts/release-app.sh [patch|minor|major|<exact>]

BUMP_SPEC="${1:-patch}"

ROOT_DIR=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
FRONT_DIR="$ROOT_DIR/frontend"
BACK_DIR="$ROOT_DIR/backend"

require_clean() {
  local dir=$1
  if [ ! -d "$dir/.git" ]; then
    echo "[release] $dir is not a git repo (submodule)." >&2
    exit 1
  fi
  if [ -n "$(git -C "$dir" status --porcelain)" ]; then
    echo "[release] Please commit or stash changes in $dir before releasing:" >&2
    git -C "$dir" status --porcelain
    exit 1
  fi
}

checkout_release() {
  local dir=$1
  if git -C "$dir" show-ref --verify --quiet refs/heads/release; then
    git -C "$dir" checkout release
  else
    git -C "$dir" checkout -b release
  fi
}

# Preconditions
require_clean "$FRONT_DIR"
require_clean "$BACK_DIR"

echo "[release] Switching both submodules to release branches"
checkout_release "$FRONT_DIR"
checkout_release "$BACK_DIR"

echo "[release] Bumping versions: $BUMP_SPEC"
pushd "$FRONT_DIR" >/dev/null
FRONT_TAG=$(npm version "$BUMP_SPEC" -m "release(frontend): v%s")
FRONT_VERSION=${FRONT_TAG#v}
popd >/dev/null

pushd "$BACK_DIR" >/dev/null
BACK_TAG=$(npm version "$BUMP_SPEC" -m "release(backend): v%s")
BACK_VERSION=${BACK_TAG#v}
popd >/dev/null

echo "[release] New versions -> frontend: v$FRONT_VERSION, backend: v$BACK_VERSION"

git add frontend backend
if git diff --cached --quiet; then
  echo "[release] No submodule changes detected at root; already up to date."
else
  git commit -m "chore(release): bump submodules frontend v$FRONT_VERSION, backend v$BACK_VERSION"
fi

# Create root tags for each submodule release and a combined tag
git tag -a "frontend-v$FRONT_VERSION" -m "Frontend release v$FRONT_VERSION"
git tag -a "backend-v$BACK_VERSION" -m "Backend release v$BACK_VERSION"
git tag -a "app-v$FRONT_VERSION+$BACK_VERSION" -m "App release (frontend v$FRONT_VERSION, backend v$BACK_VERSION)"

cat <<EOF

[release] Done.
  - Frontend tag: v$FRONT_VERSION (in submodule), root tag: frontend-v$FRONT_VERSION
  - Backend tag:  v$BACK_VERSION (in submodule), root tag: backend-v$BACK_VERSION
  - Combined root tag: app-v$FRONT_VERSION+$BACK_VERSION

Next steps to publish (if remotes configured):
  git -C frontend push --follow-tags origin release
  git -C backend push --follow-tags origin release
  git push --follow-tags origin release

EOF

