export interface FormField {
  id: string;
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  label: string;
  type: string;
  placeholder: string;
  required: boolean;
  value: string;        // always '' — never expose typed values
  hasValue: boolean;    // boolean flag only
  sectionId: string;
  stepIndex: number;
  explanation?: string;
  example?: string;
  tip?: string;
}

export interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
}

export type Language = 'en' | 'hi' | 'ta';

export type ViewState = 'summary' | 'guided-fill' | 'chat' | 'review' | 'settings';

export interface PanelState {
  isOpen: boolean;
  isMinimized: boolean;
  currentView: ViewState;
  currentFieldIndex: number;
  language: Language;
  fontSize: 'normal' | 'large' | 'xlarge';
  darkMode: boolean;
  showFloatingIcon: boolean;
  autoStartGuidedFill: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ReviewIssue {
  fieldId: string;
  label: string;
  reason: string;
}

export interface StoredSettings {
  language: Language;
  fontSize: 'normal' | 'large' | 'xlarge';
  darkMode: boolean;
  showFloatingIcon: boolean;
  autoStartGuidedFill: boolean;
  hasSeenNudge: boolean;
}
