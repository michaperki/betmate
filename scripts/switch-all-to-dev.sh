#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
FRONT_DIR="$ROOT_DIR/frontend"
BACK_DIR="$ROOT_DIR/backend"
MS_DIR="$ROOT_DIR/microservice"

switch_to_dev() {
  local dir=$1
  if git -C "$dir" show-ref --verify --quiet refs/heads/dev; then
    git -C "$dir" checkout dev || true
    git -C "$dir" pull --ff-only origin dev || true
  fi
}

echo "[switch] Switching working trees to dev"
switch_to_dev "$ROOT_DIR"
switch_to_dev "$FRONT_DIR"
switch_to_dev "$BACK_DIR"
if [ -d "$MS_DIR/.git" ]; then
  switch_to_dev "$MS_DIR"
fi

echo "[switch] Updating root pointers"
git add frontend backend microservice 2>/dev/null || git add frontend backend || true
git commit -m "chore: switch working trees back to dev and update pointers" || true
git push origin dev || true

echo "[switch] Done."

