#!/bin/bash
# Script to remove .env file from git history
# WARNING: This rewrites git history - coordinate with team first!

set -e

echo "⚠️  WARNING: This will rewrite git history!"
echo "Make sure you coordinate with your team before running this."
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 1
fi

# Remove .env from git history using git filter-branch
echo "Removing backend/.env from git history..."
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env" \
  --prune-empty --tag-name-filter cat -- --all

# Clean up
echo "Cleaning up..."
git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "✅ Done! Now force push with: git push origin --force --all"
