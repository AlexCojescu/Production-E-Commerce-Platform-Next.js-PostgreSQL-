# Fixing Installation Errors

## Errors You're Seeing

1. **Module not found: Can't resolve 'tailwind-merge'**
2. **Module not found: Can't resolve 'clsx'**

## Solution

Run these commands in your terminal:

```bash
# Install missing dependencies
npm install tailwind-merge clsx

# Reinstall node_modules if needed
rm -rf node_modules package-lock.json
npm install
```

## What Was Fixed in Code

1. ✅ Moved `cn` function to `lib/utils.ts` (with fallback)

## After Installing Packages

Once you run `npm install tailwind-merge clsx`, the errors should be resolved.

## Quick Fix Command

```bash
npm install tailwind-merge clsx
```
