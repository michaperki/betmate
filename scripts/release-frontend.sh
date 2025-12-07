#!/usr/bin/env bash
set -euo pipefail

# Release helper: bump frontend version, tag it, and bump root submodule.
# Usage: scripts/release-frontend.sh [patch|minor|major|<exact>]

BUMP_SPEC="${1:-patch}"

ROOT_DIR=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
FRONT_DIR="$ROOT_DIR/frontend"

if [ ! -d "$FRONT_DIR/.git" ]; then
  echo "[release] frontend directory is missing or not a git repo (submodule)." >&2
  exit 1
fi

# Ensure frontend working tree is clean before version bump
if [ -n "$(git -C "$FRONT_DIR" status --porcelain)" ]; then
  echo "[release] Please commit or stash changes in frontend before releasing:" >&2
  git -C "$FRONT_DIR" status --porcelain
  exit 1
fi

current_branch=$(git -C "$FRONT_DIR" rev-parse --abbrev-ref HEAD)
echo "[release] frontend current branch: $current_branch"

# Switch to release branch (create if needed)
if git -C "$FRONT_DIR" show-ref --verify --quiet refs/heads/release; then
  git -C "$FRONT_DIR" checkout release
else
  git -C "$FRONT_DIR" checkout -b release
fi

# Pull latest if you have remotes (optional; commented due to offline environments)
# git -C "$FRONT_DIR" pull --ff-only || true

# Perform the version bump, commit and tag in the frontend repo
echo "[release] Bumping frontend version: $BUMP_SPEC"
pushd "$FRONT_DIR" >/dev/null
NEW_TAG=$(npm version "$BUMP_SPEC" -m "release(frontend): v%s")
# npm echoes the new version prefixed with 'v', capture clean version
NEW_VERSION=${NEW_TAG#v}
popd >/dev/null

echo "[release] Frontend bumped to v$NEW_VERSION"

# Update root repo to point to latest frontend commit
git add frontend
if git diff --cached --quiet; then
  echo "[release] No submodule change detected at root; already up to date."
else
  git commit -m "chore(release): bump frontend submodule to v$NEW_VERSION"
fi

# Create a root tag that references this frontend release
ROOT_TAG="frontend-v$NEW_VERSION"
git tag -a "$ROOT_TAG" -m "Frontend release v$NEW_VERSION"

cat <<EOF

[release] Done.
  - Frontend tag: v$NEW_VERSION (in submodule)
  - Root tag:     $ROOT_TAG (in this repo)

Next steps to publish (if remotes configured):
  git -C frontend push --follow-tags origin release
  git push --follow-tags origin release

EOF

