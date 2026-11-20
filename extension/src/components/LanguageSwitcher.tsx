import React, { useEffect, useRef } from 'react';
import { t } from '../i18n';
import type { Language } from '../types';

interface LanguageSwitcherProps {
  currentLanguage: Language;
  onSelect: (lang: Language) => void;
  onClose: () => void;
  darkMode: boolean;
}

const LANGUAGES: Array<{ code: Language; label: string; native: string; detected?: boolean }> = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
];

export default function LanguageSwitcher({ currentLanguage, onSelect, onClose, darkMode }: LanguageSwitcherProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const bg = darkMode ? '#27272A' : '#FFFFFF';
  const textColor = darkMode ? '#FAFAFA' : '#09090B';

  return (
    <div
      ref={ref}
      role="listbox"
      aria-label="Select language"
      style={{
        position: 'absolute',
        top: '48px',
        right: '72px',
        width: '200px',
        background: bg,
        border: '1px solid #E5E5EA',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        zIndex: 100,
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {LANGUAGES.map((lang) => {
        const isSelected = lang.code === currentLanguage;
        return (
          <button
            key={lang.code}
            role="option"
            aria-selected={isSelected}
            onClick={() => onSelect(lang.code)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '12px 16px',
              background: isSelected ? '#F0F0FF' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'inherit',
              borderBottom: '1px solid #E5E5EA',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = '#F7F7F9';
            }}
            onMouseLeave={(e) => {
              if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: isSelected ? 600 : 400, color: textColor }}>
                {lang.native}
              </div>
              <div style={{ fontSize: '11px', color: '#71717A' }}>{lang.label}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {lang.detected && (
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    background: '#E8F5E9',
                    color: '#22C55E',
                    borderRadius: '4px',
                    fontWeight: 600,
                  }}
                >
                  Detected
                </span>
              )}
              {isSelected && <span style={{ color: '#5B5BD6', fontSize: '14px' }}>✓</span>}
            </div>
          </button>
        );
      })}
    </div>
  );
}
