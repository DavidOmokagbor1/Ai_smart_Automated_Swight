# Security Guidelines

## 🔒 Protecting Secrets

### Never Commit:
- `.env` files
- API keys
- Passwords
- Private keys
- Access tokens
- Database credentials

### Use Instead:
- `.env.example` files with placeholder values
- Environment variables in deployment platforms
- GitHub Secrets for CI/CD
- Secret management services (AWS Secrets Manager, etc.)

## 🛡️ Security Measures in Place

### 1. GitHub Actions Secret Scanning
- Automated scanning on every push/PR
- Daily scheduled scans
- Blocks commits with detected secrets

### 2. Pre-commit Hooks
- Prevents committing `.env` files
- Warns about potential secrets in code

### 3. .gitignore Protection
- All `.env` files are ignored
- Common secret file patterns ignored

## 🚨 If You Accidentally Commit Secrets

1. **IMMEDIATELY** revoke the exposed key/token
2. Remove from git history using `scripts/remove-env-from-history.sh`
3. Force push: `git push origin --force --all`
4. Rotate all affected credentials
5. Notify team members to update their local repos

## ✅ Best Practices

1. Always use `env.example` as a template
2. Never hardcode secrets in code
3. Use environment variables for all sensitive data
4. Review diffs before committing
5. Use secret scanning tools locally before pushing

## 🔍 How to Check for Exposed Secrets

```bash
# Check if .env files are tracked
git ls-files | grep .env

# Check git history for .env
git log --all --full-history -- backend/.env

# Scan for common secret patterns
grep -rE "(api[_-]?key|secret[_-]?key|password|token)\s*=\s*['\"][^'\"]{10,}" --include="*.py" --include="*.js" --include="*.ts" .
```
