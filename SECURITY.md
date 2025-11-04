# Security Guidelines

## Secrets Management

This project follows security best practices to prevent credential exposure:

### What NOT to commit:

- ❌ `.env` files (already in `.gitignore`)
- ❌ `docker-compose.yml` with real credentials
- ❌ Any file containing passwords, API keys, or secrets
- ❌ Hardcoded credentials in source code

### What IS safe to commit:

- ✅ `docker-compose.example.yml` (template without real values)
- ✅ `.env.example` (template with placeholder values)
- ✅ Configuration files without sensitive data

## Environment Variables

All sensitive configuration must be set via environment variables:

1. Copy `.env.example` to `.env`
2. Replace all placeholder values with secure, unique credentials
3. **Never commit `.env`** - it's already in `.gitignore`

### Required Variables

```env
POSTGRES_USER=your_secure_username
POSTGRES_PASSWORD=your_strong_password
POSTGRES_DB=meta_backend
DATABASE_URL="postgresql://username:password@localhost:5432/meta_backend"
```

## If Secrets Are Exposed

If you accidentally commit secrets:

1. **Immediately rotate/revoke** the exposed credentials
2. **Remove from git history** using `git filter-branch` or BFG Repo-Cleaner
3. **Update all services** using those credentials
4. **Notify your team** if working in a team environment
5. **Review access logs** for any unauthorized access

## Best Practices

- Use strong passwords (minimum 16 characters)
- Use different credentials for development and production
- Rotate passwords regularly
- Use secrets management tools in production (AWS Secrets Manager, HashiCorp Vault, etc.)
- Enable 2FA on GitHub and other services
- Review `.gitignore` regularly
- Use pre-commit hooks to prevent committing secrets

## Docker Security

- Never hardcode credentials in `docker-compose.yml`
- Use environment variables or Docker secrets
- Keep Docker images updated
- Use non-root users in containers (already configured)
- Scan images for vulnerabilities

