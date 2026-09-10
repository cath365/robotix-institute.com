import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createApiResponse, createErrorResponse, rateLimiter } from '@/lib/api-utils';
import { z } from 'zod';

const chatSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000, 'Message is too long'),
  context: z.object({
    topic: z.string().optional(),
    courseId: z.string().optional(),
    language: z.string().optional(),
  }).optional(),
});

// System prompt for the AI tutor
const SYSTEM_PROMPT = `You are an expert AI tutor for Robotix Institute, specializing in:
- Robotics fundamentals (sensors, actuators, control systems)
- Programming (Python, C++, Arduino, MicroPython)
- Electronics and circuit design
- IoT and embedded systems
- Machine learning for robotics

Guidelines:
1. Be friendly, patient, and encouraging
2. Explain concepts step by step with examples
3. Use analogies to make complex topics accessible
4. Provide code examples when relevant
5. Ask clarifying questions when the student's question is unclear
6. Encourage experimentation and hands-on learning
7. Reference common robotics components (Arduino, ESP32, Raspberry Pi)

Always respond in a helpful and educational manner.`;

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    // AI tutor can be used by unauthenticated users with rate limiting
    
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = user ? 60 : 10; // More requests for authenticated users
    if (!rateLimiter(ip, rateLimit, 60000)) {
      return NextResponse.json(
        createErrorResponse('Too many requests. Please wait a moment.'),
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = chatSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('Validation failed', validation.error.errors.map(e => e.message)),
        { status: 400 }
      );
    }

    const { message, context } = validation.data;

    // Check for AI API configuration
    const aiApiKey = process.env.AI_API_KEY;
    const aiApiUrl = process.env.AI_API_URL || 'https://api.openai.com/v1';

    if (!aiApiKey) {
      return NextResponse.json(
        createErrorResponse('OpenAI API key is not configured. Set AI_API_KEY in the server environment.'),
        { status: 503 }
      );
    }

    // Make request to AI API (OpenAI compatible)
    try {
      const aiResponse = await fetch(`${aiApiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiApiKey}`,
        },
        body: JSON.stringify({
          model: process.env.AI_MODEL || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: `${SYSTEM_PROMPT}\nCurrent lesson context: ${context?.topic || 'general robotics'}. Keep answers beginner-friendly and practical.` },
            { role: 'user', content: message },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!aiResponse.ok) {
        throw new Error('AI API request failed');
      }

      const data = await aiResponse.json();
      const reply = data.choices?.[0]?.message?.content || 'I apologize, I couldn\'t generate a response. Please try again.';

      return NextResponse.json(createApiResponse({
        message: reply,
        source: 'ai',
        usage: data.usage,
      }));
    } catch (aiError) {
      console.error('AI API error:', aiError);
      return NextResponse.json(
        createErrorResponse('OpenAI request failed. Please try again.'),
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('AI Tutor error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

