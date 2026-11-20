import type { Language } from '../types';
import type { Translations } from './en';
import en from './en';
import hi from './hi';
import ta from './ta';

const translations: Record<Language, Translations> = { en, hi, ta };

export function t(lang: Language, key: keyof Translations): string {
  return translations[lang][key] ?? translations['en'][key] ?? key;
}

export { en, hi, ta };
export type { Translations };
