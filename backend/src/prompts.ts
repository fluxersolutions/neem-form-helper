import type { Language } from './types.js';

export const PROMPTS = {
  /**
   * Field explanation prompt.
   * Placeholders: {language}, {label}, {context}
   */
  fieldExplanation: (language: Language, label: string, context: string): string =>
    `You are helping a user fill a government form in India. Explain this form field in plain language in ${language}. Field label: ${label}. Context: ${context}. Keep it under 60 words. No legal advice.`,

  /**
   * Form summary prompt.
   * Placeholders: {language}, {title}, {fields}
   */
  formSummary: (language: Language, title: string, fields: string): string =>
    `Summarize what this government form is for in 2 sentences in ${language}. Form title: ${title}. Fields: ${fields}.`,

  /**
   * Chat prompt.
   * Placeholders: {language}, {formTitle}, {currentField}, {message}
   */
  chat: (
    language: Language,
    formTitle: string,
    currentField: string,
    message: string
  ): string =>
    `You are Neem, an AI helping fill a government form. Answer in ${language}. Context: form is ${formTitle}, user is on field ${currentField}. User question: ${message}. Answer in under 100 words. No legal advice.`,
};
