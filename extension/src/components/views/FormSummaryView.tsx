import React, { useEffect, useState } from 'react';
import { t } from '../../i18n';
import type { FormSection, Language } from '../../types';
import { summariseForm } from '../../ai/aiAdapter';

interface FormSummaryViewProps {
  sections: FormSection[];
  language: Language;
  darkMode: boolean;
  onStart: () => void;
}

interface AISummary {
  purpose: string;
  estimatedMinutes: number;
}

export default function FormSummaryView({ sections, language, darkMode, onStart }: FormSummaryViewProps) {
  const allFields = sections.flatMap((s) => s.fields);
  const totalFields = allFields.length;
  const formTitle = document.title || 'Government Form';

  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [loading, setLoading] = useState(true);

  const text = darkMode ? '#FAFAFA' : '#09090B';
  const muted = darkMode ? '#A1A1AA' : '#71717A';
  const surface2 = darkMode ? '#27272A' : '#F7F7F9';
  const border = darkMode ? '#3F3F46' : '#E5E5EA';
  const surface = darkMode ? '#18181B' : '#FFFFFF';

  useEffect(() => {
    const labels = allFields.map((f) => f.label);
    summariseForm(formTitle, labels, language)
      .then(setAiSummary)
      .catch(() => {
        // Offline fallback
        setAiSummary({
          purpose: language === 'hi'
            ? 'यह एक सरकारी फ़ॉर्म है। हम आपको प्रत्येक फ़ील्ड के माध्यम से मार्गदर्शन करेंगे।'
            : language === 'ta'
            ? 'இது ஒரு அரசு படிவம். நாங்கள் ஒவ்வொரு புலத்திலும் உங்களுக்கு வழிகாட்டுவோம்.'
            : 'This is a government form. We\'ll guide you through each field step by step.',
          estimatedMinutes: Math.max(5, Math.ceil(totalFields * 0.8)),
        });
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const estimatedMins = aiSummary?.estimatedMinutes ?? Math.ceil(totalFields * 0.8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: text, marginBottom: '12px', lineHeight: 1.3 }}>
          {formTitle}
        </h2>

        {/* Plain words card */}
        <div style={{ background: surface2, borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px' }}>✨</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#5B5BD6', letterSpacing: '0.5px' }}>
              {language === 'hi' ? 'सरल शब्दों में' : language === 'ta' ? 'எளிய வார்த்தைகளில்' : 'IN PLAIN WORDS'}
            </span>
          </div>
          {loading ? (
            <div style={{ height: '56px', background: border, borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
          ) : (
            <p style={{ fontSize: '14px', color: text, lineHeight: 1.6, margin: 0 }}>{aiSummary?.purpose}</p>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', border: `1px solid ${border}`, borderRadius: '8px', marginBottom: '16px', overflow: 'hidden' }}>
          {[
            { value: totalFields, label: t(language, 'statsFields') },
            { value: `~${estimatedMins}`, label: t(language, 'statsTime') },
          ].map((stat, i) => (
            <div key={i} style={{
              flex: 1,
              padding: '14px',
              borderRight: i < 1 ? `1px solid ${border}` : 'none',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#5B5BD6' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: muted, marginTop: '2px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Sections preview */}
        {sections.length > 1 && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: muted, letterSpacing: '0.5px', marginBottom: '8px' }}>
              {language === 'hi' ? 'अनुभाग' : language === 'ta' ? 'பிரிவுகள்' : 'SECTIONS'}
            </p>
            {sections.map((s, i) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderBottom: `1px solid ${border}` }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: muted, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontSize: '13px', color: text }}>{s.title}</span>
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: muted }}>{s.fields.length} {t(language, 'statsFields')}</span>
              </div>
            ))}
          </div>
        )}

        {/* Privacy note */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '12px', background: surface2, borderRadius: '8px', border: `1px solid ${border}` }}>
          <span style={{ fontSize: '14px' }}>🔒</span>
          <p style={{ fontSize: '12px', color: muted, margin: 0, lineHeight: 1.5 }}>
            {t(language, 'privacyNote')}
          </p>
        </div>
      </div>

      {/* Fixed footer */}
      <div style={{ padding: '16px 20px', borderTop: `1px solid ${border}`, background: surface }}>
        <button
          onClick={onStart}
          style={{
            width: '100%',
            padding: '12px',
            background: '#5B5BD6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#4747C2')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#5B5BD6')}
        >
          {t(language, 'startGuide')}
        </button>
      </div>
    </div>
  );
}
