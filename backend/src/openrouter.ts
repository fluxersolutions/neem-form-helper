/**
 * OpenRouter client – routes to free/cheap models as a final fallback.
 * Default model: mistralai/mistral-7b-instruct (free tier).
 */

const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'mistralai/mistral-7b-instruct:free';

interface OpenAICompatResponse {
  choices: Array<{ message: { content: string } }>;
}

export async function callOpenRouter(prompt: string, model = DEFAULT_MODEL): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');

  const response = await fetch(`${OPENROUTER_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://github.com/fluxersolutions/neem-form-helper',
      'X-Title': 'Neem AI Form Assistant',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 512,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${err}`);
  }

  const data = (await response.json()) as OpenAICompatResponse;
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('No text in OpenRouter response');
  return text.trim();
}
