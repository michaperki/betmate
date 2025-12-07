#!/usr/bin/env bash
set -euo pipefail

# Release helper: bump backend version, tag it, and bump root submodule.
# Usage: scripts/release-backend.sh [patch|minor|major|<exact>]

BUMP_SPEC="${1:-patch}"

ROOT_DIR=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
BACK_DIR="$ROOT_DIR/backend"

if [ ! -d "$BACK_DIR/.git" ]; then
  echo "[release] backend directory is missing or not a git repo (submodule)." >&2
  exit 1
fi

# Ensure backend working tree is clean before version bump
if [ -n "$(git -C "$BACK_DIR" status --porcelain)" ]; then
  echo "[release] Please commit or stash changes in backend before releasing:" >&2
  git -C "$BACK_DIR" status --porcelain
  exit 1
fi

current_branch=$(git -C "$BACK_DIR" rev-parse --abbrev-ref HEAD)
echo "[release] backend current branch: $current_branch"

# Switch to release branch (create if needed)
if git -C "$BACK_DIR" show-ref --verify --quiet refs/heads/release; then
  git -C "$BACK_DIR" checkout release
else
  git -C "$BACK_DIR" checkout -b release
fi

# Bump version, commit, tag inside backend repo
echo "[release] Bumping backend version: $BUMP_SPEC"
pushd "$BACK_DIR" >/dev/null
NEW_TAG=$(npm version "$BUMP_SPEC" -m "release(backend): v%s")
NEW_VERSION=${NEW_TAG#v}
popd >/dev/null

echo "[release] Backend bumped to v$NEW_VERSION"

# Update root repo to point to latest backend commit
git add backend
if git diff --cached --quiet; then
  echo "[release] No submodule change detected at root; already up to date."
else
  git commit -m "chore(release): bump backend submodule to v$NEW_VERSION"
fi

# Create a root tag that references this backend release
ROOT_TAG="backend-v$NEW_VERSION"
git tag -a "$ROOT_TAG" -m "Backend release v$NEW_VERSION"

cat <<EOF

[release] Done.
  - Backend tag: v$NEW_VERSION (in submodule)
  - Root tag:    $ROOT_TAG (in this repo)

Next steps to publish (if remotes configured):
  git -C backend push --follow-tags origin release
  git push --follow-tags origin release

EOF

