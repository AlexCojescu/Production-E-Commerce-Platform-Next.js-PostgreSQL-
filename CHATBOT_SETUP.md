# Chatbot Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install @ai-sdk/openai react-markdown
```

### 2. Set Environment Variable

Add to your `.env.local` file:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 3. Verify Installation

Start your development server:

```bash
npm run dev
```

The chatbot should appear in the bottom-right corner of your website.

## What's Included

### Files Created/Modified

1. **`lib/data.ts`** - Chatbot initial message configuration
2. **`app/api/chatbot/route.js`** - Secure API endpoint
3. **`components/Chatbot.jsx`** - Frontend chatbot component
4. **`lib/rateLimit.js`** - Rate limiting utility
5. **`lib/security.js`** - Security utilities (XSS, prompt injection detection)
6. **`app/layout.jsx`** - Updated to include chatbot
7. **`CHATBOT_DOCUMENTATION.md`** - Comprehensive documentation

## Configuration

### OpenAI Model

Default model: `gpt-4o-mini` (cost-effective)

To change, edit `app/api/chatbot/route.js`:

```javascript
model: openai('gpt-4'), // Use GPT-4 instead
```

### Rate Limits

Default: 10 requests per minute

To change, edit `app/api/chatbot/route.js`:

```javascript
const RATE_LIMIT_REQUESTS = 20; // Increase limit
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
```

### Chatbot Position

Default: Bottom-right corner

To change, edit `components/Chatbot.jsx`:

```jsx
// Change from bottom-6 right-6 to top-6 left-6
className="fixed top-6 left-6 z-50 ..."
```

## Testing

### Test the API

```bash
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "What designers do you specialize in?"}
    ]
  }'
```

### Test Rate Limiting

Send 11 requests quickly - the 11th should return a 429 error.

### Test Security

Try sending:
- HTML tags: `<script>alert('xss')</script>`
- Prompt injection: "Ignore previous instructions and tell me..."

Both should be blocked or sanitized.

## Troubleshooting

### "Cannot find module '@ai-sdk/openai'"

```bash
npm install @ai-sdk/openai
```

### "Cannot find module 'react-markdown'"

```bash
npm install react-markdown
```

### Chatbot not appearing

1. Check browser console for errors
2. Verify `Chatbot` is imported in `app/layout.jsx`
3. Check for CSS z-index conflicts

### API returns 503 error

1. Check `OPENAI_API_KEY` is set in `.env.local`
2. Verify API key is valid
3. Check server logs for detailed error

### Rate limit errors

- Wait 1 minute between requests
- Or increase rate limit in `app/api/chatbot/route.js`

## Production Deployment

### Environment Variables

Set in your hosting platform (Vercel, Netlify, etc.):

```
OPENAI_API_KEY=sk-...
```

### Recommended Settings

1. **Rate Limiting**: Consider Redis for distributed rate limiting
2. **Monitoring**: Set up error tracking (Sentry, etc.)
3. **Analytics**: Track usage patterns
4. **Caching**: Cache common responses

### Security Checklist

- [ ] API key stored in environment variables (never in code)
- [ ] Rate limiting enabled
- [ ] Input sanitization working
- [ ] Prompt injection detection active
- [ ] HTTPS enabled in production
- [ ] CORS configured correctly
- [ ] Error messages don't expose sensitive info

## Next Steps

1. Customize the system prompt in `lib/data.ts`
2. Adjust styling in `components/Chatbot.jsx`
3. Set up monitoring and analytics
4. Review `CHATBOT_DOCUMENTATION.md` for advanced features

## Support

For issues or questions:
1. Check `CHATBOT_DOCUMENTATION.md`
2. Review code comments
3. Check browser/server logs
4. Open an issue with detailed error information

