// Shared types used by handlers and prompts

export type Language = 'en' | 'hi' | 'ta';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'radio' | 'file' | 'date' | 'email' | 'tel';
  required: boolean;
  placeholder?: string;
  section?: string;
  ariaLabel?: string;
  hasValue: boolean;
  validationError?: string;
  // NOTE: 'element' (HTMLElement) is NEVER sent over the wire; it only exists client-side
}

export interface FormContext {
  formTitle: string;
  currentField: string;
  language: Language;
}

export interface FieldExplanation {
  label: string;
  explanation: string;
  tip?: string;
  example?: string;
}

export interface FormSummary {
  title: string;
  purpose: string;
  estimatedMinutes: number;
  fieldCount: number;
}
