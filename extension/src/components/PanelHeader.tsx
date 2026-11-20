import React, { useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { t } from '../i18n';
import type { Language, ViewState } from '../types';

interface PanelHeaderProps {
  language: Language;
  darkMode: boolean;
  isMinimized: boolean;
  currentView: ViewState;
  onLanguageChange: (lang: Language) => void;
  onMinimize: () => void;
  onClose: () => void;
  onSettings: () => void;
  onBack: () => void;
}

export default function PanelHeader({
  language,
  darkMode,
  isMinimized,
  currentView,
  onLanguageChange,
  onMinimize,
  onClose,
  onSettings,
  onBack,
}: PanelHeaderProps) {
  const [showLangSwitcher, setShowLangSwitcher] = useState(false);
  const bg = darkMode ? '#18181B' : '#FFFFFF';
  const textColor = darkMode ? '#FAFAFA' : '#09090B';
  const mutedColor = darkMode ? '#71717A' : '#A1A1AA';

  const langLabels: Record<Language, string> = {
    en: 'EN',
    hi: 'हि',
    ta: 'த',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid #E5E5EA',
        background: bg,
        gap: '8px',
        position: 'relative',
      }}
    >
      {/* Back button for non-summary views */}
      {currentView !== 'summary' && !isMinimized && (
        <button
          onClick={onBack}
          aria-label="Back to summary"
          style={{
            color: '#5B5BD6',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '0 4px',
            lineHeight: 1,
          }}
        >
          ←
        </button>
      )}

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: '#5B5BD6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '14px',
          }}
        >
          S
        </div>
        <span style={{ fontWeight: 700, fontSize: '15px', color: textColor, letterSpacing: '-0.3px' }}>
          {t(language, 'appName')}
        </span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Language chip */}
      <button
        onClick={() => setShowLangSwitcher((p) => !p)}
        aria-label="Change language"
        aria-expanded={showLangSwitcher}
        style={{
          border: '1px solid #E5E5EA',
          borderRadius: '4px',
          padding: '3px 8px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#5B5BD6',
          background: 'transparent',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {langLabels[language]}
      </button>

      {/* Settings */}
      <button
        onClick={onSettings}
        aria-label="Settings"
        style={{
          color: mutedColor,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '17px',
          padding: '0 2px',
        }}
      >
        ⚙️
      </button>

      {/* Minimize */}
      <button
        onClick={onMinimize}
        aria-label={t(language, 'minimize')}
        title={t(language, 'minimize')}
        style={{
          color: mutedColor,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '17px',
          padding: '0 2px',
        }}
      >
        {isMinimized ? '◀' : '▶'}
      </button>

      {/* Close */}
      <button
        onClick={onClose}
        aria-label={t(language, 'close')}
        title={t(language, 'close')}
        style={{
          color: mutedColor,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '17px',
          padding: '0 2px',
        }}
      >
        ✕
      </button>

      {/* Language switcher dropdown */}
      {showLangSwitcher && (
        <LanguageSwitcher
          currentLanguage={language}
          onSelect={(lang) => {
            onLanguageChange(lang);
            setShowLangSwitcher(false);
          }}
          onClose={() => setShowLangSwitcher(false)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}
