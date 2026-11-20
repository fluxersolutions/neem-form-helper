import type { Language } from '../types';

const en = {
  // App
  appName: 'Neem',
  tagline: 'Form Assistant',

  // Popup
  activeOnPage: 'Active on this page',
  inactiveOnPage: 'No form detected',
  showFloatingIcon: 'Show floating icon',
  guidedFillAutoStart: 'Guided fill auto-start',
  language: 'Language',
  fontSize: 'Font size',
  fontSizeNormal: 'A',
  fontSizeLarge: 'A+',
  fontSizeXLarge: 'A++',
  darkMode: 'Dark mode',

  // Nudge
  nudgeTitle: 'Need help with this form?',
  nudgeYes: 'Yes, help me',
  nudgeNo: 'Not now',

  // Form Summary
  summaryTitle: 'Form Overview',
  summaryExplanation: 'This form collects your basic information. We will guide you through each field step by step.',
  statsFields: 'fields',
  statsTime: 'min',
  statsDocs: 'documents',
  keepReadyTitle: 'Keep these ready',
  startGuide: 'Start guide',
  privacyNote: '🔒 Your data never leaves your device',

  // Guided Fill
  onTheForm: 'ON THE FORM',
  whatThisMeans: 'WHAT THIS MEANS',
  whatToType: 'WHAT TO TYPE',
  tipLabel: 'Tip',
  backButton: 'Back',
  nextButton: 'Next',
  highlightButton: 'Highlight',
  askPlaceholder: 'Ask about this field…',
  fieldOf: 'of',
  step: 'Step',

  // Chat
  chatTitle: 'Ask Neem',
  chatPlaceholder: 'Type your question…',
  sendButton: 'Send',
  micButton: 'Voice input',

  // Review
  reviewTitle: 'Almost there!',
  needsAttention: 'NEEDS ATTENTION',
  looksGood: 'LOOKS GOOD',
  goToField: 'Go to field',
  reviewCTA: 'Review my form',
  complete: 'complete',

  // Settings
  settingsTitle: 'Settings',
  languageLabel: 'Language',
  fontSizeLabel: 'Font size',
  darkModeLabel: 'Dark mode',

  // Language names
  english: 'English',
  hindi: 'हिन्दी',
  tamil: 'தமிழ்',
  detected: 'Detected',

  // Panel
  minimize: 'Minimize',
  close: 'Close',
};

export type Translations = typeof en;
export default en;
