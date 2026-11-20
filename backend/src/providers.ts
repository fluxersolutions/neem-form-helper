/**
 * Provider dispatcher – tries Gemini → Grok → OpenRouter in order.
 * Pass `provider` to force a specific one (useful for testing).
 */
import { callGemini } from './gemini.js';
import { callGrok } from './grok.js';
import { callOpenRouter } from './openrouter.js';

export type AIProvider = 'gemini' | 'grok' | 'openrouter' | 'auto';

const PROVIDER_ORDER: Exclude<AIProvider, 'auto'>[] = ['gemini', 'grok', 'openrouter'];

export async function callAI(prompt: string, provider: AIProvider = 'auto'): Promise<string> {
  const sequence = provider === 'auto' ? PROVIDER_ORDER : [provider as Exclude<AIProvider, 'auto'>];
  let lastError: Error | null = null;

  for (const p of sequence) {
    try {
      switch (p) {
        case 'gemini':     return await callGemini(prompt);
        case 'grok':       return await callGrok(prompt);
        case 'openrouter': return await callOpenRouter(prompt);
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[Neem] Provider "${p}" failed: ${lastError.message}`);
    }
  }

  throw lastError ?? new Error('All AI providers failed');
}
