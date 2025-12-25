#!/bin/bash
# Install pre-commit hook
# This works for both regular repos and worktrees

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git rev-parse --show-toplevel)"
GIT_DIR="$(git rev-parse --git-dir)"

# Create hooks directory if it doesn't exist
mkdir -p "$GIT_DIR/hooks"

# Copy pre-commit hook
cp "$SCRIPT_DIR/pre-commit" "$GIT_DIR/hooks/pre-commit"
chmod +x "$GIT_DIR/hooks/pre-commit"

echo "✅ Pre-commit hook installed successfully!"
echo "The hook will now prevent committing .env files and warn about potential secrets."
