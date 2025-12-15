#!/usr/bin/env bash
# Aggregated Git status for root + submodules (frontend, backend, microservice)
# Usage: bash scripts/git-tree-status.sh

set -euo pipefail

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
  echo "upstream: ${upstream}, ahead: ${ahead}, behind: ${behind}"
}

# Compare current HEAD against a provided ref (e.g., origin/release)
# Prints: "prod: <ref>, ahead: X, behind: Y"
ahead_behind_vs() {
  local target_ref=$1
  if [ -z "$target_ref" ]; then
    echo "prod: none"
    return 0
  fi
  # If given a remote ref like origin/release, verify refs/remotes/origin/release
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
  local counts
  counts=$(git rev-list --left-right --count "${target_ref}...HEAD" 2>/dev/null || echo "0 0")
  local behind ahead
  read -r behind ahead <<< "$counts"
  echo "prod: ${target_ref}, ahead: ${ahead}, behind: ${behind}"
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
      echo "  $(ahead_behind_vs "$prod_ref")"
    fi
    raw=$(clean_status_raw)
    if [ "$raw" = CLEAN ]; then
      echo "  status: $(green OK)"
    else
      if [ "$ignore_flag" = dirty ]; then
        echo "  status: $(green 'OK (ignored)')"
      else
        echo "  status: $(red DIRTY)"
      fi
    fi
    echo "  head: $commit"
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
