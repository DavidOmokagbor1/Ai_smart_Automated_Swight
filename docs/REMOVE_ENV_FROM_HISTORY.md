# How to Remove .env Files from Git History

## ⚠️ IMPORTANT WARNING

Removing files from git history **rewrites history** and requires a force push. This affects:
- All team members (they'll need to re-clone or reset)
- All forks and clones of the repository
- Any deployments that reference old commits

**Only do this if:**
1. You've already revoked the exposed keys
2. You've coordinated with your team
3. You understand the consequences

## Step-by-Step Instructions

### Option 1: Using the Provided Script (Recommended)

```bash
# 1. Make sure you've revoked the exposed keys first!
# 2. Run the script
./scripts/remove-env-from-history.sh

# 3. Force push (WARNING: This rewrites history)
git push origin --force --all
git push origin --force --tags
```

### Option 2: Manual Removal

```bash
# Remove .env from all commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env frontend/.env.development frontend/.env.production" \
  --prune-empty --tag-name-filter cat -- --all

# Clean up
git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin --force --all
git push origin --force --tags
```

### Option 3: Using BFG Repo-Cleaner (Fastest for Large Repos)

```bash
# Download BFG from: https://rtyley.github.io/bfg-repo-cleaner/

# Remove .env files
java -jar bfg.jar --delete-files backend/.env
java -jar bfg.jar --delete-files frontend/.env.development
java -jar bfg.jar --delete-files frontend/.env.production

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin --force --all
```

## After Removing from History

1. **Notify all team members** to:
   ```bash
   # Option A: Re-clone the repository
   git clone <repo-url>
   
   # Option B: Reset their local copy
   git fetch origin
   git reset --hard origin/main
   ```

2. **Update all deployments** that reference old commits

3. **Verify the files are gone**:
   ```bash
   git log --all --full-history -- backend/.env
   # Should return nothing
   ```

## Prevention

The security measures now in place will prevent this from happening again:
- ✅ GitHub Actions secret scanning
- ✅ Pre-commit hooks
- ✅ Updated .gitignore
- ✅ Security documentation

## Need Help?

If you're unsure about any step, consult:
- [GitHub's guide on removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- Your team's security guidelines
- The `docs/SECURITY.md` file
