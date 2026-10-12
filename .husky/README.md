# Husky Git Hooks

Pre-commit hook runs **lint-staged** to check only staged files before commit.

## Rules

- ❌ **No errors** - Any ESLint error blocks commit
- ⚠️ **Max 10 warnings** - More than 10 warnings blocks commit
- ✅ **Auto-fix** - Automatically fixes issues when possible

## Config

- `.lintstagedrc.json` - Defines what to run on which files
- `.husky/pre-commit` - Runs `npx lint-staged`

## Bypass (emergency only)

```bash
git commit --no-verify
```
