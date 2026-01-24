#!/usr/bin/env bash
# Sync release -> dev across submodules and root without pushing.
# - Merges origin/release into dev for frontend and backend (if present)
# - Commits updated submodule pointers in root
# - Prints push commands (does not push)

set -euo pipefail

FETCH=0
MSG="merge(release->dev): sync version bumps"

usage() {
  cat <<EOF
Usage: bash scripts/sync-release-to-dev.sh [--fetch]

Options:
  --fetch   Run 'git fetch origin' in root and submodules before merging.

Behavior:
  - Requires clean working trees (root, frontend, backend).
  - Merges origin/release -> dev in each submodule if the branch exists.
  - Commits updated submodule pointers in the root repo.
  - Prints push commands to execute manually.
EOF
}

if [[ ${1:-} == "-h" || ${1:-} == "--help" ]]; then
  usage
  exit 0
fi

if [[ ${1:-} == "--fetch" ]]; then
  FETCH=1
fi

repo_root=$(git rev-parse --show-toplevel 2>/dev/null || true)
if [[ -z "$repo_root" ]]; then
  echo "Error: not inside a git repository." >&2
  exit 1
fi
cd "$repo_root"

require_clean() {
  local path=$1
  if [[ -n $(git -C "$path" status --porcelain 2>/dev/null) ]]; then
    echo "Error: $path has uncommitted changes. Please commit or stash before running." >&2
    exit 1
  fi
}

merge_release_into_dev() {
  local path=$1
  local label=$2

  if [[ ! -d "$path/.git" ]]; then
    echo "$label: not a git repo at $path, skipping"
    return 0
  fi

  require_clean "$path"

  if (( FETCH )); then
    git -C "$path" fetch origin --prune || true
  fi

  # Ensure on dev
  local branch
  branch=$(git -C "$path" rev-parse --abbrev-ref HEAD)
  if [[ "$branch" != "dev" ]]; then
    git -C "$path" checkout dev
  fi

  # Only merge if origin/release exists locally
  if git -C "$path" show-ref --verify --quiet refs/remotes/origin/release; then
    # Merge may be no-op if already up to date
    if git -C "$path" merge --no-ff -m "$MSG" origin/release; then
      echo "$label: merged origin/release into dev"
    else
      echo "$label: merge encountered conflicts or was already up-to-date"
    fi
  else
    echo "$label: no origin/release branch found; skipping"
  fi
}

# Ensure root is clean before starting (except for submodule pointer changes we'll make later)
require_clean .

# Frontend and Backend merges
merge_release_into_dev frontend FRONTEND
merge_release_into_dev backend BACKEND

# Commit updated pointers in root (if any)
git add frontend backend || true
if ! git diff --cached --quiet; then
  git commit -m "chore(submodules): $MSG and update pointers"
  echo "Root: committed updated submodule pointers."
else
  echo "Root: no submodule pointer updates to commit."
fi

echo
echo "Next steps (manual pushes):"
echo "  git -C frontend push origin dev"
echo "  git -C backend  push origin dev"
echo "  git push origin dev"
echo
echo "Done."

