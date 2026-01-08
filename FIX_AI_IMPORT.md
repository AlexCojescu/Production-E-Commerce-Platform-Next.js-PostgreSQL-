# Fix for AI SDK Import Error

## The Issue

The error `Module not found: Can't resolve 'ai/react'` occurs because in AI SDK v6, the React hooks have been moved to a separate package.

## Solution

Install the `@ai-sdk/react` package:

```bash
npm install @ai-sdk/react
```

## What Changed

- **Old (v5)**: `import { useChat } from 'ai/react'`
- **New (v6)**: `import { useChat } from '@ai-sdk/react'`

## Files Updated

- ✅ `components/Chatbot.jsx` - Updated import to use `@ai-sdk/react`
- ✅ `package.json` - Added `@ai-sdk/react` to dependencies

## After Installation

Once you run `npm install @ai-sdk/react`, the chatbot should work correctly.

The package has been added to your `package.json`, so running `npm install` will install it automatically.

