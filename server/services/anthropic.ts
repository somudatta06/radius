import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function chat(messages: ChatMessage[], options: {
  model?: string;
  temperature?: number;
  maxTokens?: number;
} = {}): Promise<string> {
  const {
    model = 'claude-3-5-sonnet-20240620',
    temperature = 0.7,
    maxTokens = 2000,
  } = options;

  try {
    // Separate system message if present
    let systemPrompt = '';
    const userMessages = messages.filter(msg => {
      if (msg.role === 'user' && msg.content.startsWith('SYSTEM:')) {
        systemPrompt = msg.content.replace('SYSTEM:', '').trim();
        return false;
      }
      return true;
    });

    const completion = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt || undefined,
      messages: userMessages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    });

    return completion.content[0].type === 'text' ? completion.content[0].text : '';
  } catch (error) {
    console.error('Anthropic API error:', error);
    throw new Error('Failed to get AI response');
  }
}

export async function analyzeWithGPT(prompt: string, options?: {
  systemPrompt?: string;
  jsonMode?: boolean;
  temperature?: number;
}): Promise<string> {
  const messages: ChatMessage[] = [];
  
  // If systemPrompt is provided, prepend it to the user message
  let fullPrompt = prompt;
  if (options?.systemPrompt) {
    fullPrompt = `SYSTEM: ${options.systemPrompt}\n\n${prompt}`;
  }
  
  // If JSON mode is requested, add JSON instruction
  if (options?.jsonMode) {
    fullPrompt += '\n\nRespond with valid JSON only. No additional text before or after the JSON.';
  }
  
  messages.push({ role: 'user', content: fullPrompt });

  return chat(messages, {
    temperature: options?.temperature,
  });
}
