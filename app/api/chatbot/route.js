import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { streamText, createDataStreamResponse } from "ai";
import { initialMessage } from "@/lib/data";
import rateLimiter from "@/lib/rateLimit";
import { getCORSHeaders, validateOrigin } from "@/lib/cors";
import { 
  sanitizeInput, 
  detectPromptInjection, 
  validateMessages, 
  getRateLimitIdentifier,
  validateResponse
} from "@/lib/security";
import { safeLog } from "@/lib/logScrubber";

/**
 * Chatbot API Route
 * 
 * Security Features:
 * - Rate limiting (10 requests per minute per IP/user)
 * - XSS protection via input sanitization
 * - Prompt injection detection
 * - Message validation
 * - CSRF protection (handled by Next.js)
 * - Secure API key storage (environment variables)
 * 
 * Requirements:
 * - Install @ai-sdk/openai: npm install @ai-sdk/openai
 * - Set OPENAI_API_KEY environment variable
 */

// Rate limit configuration
const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute

export async function POST(request) {
  const corsHeaders = getCORSHeaders(request);
  let userId = null; // Declare outside try block for use in catch
  
  try {
    // Validate origin before processing
    if (!validateOrigin(request)) {
      safeLog('warn', 'Chatbot API: Unauthorized origin attempt', {
        origin: request.headers.get('origin')
      });
      return NextResponse.json(
        { error: "Unauthorized origin" },
        { 
          status: 403,
          headers: corsHeaders
        }
      );
    }
    
    // Get authentication (optional - chatbot can work for anonymous users)
    try {
      const auth = getAuth(request);
      userId = auth?.userId || null;
    } catch (authError) {
      // If auth fails, continue as anonymous user
      userId = null;
    }
    
    // Get improved identifier for rate limiting (combines IP + session ID)
    const identifier = getRateLimitIdentifier(request, userId);
    
    // Rate limiting check
    const rateLimitResult = rateLimiter.checkLimit(
      identifier,
      RATE_LIMIT_REQUESTS,
      RATE_LIMIT_WINDOW_MS
    );
    
    if (!rateLimitResult.allowed) {
      safeLog('warn', 'Chatbot API: Rate limit exceeded', {
        identifier: identifier.substring(0, 20) + '...', // Partial identifier for logging
        resetAt: rateLimitResult.resetAt.toISOString()
      });
      
      return NextResponse.json(
        { 
          error: "Rate limit exceeded. Please try again later.",
          resetAt: rateLimitResult.resetAt.toISOString()
        },
        { 
          status: 429,
          headers: {
            ...corsHeaders,
            'X-RateLimit-Limit': RATE_LIMIT_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
            'Retry-After': Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000).toString()
          }
        }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      safeLog('error', 'Chatbot API: Invalid JSON in request body', { error: error.message });
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    const { messages } = body;

    // Validate messages array
    if (!validateMessages(messages)) {
      safeLog('warn', 'Chatbot API: Invalid messages format', {
        messageCount: Array.isArray(messages) ? messages.length : 'not-array'
      });
      return NextResponse.json(
        { error: "Invalid messages format. Expected array of message objects with 'role' and 'content'." },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Sanitize and validate each user message
    const sanitizedMessages = messages.map((msg) => {
      if (msg.role === 'user') {
        const sanitized = sanitizeInput(msg.content);
        
        // Check for prompt injection (normalized, case-insensitive)
        if (detectPromptInjection(msg.content)) {
          safeLog('warn', 'Chatbot API: Prompt injection attempt detected', {
            userId: userId || 'anonymous',
            messageLength: msg.content.length
          });
          throw new Error("Suspicious input detected. Please rephrase your question.");
        }
        
        return {
          ...msg,
          content: sanitized
        };
      }
      return msg;
    });

    // Check for OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      safeLog('error', 'Chatbot API: OPENAI_API_KEY not configured');
      return NextResponse.json(
        { error: "Chatbot service is currently unavailable. Please try again later." },
        { 
          status: 503,
          headers: corsHeaders
        }
      );
    }

    // Build conversation context with system message
    const conversationMessages = [
      initialMessage,
      ...sanitizedMessages
    ];

    // Dynamic import of OpenAI provider
    let openai;
    try {
      const openaiModule = await import("@ai-sdk/openai");
      openai = openaiModule.openai;
    } catch (error) {
      safeLog('error', 'Chatbot API: Failed to import @ai-sdk/openai', {
        errorMessage: error.message?.substring(0, 100)
      });
      return NextResponse.json(
        { error: "Chatbot service configuration error. Please contact support." },
        { 
          status: 503,
          headers: corsHeaders
        }
      );
    }

    // Generate AI response using Vercel AI SDK
    // Note: streamText returns immediately (not a promise), so don't await it
    const result = streamText({
      model: openai('gpt-4o-mini'), // Using cost-effective model
      messages: conversationMessages,
      maxTokens: 1000,
      temperature: 0.7,
      onFinish: async ({ text, usage }) => {
        // Validate response for sensitive information leakage
        if (validateResponse(text)) {
          safeLog('warn', 'Chatbot API: Response contains potentially sensitive information', {
            userId: userId || 'anonymous',
            responseLength: text.length
          });
          // Note: We still return the response, but log the warning
          // In production, you might want to filter or redact specific patterns
        }
        
        // Safe logging - never log full messages or model text
        if (process.env.NODE_ENV === 'production') {
          safeLog('info', 'Chatbot usage', {
            userId: userId || 'anonymous',
            tokens: usage?.totalTokens || 0,
            timestamp: new Date().toISOString()
            // Intentionally NOT logging: messages, text, or any PII
          });
        }
      }
    });

    // Return streaming response with CORS headers
    // In AI SDK v6, streamText returns an object with toDataStreamResponse method
    // This method formats the stream correctly for useChat hook
    if (!result) {
      safeLog('error', 'Chatbot API: streamText returned null/undefined');
      return NextResponse.json(
        { error: "Chatbot service configuration error. Please contact support." },
        { 
          status: 503,
          headers: corsHeaders
        }
      );
    }

    // Check for toDataStreamResponse method (preferred)
    if (typeof result.toDataStreamResponse === 'function') {
      try {
        const allHeaders = {
          ...corsHeaders,
          'X-RateLimit-Limit': RATE_LIMIT_REQUESTS.toString(),
          'X-RateLimit-Remaining': (rateLimitResult.remaining - 1).toString(),
          'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
        };
        
        return result.toDataStreamResponse({
          headers: allHeaders
        });
      } catch (streamError) {
        safeLog('error', 'Chatbot API: Error calling toDataStreamResponse', {
          errorMessage: streamError.message?.substring(0, 100),
          errorType: streamError.name
        });
        throw streamError;
      }
    }
    
    // Fallback: The result has baseStream but not toDataStreamResponse
    // We need to manually format the stream for useChat hook
    // Check for available stream properties (baseStream is what we have)
    const availableStream = result.textStream || result.fullStream || result.baseStream;
    
    if (availableStream) {
      try {
        // Create a readable stream formatted for useChat hook
        // useChat expects data stream format: "0:" prefix for text chunks
        const readableStream = new ReadableStream({
          async start(controller) {
            try {
              // Iterate over the stream chunks
              for await (const chunk of availableStream) {
                // Extract text from chunk - handle different chunk formats
                let text = '';
                if (typeof chunk === 'string') {
                  text = chunk;
                } else if (chunk && typeof chunk === 'object') {
                  // Handle different chunk object formats
                  text = chunk.text || chunk.content || chunk.delta?.text || '';
                  if (!text && chunk.type === 'text-delta') {
                    text = chunk.textDelta || '';
                  }
                }
                
                // Format as data stream: "0:" prefix + JSON stringified text + newline
                // This is the format @ai-sdk/react useChat expects
                if (text) {
                  const data = `0:${JSON.stringify(text)}\n`;
                  controller.enqueue(new TextEncoder().encode(data));
                }
              }
              controller.close();
            } catch (error) {
              safeLog('error', 'Chatbot API: Error in stream processing', {
                errorMessage: error.message?.substring(0, 100)
              });
              controller.error(error);
            }
          }
        });
        
        const allHeaders = {
          ...corsHeaders,
          'Content-Type': 'text/plain; charset=utf-8',
          'X-RateLimit-Limit': RATE_LIMIT_REQUESTS.toString(),
          'X-RateLimit-Remaining': (rateLimitResult.remaining - 1).toString(),
          'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
        };
        
        return new Response(readableStream, { headers: allHeaders });
      } catch (streamError) {
        safeLog('error', 'Chatbot API: Error creating stream response', {
          errorMessage: streamError.message?.substring(0, 100),
          errorType: streamError.name
        });
        throw streamError;
      }
    }
    
    // If neither method works, log and return error
    safeLog('error', 'Chatbot API: streamText result structure unexpected', {
      resultType: typeof result,
      hasResult: !!result,
      resultKeys: result ? Object.keys(result).slice(0, 15).join(', ') : 'null',
      hasToDataStreamResponse: result && typeof result.toDataStreamResponse,
      hasBaseStream: result && !!result.baseStream,
    });
    
    return NextResponse.json(
      { error: "Chatbot service configuration error. Please contact support." },
      { 
        status: 503,
        headers: corsHeaders
      }
    );

  } catch (error) {
    // Safe error logging - scrub any PII
    safeLog('error', 'Chatbot API error', {
      errorType: error.name,
      errorMessage: error.message?.substring(0, 100), // Truncate to avoid logging full messages
      userId: userId || 'anonymous'
    });
    
    // Don't expose internal error details to client
    const errorMessage = error.message?.includes("Suspicious input") 
      ? error.message 
      : "An error occurred while processing your request. Please try again.";
    
    return NextResponse.json(
      { error: errorMessage },
      { 
        status: error.message?.includes("Suspicious input") ? 400 : 500,
        headers: corsHeaders
      }
    );
  }
}

// Handle OPTIONS for CORS with origin validation
export async function OPTIONS(request) {
  const corsHeaders = getCORSHeaders(request);
  
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
