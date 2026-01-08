# Vette Archive Chatbot - System Documentation

## Overview

The Vette Archive Chatbot is a production-ready, secure, and high-performance conversational AI assistant embedded in the corner of the Vette Archive website. It provides expert guidance on archive fashion, designer knowledge, sizing recommendations, and store policies.

## Architecture

### System Components

1. **Frontend Component** (`components/Chatbot.jsx`)
   - React-based corner chatbot UI
   - Persistent context via localStorage
   - Dark mode support
   - Smooth animations and responsive design

2. **API Route** (`app/api/chatbot/route.js`)
   - Secure backend endpoint
   - Rate limiting
   - Input sanitization and validation
   - Prompt injection detection

3. **Security Utilities** (`lib/security.js`)
   - XSS protection
   - Input sanitization
   - Prompt injection detection
   - Message validation

4. **Rate Limiting** (`lib/rateLimit.js`)
   - In-memory rate limiting
   - Configurable limits and windows
   - Automatic cleanup

5. **Data Configuration** (`lib/data.ts`)
   - Initial system message configuration
   - Chatbot personality and expertise definition

## Installation & Setup

### Prerequisites

1. Node.js 18+ and npm
2. OpenAI API key
3. Next.js 16+ project

### Installation Steps

1. **Install Required Dependencies**

```bash
npm install @ai-sdk/openai react-markdown
```

2. **Environment Variables**

Create or update your `.env.local` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

**Security Note**: Never commit API keys to version control. Use environment variables or a secure secrets management service.

3. **Verify Installation**

The chatbot should automatically appear in the bottom-right corner of your website after installation.

## Security Features

### 1. Rate Limiting

- **Limit**: 10 requests per minute per user/IP
- **Window**: 60 seconds
- **Implementation**: In-memory tracking with automatic cleanup
- **Headers**: Rate limit information included in response headers

**Production Recommendation**: For high-traffic sites, consider using Redis-based rate limiting for distributed systems.

### 2. XSS Protection

- All user inputs are sanitized before processing
- Removes potentially dangerous HTML/JavaScript
- Limits input length to 5000 characters
- Strips event handlers and javascript: protocols

### 3. Prompt Injection Detection

The system detects common prompt injection patterns including:
- "Ignore previous instructions"
- "Forget everything"
- "You are now..."
- System/assistant role manipulation attempts
- Instruction override attempts

**Response**: Suspicious inputs are rejected with a user-friendly error message.

### 4. Input Validation

- Message structure validation
- Role validation (system, user, assistant)
- Content type and length checks
- Maximum message count limits (50 messages per conversation)

### 5. CSRF Protection

- Handled automatically by Next.js
- Same-origin policy enforcement
- Secure cookie handling

### 6. API Key Security

- API keys stored in environment variables
- Never exposed to client-side code
- Server-side only access

## Data Handling & Privacy

### Context Persistence

- Chat history stored in browser localStorage
- Maximum 50 messages stored per session
- Automatic cleanup of old messages
- User can clear history manually

### Data Collection

- Minimal logging in production
- Usage analytics (tokens, timestamps) logged server-side
- No personally identifiable information stored
- IP addresses used only for rate limiting (not stored)

### Compliance

- GDPR-friendly (no persistent user tracking)
- No third-party analytics by default
- User data remains in browser localStorage

## Performance Optimization

### Frontend

- **Lazy Loading**: Chatbot component loads on demand
- **Code Splitting**: React components optimized
- **Animations**: CSS-based animations (GPU-accelerated)
- **Debouncing**: Input handling optimized
- **Virtual Scrolling**: Large message lists handled efficiently

### Backend

- **Streaming Responses**: Real-time token streaming
- **Efficient Rate Limiting**: In-memory with cleanup
- **Connection Pooling**: Database connections optimized
- **Caching**: Consider implementing response caching for common queries

### Recommendations

1. **CDN**: Serve static assets via CDN
2. **Redis**: Use Redis for distributed rate limiting in production
3. **Monitoring**: Implement APM tools (e.g., Sentry, Datadog)
4. **Caching**: Cache common responses for frequently asked questions

## Usage

### User Interaction

1. Click the chat button in the bottom-right corner
2. Type questions about:
   - Product availability
   - Designer information
   - Sizing recommendations
   - Store policies
   - Shipping information
3. Chat history persists across page reloads
4. Clear history using the "Clear chat history" button

### Developer Customization

#### Modify Chatbot Personality

Edit `lib/data.ts` to change the initial system message:

```typescript
export const initialMessage = {
  role: "system",
  content: `Your custom system prompt here...`
};
```

#### Adjust Rate Limits

Edit `app/api/chatbot/route.js`:

```javascript
const RATE_LIMIT_REQUESTS = 10; // Change limit
const RATE_LIMIT_WINDOW_MS = 60000; // Change window
```

#### Customize UI

Edit `components/Chatbot.jsx` to modify:
- Colors and styling
- Animation timings
- Layout and positioning
- Dark mode behavior

## Monitoring & Analytics

### Logging

Production logs include:
- Request timestamps
- User identifiers (anonymous or userId)
- Token usage
- Error messages (sanitized)

### Metrics to Monitor

1. **Performance**
   - Response time (p50, p95, p99)
   - Token usage per request
   - Error rate

2. **Usage**
   - Requests per hour/day
   - Unique users
   - Average messages per session

3. **Security**
   - Rate limit hits
   - Prompt injection attempts
   - XSS attempts

### Recommended Tools

- **Error Tracking**: Sentry, Rollbar
- **APM**: Datadog, New Relic
- **Analytics**: Custom dashboard or Google Analytics (if privacy-compliant)

## Troubleshooting

### Chatbot Not Appearing

1. Check browser console for errors
2. Verify component is imported in `app/layout.jsx`
3. Check for CSS conflicts

### API Errors

1. Verify `OPENAI_API_KEY` is set
2. Check API key validity
3. Verify `@ai-sdk/openai` is installed
4. Check rate limiting (429 errors)

### Performance Issues

1. Check network tab for slow requests
2. Monitor token usage (may indicate expensive queries)
3. Review rate limiting settings
4. Check for memory leaks in rate limiter

### Security Concerns

1. Review security logs regularly
2. Monitor for suspicious patterns
3. Update prompt injection patterns as needed
4. Keep dependencies updated

## Best Practices

### Development

1. **Testing**: Write unit tests for security utilities
2. **Code Review**: Review all security-related changes
3. **Documentation**: Keep this documentation updated
4. **Version Control**: Never commit API keys

### Production

1. **Monitoring**: Set up alerts for errors and rate limits
2. **Backups**: Regular backups of configuration
3. **Updates**: Keep dependencies updated
4. **Security Audits**: Regular security reviews

### Maintenance

1. **Review Logs**: Weekly log review
2. **Update Prompts**: Refine system prompts based on user feedback
3. **Performance Tuning**: Optimize based on usage patterns
4. **Security Updates**: Apply security patches promptly

## API Reference

### POST /api/chatbot

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Do you have Rick Owens Geobaskets in size 42?"
    }
  ]
}
```

**Response:**
- Streaming response (text/event-stream)
- Headers include rate limit information

**Error Responses:**
- `400`: Invalid request format
- `429`: Rate limit exceeded
- `500`: Internal server error
- `503`: Service unavailable (missing API key)

## Dependencies

### Required

- `next`: ^16.0.7
- `react`: ^19.2.1
- `ai`: ^6.0.6
- `@ai-sdk/openai`: Latest
- `react-markdown`: Latest
- `lucide-react`: ^0.525.0

### Optional (for enhanced features)

- `redis`: For distributed rate limiting
- `@sentry/nextjs`: Error tracking
- `zod`: Enhanced input validation

## Support & Contributions

For issues, questions, or contributions:
1. Check this documentation first
2. Review code comments
3. Open an issue with detailed information
4. Follow security best practices for contributions

## License

This chatbot implementation is part of the Vette Archive project. All security measures and best practices should be maintained when modifying or extending this code.

---

**Last Updated**: 2024
**Version**: 1.0.0
**Maintainer**: Vette Archive Development Team

