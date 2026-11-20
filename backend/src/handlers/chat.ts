import type { Request, Response } from 'express';
import type { FormContext, Language } from '../types.js';
import { PROMPTS } from '../prompts.js';
import { callGemini } from '../gemini.js';

interface ChatRequestBody {
  message?: unknown;
  context?: unknown;
  language?: unknown;
}

function isValidLanguage(lang: unknown): lang is Language {
  return lang === 'en' || lang === 'hi' || lang === 'ta';
}

function isFormContext(ctx: unknown): ctx is FormContext {
  if (!ctx || typeof ctx !== 'object') return false;
  const c = ctx as Record<string, unknown>;
  return typeof c.formTitle === 'string' && typeof c.currentField === 'string';
}

export async function chatHandler(req: Request, res: Response): Promise<void> {
  const body = req.body as ChatRequestBody;

  if (typeof body.message !== 'string' || body.message.trim() === '') {
    res.status(400).json({ error: 'message must be a non-empty string' });
    return;
  }

  if (!isFormContext(body.context)) {
    res.status(400).json({ error: 'context must include formTitle and currentField' });
    return;
  }

  const language: Language = isValidLanguage(body.language) ? body.language : 'en';
  const context = body.context as FormContext;

  // Truncate message to prevent prompt injection via very long inputs
  const safeMessage = body.message.trim().slice(0, 500);

  try {
    const prompt = PROMPTS.chat(language, context.formTitle, context.currentField, safeMessage);
    const reply = await callGemini(prompt);
    res.json({ reply });
  } catch (err) {
    console.error('chat error', err);
    res.status(502).json({ error: 'Failed to generate reply' });
  }
}
