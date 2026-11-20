// Modular AI adapter – swap providers without touching calling code.
// Priority: Gemini → Grok → OpenRouter (free models)
// All calls go through the backend proxy; API keys never enter the extension.

export type AIProvider = 'gemini' | 'grok' | 'openrouter';
export type Language = 'en' | 'hi' | 'ta';

export interface FieldExplanation {
  plain: string;       // plain-language explanation
  whatToType: string;  // concise example
  tip: string;         // common mistake warning
}

export interface FormSummaryAI {
  purpose: string;
  estimatedMinutes: number;
}

export interface ChatReply {
  answer: string;
  suggestedFollowUps: string[];
}

export interface AIRequest<T> {
  type: 'explain' | 'summary' | 'chat';
  payload: T;
  language: Language;
}

// ─── Proxy base URL ──────────────────────────────────────────────────────────
// In production this comes from extension storage; fallback to localhost for dev
async function getProxyBase(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.local.get({ proxyUrl: 'http://localhost:3001' }, (r) =>
      resolve(r.proxyUrl as string)
    );
  });
}

// ─── PII masking (also done on backend; defence-in-depth) ───────────────────
function maskPII(text: string): string {
  return text
    .replace(/\b\d{12}\b/g, '[AADHAAR]')           // Aadhaar
    .replace(/[A-Z]{5}\d{4}[A-Z]\b/g, '[PAN]')     // PAN
    .replace(/\b[6-9]\d{9}\b/g, '[PHONE]')          // Indian mobile
    .replace(/[\w.+-]+@[\w-]+\.[a-z]{2,}/gi, '[EMAIL]');
}

// ─── Generic fetch with provider fallback ───────────────────────────────────
async function proxyFetch<T>(
  endpoint: string,
  body: object,
  providers: AIProvider[] = ['gemini', 'grok', 'openrouter']
): Promise<T> {
  const base = await getProxyBase();
  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      const res = await fetch(`${base}/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, provider }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as T;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[Neem] AI provider "${provider}" failed:`, lastError.message);
    }
  }
  throw lastError ?? new Error('All AI providers failed');
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Explain a single form field.
 * Strips typed values; sends only the label, type, and context.
 */
export async function explainField(
  label: string,
  fieldType: string,
  language: Language,
  formTitle?: string
): Promise<FieldExplanation> {
  const safeLabel = maskPII(label);
  return proxyFetch<FieldExplanation>('explain', {
    label: safeLabel,
    fieldType,
    language,
    formTitle: formTitle ? maskPII(formTitle) : undefined,
  });
}

/**
 * Summarise what a form is for (universal – works for any government e-form).
 */
export async function summariseForm(
  formTitle: string,
  fieldLabels: string[],
  language: Language
): Promise<FormSummaryAI> {
  return proxyFetch<FormSummaryAI>('summary', {
    formTitle: maskPII(formTitle),
    fieldLabels: fieldLabels.map(maskPII).slice(0, 60), // cap token count
    language,
  });
}

/**
 * Chat about the form in the user's chosen language (en / hi / ta).
 */
export async function chatAboutForm(
  question: string,
  currentFieldLabel: string,
  formTitle: string,
  language: Language
): Promise<ChatReply> {
  return proxyFetch<ChatReply>('chat', {
    question: maskPII(question),
    currentFieldLabel: maskPII(currentFieldLabel),
    formTitle: maskPII(formTitle),
    language,
  });
}

/**
 * Offline / AI-down fallback: return generic explanation from field metadata.
 */
export function offlineFallback(label: string, language: Language): FieldExplanation {
  const fallbacks: Record<Language, (l: string) => FieldExplanation> = {
    en: (l) => ({
      plain: `Enter your ${l.toLowerCase()}.`,
      whatToType: 'As shown on your official documents.',
      tip: 'Double-check spelling before proceeding.',
    }),
    hi: (l) => ({
      plain: `अपना ${l.toLowerCase()} दर्ज करें।`,
      whatToType: 'अपने आधिकारिक दस्तावेज़ के अनुसार।',
      tip: 'आगे बढ़ने से पहले वर्तनी जाँचें।',
    }),
    ta: (l) => ({
      plain: `உங்கள் ${l.toLowerCase()} உள்ளிடுங்கள்.`,
      whatToType: 'உங்கள் அதிகாரப்பூர்வ ஆவணங்களில் உள்ளபடி.',
      tip: 'தொடர்வதற்கு முன் எழுத்துப்பிழை சரிபார்க்கவும்.',
    }),
  };
  return fallbacks[language](label);
}
