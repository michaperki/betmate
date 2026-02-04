#!/usr/bin/env bash
# Aggregated Git status for root + submodules (frontend, backend, microservice)
# Usage: bash scripts/git-tree-status.sh [--branches] [--fetch]

set -euo pipefail

# Flags (can also be set via env)
LIST_BRANCHES=${LIST_BRANCHES:-0}
FETCH=${FETCH:-0}

for arg in "$@"; do
  case "$arg" in
    --branches) LIST_BRANCHES=1 ;;
    --fetch) FETCH=1 ;;
    --no-fetch) FETCH=0 ;;
  esac
done

bold() { printf "\033[1m%s\033[0m" "$*"; }
dim() { printf "\033[2m%s\033[0m" "$*"; }
green() { printf "\033[32m%s\033[0m" "$*"; }
yellow() { printf "\033[33m%s\033[0m" "$*"; }
red() { printf "\033[31m%s\033[0m" "$*"; }

clean_status_raw() {
  if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
    echo CLEAN
  else
    echo DIRTY
  fi
}

ahead_behind() {
  local upstream
  if ! upstream=$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null); then
    echo "upstream: none"
    return 0
  fi
  local counts
  counts=$(git rev-list --left-right --count "${upstream}...HEAD" 2>/dev/null || echo "0 0")
  local behind ahead
  read -r behind ahead <<< "$counts"
  local parity=""
  if [ "$ahead" = 0 ] && [ "$behind" = 0 ]; then
    parity=", parity: yes"
  else
    parity=", parity: no"
  fi
  echo "upstream: ${upstream}, ahead: ${ahead}, behind: ${behind}${parity}"
}

# Compare current HEAD against a provided ref (e.g., origin/release)
# Prints: "prod: <ref>, ahead: X, behind: Y"
ahead_behind_vs() {
  local target_ref=$1
  if [ -z "$target_ref" ]; then
    echo "prod: none"
    return 0
  fi
  # Verify the target ref exists
  if [[ "$target_ref" == origin/* ]]; then
    if ! git show-ref --verify --quiet "refs/remotes/${target_ref}"; then
      echo "prod: $target_ref (not found)"
      return 0
    fi
  else
    if ! git show-ref --verify --quiet "$target_ref"; then
      echo "prod: $target_ref (not found)"
      return 0
    fi
  fi

  # Ignore artificial operational commits when comparing prod vs dev to avoid noise
  # Default patterns can be overridden via BETMATE_STATUS_IGNORE_REGEX (extended regex)
  local IGNORE_RE=${BETMATE_STATUS_IGNORE_REGEX:-"^(merge\\(release->dev\\)|release\\(|chore\\(release\\):|chore\\(submodules\\):|chore: (switch working trees back to dev|update submodule pointers|update (backend|frontend) submodule pointer|bump (frontend|backend) submodule|bump frontend pointer|bump backend pointer))"}

  # Count commits in each direction excluding ignored patterns; omit merges for clarity
  local ahead behind
  # Commits present on HEAD but not on target (dev ahead of release)
  local ahead_list
  ahead_list=$(git log --oneline --no-merges "${target_ref}..HEAD" 2>/dev/null || true)
  if [ -n "$IGNORE_RE" ]; then
    ahead_list=$(printf "%s\n" "$ahead_list" | grep -Ev "$IGNORE_RE" || true)
  fi
  ahead=$(printf "%s\n" "$ahead_list" | sed '/^$/d' | wc -l | awk '{print $1}')

  # Commits present on target but not on HEAD (release ahead of dev)
  local behind_list
  behind_list=$(git log --oneline --no-merges "HEAD..${target_ref}" 2>/dev/null || true)
  if [ -n "$IGNORE_RE" ]; then
    behind_list=$(printf "%s\n" "$behind_list" | grep -Ev "$IGNORE_RE" || true)
  fi
  behind=$(printf "%s\n" "$behind_list" | sed '/^$/d' | wc -l | awk '{print $1}')

  local parity=""
  if [ "$ahead" = 0 ] && [ "$behind" = 0 ]; then
    parity=", parity: yes"
  else
    parity=", parity: no"
  fi
  echo "prod: ${target_ref}, ahead: ${ahead}, behind: ${behind}${parity}"
}

# Resolve which branch should be considered "prod"
# Priority: $BETMATE_PROD_BRANCH (exact remote name OK), then origin/release, origin/prod, origin/main, origin/master
resolve_prod_ref() {
  local override=${BETMATE_PROD_BRANCH:-}
  if [ -n "$override" ]; then
    # Accept values like 'release' or 'origin/release'
    if [[ "$override" == origin/* ]]; then
      echo "$override"
      return 0
    else
      echo "origin/$override"
      return 0
    fi
  fi
  local candidates=(
    "origin/release"
    "origin/prod"
    "origin/main"
    "origin/master"
  )
  for ref in "${candidates[@]}"; do
    if git show-ref --verify --quiet "refs/remotes/${ref}"; then
      echo "$ref"
      return 0
    fi
  done
  echo "" # none found
}

clean_status() {
  if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
    echo "$(green OK)"
  else
    echo "$(red DIRTY)"
  fi
}

# Summarize dirty causes in current repo
dirty_summary() {
  local staged unstaged untracked
  staged=$(git diff --cached --name-only --diff-filter=ACMRT 2>/dev/null | wc -l | awk '{print $1}')
  unstaged=$(git diff --name-only --diff-filter=ACMRT 2>/dev/null | wc -l | awk '{print $1}')
  untracked=$(git ls-files --others --exclude-standard 2>/dev/null | wc -l | awk '{print $1}')
  echo "staged: ${staged}, unstaged: ${unstaged}, untracked: ${untracked}"
}

# Optional: list branches (local + upstream mapping)
list_branches() {
  echo "  branches:"
  git for-each-ref --format='    %(if)%(HEAD)%(then)* %(else)  %(end)%(refname:short)%(if)%(upstream)%(then) -> %(upstream:short)%(end)' refs/heads \
    | sort
}

pointer_status() {
  local path=$1
  local line
  line=$(git submodule status "$path" 2>/dev/null | sed -n '1p')
  if [ -z "$line" ]; then echo "n/a"; return; fi
  local flag=${line:0:1}
  case "$flag" in
    ' ') echo "pointer: $(green OK)" ;;
    '+') echo "pointer: $(yellow UPDATED)" ;;
    '-') echo "pointer: $(yellow UNINITIALIZED)" ;;
    'U') echo "pointer: $(red CONFLICT)" ;;
    *)   echo "pointer: $flag" ;;
  esac
}

root_prod_parity() {
  local target_ref=$1
  if [ -z "$target_ref" ]; then
    echo "prod: none"
    return 0
  fi
  # Collect submodule paths from .gitmodules
  if [ ! -f .gitmodules ]; then
    # No submodules; fall back to commit-based compare
    ahead_behind_vs "$target_ref"
    return 0
  fi
  local mismatches=0
  # Read submodule paths in stable order
  while IFS= read -r line; do
    local key path
    key=$(echo "$line" | awk '{print $1}')
    path=$(echo "$line" | awk '{print $2}')
    if [ -z "$path" ]; then continue; fi
    # Resolve subtree commit at HEAD and at target ref
    local sha_head sha_target
    sha_head=$(git ls-tree -d HEAD -- "$path" 2>/dev/null | awk '{print $3}' | head -n1)
    sha_target=$(git ls-tree -d "$target_ref" -- "$path" 2>/dev/null | awk '{print $3}' | head -n1)
    if [ -n "$sha_head" ] && [ -n "$sha_target" ]; then
      if [ "$sha_head" != "$sha_target" ]; then
        mismatches=$((mismatches+1))
      fi
    fi
  done < <(git config --file .gitmodules --get-regexp 'submodule\..*\.path' | sort)

  if [ "$mismatches" -eq 0 ]; then
    echo "prod: ${target_ref}, ahead: 0, behind: 0, parity: yes"
  else
    echo "prod: ${target_ref}, ahead: 0, behind: 0, parity: no (submodule pointers differ: ${mismatches})"
  fi
}

print_section() {
  local label=$1
  local path=$2

  if [ "$path" = "." ]; then
    echo "$(bold ROOT) $(dim "$PWD")"
  else
    echo "$(bold "$label") $(dim "$path")"
    echo "  $(pointer_status "$path")"
  fi

  ignore_flag=""
  if [ "$path" != "." ]; then
    ignore_flag=$(git config --file .gitmodules --get "submodule.${label}.ignore" 2>/dev/null || true)
  fi

  ( cd "$path" >/dev/null 2>&1
    if [ "$FETCH" = 1 ]; then
      git fetch --prune --tags --quiet || true
    fi
    local branch
    branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "(detached)")
    local remote
    remote=$(git config --get remote.origin.url 2>/dev/null || echo "(no origin)")
    local commit
    commit=$(git log -1 --pretty='%h %s' 2>/dev/null || echo "(no commits)")
    echo "  repo: $remote"
    echo "  branch: $branch"
    echo "  $(ahead_behind)"
    local prod_ref
    prod_ref=$(resolve_prod_ref)
    if [ -n "$prod_ref" ]; then
      if [ "$path" = "." ]; then
        echo "  $(root_prod_parity "$prod_ref")"
      else
        echo "  $(ahead_behind_vs "$prod_ref")"
      fi
    fi
    raw=$(clean_status_raw)
    if [ "$raw" = CLEAN ]; then
      echo "  status: $(green OK)"
    else
      if [ "$ignore_flag" = dirty ]; then
        echo "  status: $(green 'OK (ignored)')"
      else
        echo "  status: $(red DIRTY)"
        echo "  $(dirty_summary)"
      fi
    fi
    echo "  head: $commit"
    if [ "$LIST_BRANCHES" = 1 ]; then
      list_branches
    fi
  )
  echo
}

print_section ROOT .

# Discover submodules from .gitmodules (stable order)
if [ -f .gitmodules ]; then
  # Read lines: key value -> key like 'submodule.name.path', value is the path
  git config --file .gitmodules --get-regexp 'submodule\..*\.path' \
    | while read -r key path; do
        name=${key#submodule.}
        name=${name%.path}
        [ -n "$path" ] && print_section "$name" "$path"
      done
fi

echo "$(dim "Tip: 'pointer: UPDATED' means the submodule HEAD has advanced.")"
echo "$(dim "Commit the new pointer in the root repo to clear it.")"
echo "$(dim "Set BETMATE_PROD_BRANCH to override prod (default: origin/release).")"
