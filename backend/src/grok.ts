/**
 * Grok (xAI) API client.
 * Grok uses an OpenAI-compatible API endpoint.
 */

const GROK_API_BASE = 'https://api.x.ai/v1';

interface OpenAICompatResponse {
  choices: Array<{ message: { content: string } }>;
}

export async function callGrok(prompt: string): Promise<string> {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) throw new Error('GROK_API_KEY is not set');

  const response = await fetch(`${GROK_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'grok-beta',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 512,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Grok API error ${response.status}: ${err}`);
  }

  const data = (await response.json()) as OpenAICompatResponse;
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('No text in Grok response');
  return text.trim();
}
