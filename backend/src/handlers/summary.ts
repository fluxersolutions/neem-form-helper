import type { Request, Response } from 'express';
import type { FormField, Language, FormSummary } from '../types.js';
import { PROMPTS } from '../prompts.js';
import { callGemini } from '../gemini.js';

interface SummaryRequestBody {
  formTitle?: unknown;
  fields?: unknown;
  language?: unknown;
}

function isValidLanguage(lang: unknown): lang is Language {
  return lang === 'en' || lang === 'hi' || lang === 'ta';
}

export async function summaryHandler(req: Request, res: Response): Promise<void> {
  const body = req.body as SummaryRequestBody;

  if (typeof body.formTitle !== 'string' || body.formTitle.trim() === '') {
    res.status(400).json({ error: 'formTitle must be a non-empty string' });
    return;
  }

  if (!Array.isArray(body.fields)) {
    res.status(400).json({ error: 'fields must be an array' });
    return;
  }

  const language: Language = isValidLanguage(body.language) ? body.language : 'en';
  const formTitle = (body.formTitle as string).trim();

  // Build a compact field list (labels only) to pass to the LLM
  const fieldLabels = (body.fields as unknown[])
    .filter((f): f is FormField => !!f && typeof f === 'object' && typeof (f as FormField).label === 'string')
    .map((f) => f.label)
    .slice(0, 30) // cap to avoid huge prompts
    .join(', ');

  try {
    const prompt = PROMPTS.formSummary(language, formTitle, fieldLabels);
    const purposeText = await callGemini(prompt);

    const summary: FormSummary = {
      title: formTitle,
      purpose: purposeText,
      estimatedMinutes: Math.max(5, Math.ceil((body.fields as unknown[]).length * 1.5)),
      fieldCount: (body.fields as unknown[]).length,
    };

    res.json({ summary });
  } catch (err) {
    console.error('summary error', err);
    res.status(502).json({ error: 'Failed to generate summary' });
  }
}
