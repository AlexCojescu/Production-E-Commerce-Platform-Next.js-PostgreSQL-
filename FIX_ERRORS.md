# Fixing Installation Errors

## Errors You're Seeing

1. **Module not found: Can't resolve 'ai/react'**
2. **Module not found: Can't resolve 'tailwind-merge'**
3. **Module not found: Can't resolve 'clsx'**

## Solution

Run these commands in your terminal:

```bash
# Install missing dependencies
npm install tailwind-merge clsx

# The 'ai' package is already installed, but you may need to reinstall node_modules
rm -rf node_modules package-lock.json
npm install
```

## What Was Fixed in Code

1. ✅ Moved `cn` function from `lib/data.ts` to `lib/utils.ts` (with fallback)
2. ✅ Updated `Chatbot.jsx` to import `cn` from `@/lib/utils`
3. ✅ `lib/data.ts` now only exports `initialMessage` (as intended)

## After Installing Packages

Once you run `npm install tailwind-merge clsx`, the errors should be resolved.

The chatbot will work once:
- ✅ `tailwind-merge` is installed
- ✅ `clsx` is installed  
- ✅ `ai` package is properly installed (already in package.json)
- ✅ `@ai-sdk/openai` is installed (already in package.json)
- ✅ `react-markdown` is installed (already in package.json)

## Quick Fix Command

```bash
npm install tailwind-merge clsx && npm install
```

This will install the missing packages and ensure all dependencies are properly linked.

