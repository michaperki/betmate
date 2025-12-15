#!/usr/bin/env bash
# Aggregated Git status for root + submodules (frontend, backend, microservice)
# Usage: bash scripts/git-tree-status.sh

set -euo pipefail

bold() { printf "\033[1m%s\033[0m" "$*"; }
dim() { printf "\033[2m%s\033[0m" "$*"; }
green() { printf "\033[32m%s\033[0m" "$*"; }
yellow() { printf "\033[33m%s\033[0m" "$*"; }
red() { printf "\033[31m%s\033[0m" "$*"; }

ahead_behind() {
  local upstream
  if ! upstream=$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null); then
    echo "upstream: none"
    return 0
  fi
  local counts
  counts=$(git rev-list --left-right --count "${upstream}...HEAD" 2>/dev/null || echo "0\t0")
  local behind=${counts%%\t*}
  local ahead=${counts##*\t}
  echo "upstream: ${upstream}, ahead: ${ahead}, behind: ${behind}"
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
    echo "  status: $(clean_status)"
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

echo "$(dim "Tip: 'pointer: UPDATED' means the submodule HEAD has advanced;\ncommit the new pointer in the root repo to clear it.")"
