// Shared TypeScript types for the Neem AI Form Assistant.
// Used by the Chrome extension, the backend proxy, and form guides.

// ---------------------------------------------------------------------------
// Field & Form types
// ---------------------------------------------------------------------------

export interface FormField {
  id: string;
  /**
   * DOM element reference — present only inside the extension content script.
   * MUST be stripped before any data leaves the browser (to backend or storage).
   */
  element?: HTMLElement;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'radio' | 'file' | 'date' | 'email' | 'tel';
  required: boolean;
  placeholder?: string;
  section?: string;
  ariaLabel?: string;
  /**
   * Whether the field currently has a value typed by the user.
   * Always a boolean — the actual value is NEVER transmitted.
   */
  hasValue: boolean;
  validationError?: string;
}

export interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
}

export interface Document {
  name: string;
  nameHi?: string;
  nameTa?: string;
  reason?: string;
}

export interface FormSummary {
  title: string;
  purpose: string;
  estimatedMinutes: number;
  fieldCount: number;
  documentsNeeded: Document[];
}

// ---------------------------------------------------------------------------
// API request / response types (backend ↔ extension)
// ---------------------------------------------------------------------------

export interface FieldExplanation {
  label: string;
  explanation: string;
  tip?: string;
  example?: string;
}

export interface ExplainRequest {
  fields: Omit<FormField, 'element'>[];
  language: Language;
}

export interface ExplainResponse {
  explanations: Record<string, FieldExplanation>;
}

export interface FormContext {
  formTitle: string;
  currentField: string;
  language: Language;
}

export interface ChatRequest {
  message: string;
  context: FormContext;
  language: Language;
}

export interface ChatResponse {
  reply: string;
}

export interface SummaryRequest {
  formTitle: string;
  fields: Omit<FormField, 'element'>[];
  language?: Language;
}

export interface SummaryResponse {
  summary: FormSummary;
}

// ---------------------------------------------------------------------------
// UI / Panel state types
// ---------------------------------------------------------------------------

export type Language = 'en' | 'hi' | 'ta';

export type ViewName = 'summary' | 'guided' | 'chat' | 'review' | 'settings' | 'done';

export interface PanelState {
  isOpen: boolean;
  view: ViewName;
  language: Language;
  currentFieldIndex: number;
  formFields: FormField[];
  formSections: FormSection[];
}
