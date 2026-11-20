import type { Language, StoredSettings } from '../types';

export const DEFAULT_SETTINGS: StoredSettings = {
  language: 'en',
  fontSize: 'normal',
  darkMode: false,
  showFloatingIcon: true,
  autoStartGuidedFill: false,
  hasSeenNudge: false,
};

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {},
  hi: {},
  ta: {},
};

export async function getSettings(): Promise<StoredSettings> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (result) => {
      resolve(result as StoredSettings);
    });
  });
}

export async function saveSettings(partial: Partial<StoredSettings>): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set(partial, resolve);
  });
}
