import React from 'react';
import { t } from '../../i18n';
import type { Language, PanelState } from '../../types';

interface SettingsViewProps {
  state: PanelState;
  onStateChange: (s: PanelState) => void;
  language: Language;
  darkMode: boolean;
}

export default function SettingsView({ state, onStateChange, language, darkMode }: SettingsViewProps) {
  const text = darkMode ? '#FAFAFA' : '#09090B';
  const muted = darkMode ? '#A1A1AA' : '#71717A';
  const surface2 = darkMode ? '#27272A' : '#F7F7F9';
  const border = darkMode ? '#3F3F46' : '#E5E5EA';

  const update = (patch: Partial<PanelState>) => {
    const next = { ...state, ...patch };
    onStateChange(next);
    // Persist relevant settings
    chrome.storage.sync.set({
      language: next.language,
      fontSize: next.fontSize,
      darkMode: next.darkMode,
      showFloatingIcon: next.showFloatingIcon,
      autoStartGuidedFill: next.autoStartGuidedFill,
    });
  };

  const Row = ({ label, sublabel, children }: { label: string; sublabel?: string; children: React.ReactNode }) => (
    <div style={{ display: 'flex', alignItems: 'center', padding: '14px 0', borderBottom: `1px solid ${border}`, gap: '12px' }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '14px', color: text, margin: 0, fontWeight: 500 }}>{label}</p>
        {sublabel && <p style={{ fontSize: '12px', color: muted, margin: '2px 0 0' }}>{sublabel}</p>}
      </div>
      {children}
    </div>
  );

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      style={{
        width: '40px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
        background: value ? '#5B5BD6' : border, position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: '2px', left: value ? '18px' : '2px',
        width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      }} />
    </button>
  );

  return (
    <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: text, marginBottom: '20px' }}>{t(language, 'settingsTitle')}</h2>

      {/* Language */}
      <Row label={t(language, 'languageLabel')}>
        <select
          value={state.language}
          onChange={(e) => update({ language: e.target.value as Language })}
          style={{ padding: '6px 10px', borderRadius: '6px', border: `1px solid ${border}`, background: surface2, color: text, fontSize: '13px', fontFamily: 'inherit', cursor: 'pointer' }}
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="ta">தமிழ்</option>
        </select>
      </Row>

      {/* Font size */}
      <Row label={t(language, 'fontSizeLabel')}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['normal', 'large', 'xlarge'] as const).map((size, i) => (
            <button
              key={size}
              onClick={() => update({ fontSize: size })}
              aria-pressed={state.fontSize === size}
              style={{
                width: '36px', height: '36px', borderRadius: '6px',
                border: `1px solid ${state.fontSize === size ? '#5B5BD6' : border}`,
                background: state.fontSize === size ? '#EDEDFB' : surface2,
                color: state.fontSize === size ? '#5B5BD6' : text,
                fontSize: 10 + i * 2 + 'px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              A{i > 0 ? '+'.repeat(i) : ''}
            </button>
          ))}
        </div>
      </Row>

      {/* Dark mode */}
      <Row label={t(language, 'darkModeLabel')}>
        <Toggle value={state.darkMode} onChange={(v) => update({ darkMode: v })} />
      </Row>

      {/* Show floating icon */}
      <Row
        label={t(language, 'showFloatingIcon')}
        sublabel={language === 'hi' ? 'सरकारी फ़ॉर्म पर' : language === 'ta' ? 'அரசு படிவங்களில்' : 'On government forms'}
      >
        <Toggle value={state.showFloatingIcon} onChange={(v) => update({ showFloatingIcon: v })} />
      </Row>

      {/* Auto-start */}
      <Row label={t(language, 'guidedFillAutoStart')}>
        <Toggle value={state.autoStartGuidedFill} onChange={(v) => update({ autoStartGuidedFill: v })} />
      </Row>

      {/* Disclaimer */}
      <div style={{ marginTop: '24px', padding: '14px', background: surface2, borderRadius: '8px', border: `1px solid ${border}` }}>
        <p style={{ fontSize: '12px', color: muted, margin: 0, lineHeight: 1.6 }}>
          {language === 'hi'
            ? 'नीम केवल मार्गदर्शन प्रदान करता है — यह कानूनी, कर या पात्रता सलाह नहीं है। आधिकारिक निर्देशों के लिए पोर्टल देखें।'
            : language === 'ta'
            ? 'நீம் வழிகாட்டுதல் மட்டுமே வழங்குகிறது — இது சட்ட, வரி அல்லது தகுதி ஆலோசனை அல்ல.'
            : 'Neem provides guidance only — it is not legal, tax, or eligibility advice. Refer to the portal for official instructions.'}
        </p>
      </div>
    </div>
  );
}
