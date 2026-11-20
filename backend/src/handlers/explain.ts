import type { Request, Response } from 'express';
import type { FormField, Language, FieldExplanation } from '../types.js';
import { PROMPTS } from '../prompts.js';
import { callAI } from '../providers.js';

interface ExplainRequestBody {
  fields?: unknown;
  language?: unknown;
}

function isValidLanguage(lang: unknown): lang is Language {
  return lang === 'en' || lang === 'hi' || lang === 'ta';
}

function isFormField(f: unknown): f is FormField {
  if (!f || typeof f !== 'object') return false;
  const field = f as Record<string, unknown>;
  return (
    typeof field.id === 'string' &&
    typeof field.label === 'string' &&
    typeof field.type === 'string' &&
    typeof field.required === 'boolean' &&
    typeof field.hasValue === 'boolean' &&
    // Never allow 'element' (HTMLElement) or actual typed values
    !('element' in field)
  );
}

/**
 * Strip any fields that shouldn't reach the LLM:
 * - Remove 'element' (DOM reference)
 * - Set hasValue to boolean (never the actual value)
 */
function sanitiseField(field: FormField): Omit<FormField, 'element'> {
  const { id, label, type, required, placeholder, section, ariaLabel, hasValue, validationError } =
    field;
  return { id, label, type, required, placeholder, section, ariaLabel, hasValue, validationError };
}

export async function explainHandler(req: Request, res: Response): Promise<void> {
  const body = req.body as ExplainRequestBody;

  if (!Array.isArray(body.fields) || body.fields.length === 0) {
    res.status(400).json({ error: 'fields must be a non-empty array' });
    return;
  }

  const language: Language = isValidLanguage(body.language) ? body.language : 'en';

  const fields = body.fields.filter(isFormField);
  if (fields.length === 0) {
    res.status(400).json({ error: 'No valid FormField objects in fields array' });
    return;
  }

  try {
    const explanations: Record<string, FieldExplanation> = {};

    // Process fields in parallel (up to 5 at a time to be courteous to API quotas)
    const BATCH = 5;
    for (let i = 0; i < fields.length; i += BATCH) {
      const batch = fields.slice(i, i + BATCH);
      await Promise.all(
        batch.map(async (field) => {
          const sanitised = sanitiseField(field);
          const context = [
            sanitised.section ? `Section: ${sanitised.section}` : '',
            sanitised.placeholder ? `Placeholder: ${sanitised.placeholder}` : '',
            sanitised.ariaLabel ? `Aria label: ${sanitised.ariaLabel}` : '',
            `Type: ${sanitised.type}`,
            sanitised.required ? 'Required field' : 'Optional field',
          ]
            .filter(Boolean)
            .join('. ');

          const prompt = PROMPTS.fieldExplanation(language, sanitised.label, context);
          const explanation = await callAI(prompt);

          explanations[field.id] = {
            label: field.label,
            explanation,
          };
        })
      );
    }

    res.json({ explanations });
  } catch (err) {
    console.error('explain error', err);
    res.status(502).json({ error: 'Failed to generate explanations' });
  }
}
