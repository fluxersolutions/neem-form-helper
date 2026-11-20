import React from 'react';
import { t } from '../../i18n';
import type { FormField, Language, ReviewIssue } from '../../types';

interface ReviewViewProps {
  fields: FormField[];
  language: Language;
  darkMode: boolean;
  onGoToField: (index: number) => void;
}

function detectIssues(fields: FormField[]): ReviewIssue[] {
  return fields
    .filter((f) => f.required && !f.hasValue)
    .map((f) => ({
      fieldId: f.id,
      label: f.label,
      reason: 'Still empty',
    }));
}

export default function ReviewView({ fields, language, darkMode, onGoToField }: ReviewViewProps) {
  const issues = detectIssues(fields);
  const complete = fields.length - issues.length;
  const pct = Math.round((complete / Math.max(fields.length, 1)) * 100);

  const text = darkMode ? '#FAFAFA' : '#09090B';
  const muted = darkMode ? '#A1A1AA' : '#71717A';
  const surface2 = darkMode ? '#27272A' : '#F7F7F9';
  const border = darkMode ? '#3F3F46' : '#E5E5EA';
  const surface = darkMode ? '#18181B' : '#FFFFFF';

  const title = issues.length === 0
    ? (language === 'hi' ? 'सब कुछ ठीक लग रहा है!' : language === 'ta' ? 'எல்லாம் சரியாக உள்ளது!' : 'Everything looks good!')
    : (language === 'hi' ? 'लगभग हो गया' : language === 'ta' ? 'கிட்டத்தட்ட முடிந்தது' : 'Almost there');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {/* Title */}
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: text, marginBottom: '4px' }}>{title}</h2>
        {issues.length > 0 && (
          <p style={{ fontSize: '14px', color: muted, marginBottom: '16px' }}>
            {language === 'hi'
              ? `${issues.length} चीज़ें ठीक करें, फिर पोर्टल पर सबमिट करें।`
              : language === 'ta'
              ? `${issues.length} பிரச்சினைகளை சரிசெய், பின்னர் போர்டலில் சமர்ப்பிக்கவும்.`
              : `Fix ${issues.length} item${issues.length > 1 ? 's' : ''}, then submit on the portal.`}
          </p>
        )}

        {/* Progress bar */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', color: muted }}>
              {complete} of {fields.length} {t(language, 'complete')}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: pct === 100 ? '#22C55E' : '#5B5BD6' }}>{pct}%</span>
          </div>
          <div style={{ height: '8px', background: border, borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#22C55E' : '#5B5BD6', borderRadius: '4px', transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {/* Issues */}
        {issues.length > 0 && (
          <>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#B45309', letterSpacing: '0.5px', marginBottom: '8px' }}>
              {t(language, 'needsAttention')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {issues.map((issue) => {
                const idx = fields.findIndex((f) => f.id === issue.fieldId);
                return (
                  <div key={issue.fieldId} style={{ display: 'flex', alignItems: 'center', padding: '12px', border: '1px solid #FDE68A', background: '#FFFBEB', borderRadius: '8px', gap: '10px' }}>
                    <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠️</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#92400E', margin: 0 }}>{issue.label}</p>
                      <p style={{ fontSize: '12px', color: '#B45309', margin: '2px 0 0' }}>{issue.reason}</p>
                    </div>
                    {idx >= 0 && (
                      <button
                        onClick={() => onGoToField(idx)}
                        style={{ padding: '6px 12px', border: '1px solid #FDE68A', borderRadius: '6px', background: surface, color: '#92400E', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
                        {t(language, 'goToField')}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Good fields */}
        {complete > 0 && (
          <>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#15803D', letterSpacing: '0.5px', marginBottom: '8px' }}>
              {t(language, 'looksGood')}
            </p>
            <div style={{ padding: '12px', border: '1px solid #BBF7D0', background: '#F0FDF4', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '16px' }}>✅</span>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#15803D', margin: 0 }}>
                  {complete} {language === 'hi' ? 'फ़ील्ड पूरे दिखते हैं' : language === 'ta' ? 'புலங்கள் முழுமையாக உள்ளன' : `field${complete > 1 ? 's' : ''} look complete`}
                </p>
                <p style={{ fontSize: '12px', color: '#166534', margin: '2px 0 0' }}>
                  {language === 'hi'
                    ? 'आपके डिवाइस पर जाँचा गया। आपने जो टाइप किया वह कहीं नहीं भेजा जाता।'
                    : language === 'ta'
                    ? 'உங்கள் சாதனத்தில் சரிபார்க்கப்பட்டது. நீங்கள் தட்டச்சு செய்தது எங்கும் அனுப்பப்படவில்லை.'
                    : 'Checked on your device. Nothing you typed is sent anywhere.'}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: `1px solid ${border}`, background: surface }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '16px' }}>
          <span style={{ fontSize: '14px' }}>🛡️</span>
          <p style={{ fontSize: '12px', color: muted, margin: 0, lineHeight: 1.5 }}>
            {language === 'hi'
              ? 'नीम आपके लिए सबमिट नहीं कर सकता। जब सब कुछ सही हो, तो पोर्टल पर खुद सबमिट करें।'
              : language === 'ta'
              ? 'நீம் உங்களுக்காக சமர்ப்பிக்க முடியாது. எல்லாம் சரியாக இருக்கும்போது, போர்டலில் நீங்களே சமர்ப்பிக்கவும்.'
              : "Neem can't press Submit for you. When everything is green, submit on the portal yourself."}
          </p>
        </div>
      </div>
    </div>
  );
}
