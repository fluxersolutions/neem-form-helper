import React, { useEffect, useState, useCallback } from 'react';
import { t } from '../../i18n';
import type { FormField, Language } from '../../types';
import { highlightField, removeHighlight } from '../../utils/fieldHighlighter';
import { explainField, offlineFallback } from '../../ai/aiAdapter';
import type { FieldExplanation } from '../../ai/aiAdapter';

interface GuidedFillViewProps {
  fields: FormField[];
  currentIndex: number;
  language: Language;
  darkMode: boolean;
  onIndexChange: (i: number) => void;
  onChat: () => void;
  onReview: () => void;
}

export default function GuidedFillView({
  fields,
  currentIndex,
  language,
  darkMode,
  onIndexChange,
  onChat,
  onReview,
}: GuidedFillViewProps) {
  const field = fields[currentIndex];
  const [explanation, setExplanation] = useState<FieldExplanation | null>(null);
  const [loading, setLoading] = useState(false);

  const text = darkMode ? '#FAFAFA' : '#09090B';
  const muted = darkMode ? '#A1A1AA' : '#71717A';
  const surface2 = darkMode ? '#27272A' : '#F7F7F9';
  const border = darkMode ? '#3F3F46' : '#E5E5EA';
  const surface = darkMode ? '#18181B' : '#FFFFFF';

  const loadExplanation = useCallback(async () => {
    if (!field) return;
    setLoading(true);
    try {
      const exp = await explainField(field.label, field.type, language, document.title);
      setExplanation(exp);
    } catch {
      setExplanation(offlineFallback(field.label, language));
    } finally {
      setLoading(false);
    }
  }, [field, language]);

  useEffect(() => {
    if (field?.element) {
      requestAnimationFrame(() => highlightField(field.element as HTMLElement, currentIndex + 1));
    }
    loadExplanation();
    return () => { removeHighlight(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, language]);

  if (!field) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
          <p style={{ color: text, fontSize: '16px', fontWeight: 600 }}>
            {language === 'hi' ? 'सभी फ़ील्ड पूरे हो गए!' : language === 'ta' ? 'அனைத்து புலங்களும் முடிந்தன!' : 'All fields done!'}
          </p>
          <button onClick={onReview} style={{ marginTop: '16px', padding: '10px 24px', background: '#5B5BD6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {t(language, 'reviewCTA')}
          </button>
        </div>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / fields.length) * 100;
  const section = field.sectionId !== 'default' ? field.sectionId : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {/* Progress */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', color: muted }}>
              {t(language, 'step')} {currentIndex + 1} {t(language, 'fieldOf')} {fields.length}
            </span>
            {section && <span style={{ fontSize: '12px', color: muted }}>{section}</span>}
          </div>
          <div style={{ height: '6px', background: border, borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#5B5BD6', borderRadius: '3px', transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {/* Plain language question */}
        <h3 style={{ fontSize: '20px', fontWeight: 700, color: text, lineHeight: 1.3, marginBottom: '12px' }}>
          {field.label}
          {field.required && <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>}
        </h3>

        {/* Original label on form */}
        <div style={{ background: surface2, border: `1px solid ${border}`, borderRadius: '8px', padding: '10px 14px', marginBottom: '14px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: muted, letterSpacing: '0.5px', marginBottom: '4px' }}>
            {t(language, 'onTheForm')}
          </p>
          <p style={{ fontSize: '13px', color: text, margin: 0 }}>{field.label}</p>
        </div>

        {/* AI explanation */}
        <div style={{ border: `1px solid ${border}`, borderRadius: '8px', padding: '14px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14px' }}>✨</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#5B5BD6', letterSpacing: '0.5px' }}>
                {t(language, 'whatThisMeans')}
              </span>
            </div>
            <button onClick={onChat} aria-label="Ask Neem" style={{ display: 'flex', alignItems: 'center', gap: '4px', border: 'none', background: 'transparent', color: muted, cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>
              🔊 {language === 'hi' ? 'पढ़ें' : language === 'ta' ? 'படி' : 'Read aloud'}
            </button>
          </div>
          {loading ? (
            <div style={{ height: '60px', background: border, borderRadius: '4px' }} />
          ) : (
            <p style={{ fontSize: '14px', color: text, lineHeight: 1.6, margin: 0 }}>{explanation?.plain}</p>
          )}
        </div>

        {/* What to type */}
        {!loading && explanation?.whatToType && (
          <div style={{ border: `1px solid ${border}`, borderRadius: '8px', padding: '14px', marginBottom: '14px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: muted, letterSpacing: '0.5px', marginBottom: '8px' }}>
              {t(language, 'whatToType')}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: muted }}>
                {language === 'hi' ? 'उदाहरण' : language === 'ta' ? 'எ.கா.' : 'e.g.'}
              </span>
              <span style={{ padding: '4px 10px', background: surface2, borderRadius: '4px', fontSize: '13px', fontWeight: 600, color: '#5B5BD6', border: `1px solid ${border}` }}>
                {explanation.whatToType}
              </span>
            </div>
          </div>
        )}

        {/* Tip */}
        {!loading && explanation?.tip && (
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '12px 14px', display: 'flex', gap: '10px' }}>
            <span style={{ fontSize: '16px', flexShrink: 0 }}>💡</span>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#B45309', letterSpacing: '0.5px', marginBottom: '4px' }}>
                {t(language, 'tipLabel').toUpperCase()}
              </p>
              <p style={{ fontSize: '13px', color: '#92400E', lineHeight: 1.5, margin: 0 }}>{explanation.tip}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 20px', borderTop: `1px solid ${border}`, background: surface }}>
        {/* Nav buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button
            onClick={() => onIndexChange(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            style={{ padding: '10px 16px', borderRadius: '8px', border: `1px solid ${border}`, background: 'transparent', color: currentIndex === 0 ? muted : text, cursor: currentIndex === 0 ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600 }}
          >
            {t(language, 'backButton')}
          </button>
          <button
            onClick={() => {
              if (currentIndex + 1 >= fields.length) onReview();
              else onIndexChange(currentIndex + 1);
            }}
            style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#5B5BD6', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: 700, transition: 'background 0.2s' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#4747C2')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#5B5BD6')}
          >
            {currentIndex + 1 >= fields.length ? t(language, 'reviewCTA') : t(language, 'nextButton')}
          </button>
        </div>
        {/* Ask Neem input */}
        <div
          style={{ display: 'flex', alignItems: 'center', border: `1px solid ${border}`, borderRadius: '8px', padding: '0 8px', background: surface2, cursor: 'text' }}
          onClick={onChat}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') onChat(); }}
          aria-label={t(language, 'askPlaceholder')}
        >
          <span style={{ flex: 1, padding: '10px 8px', fontSize: '13px', color: muted }}>{t(language, 'askPlaceholder')}</span>
          <span style={{ fontSize: '16px', padding: '0 4px', cursor: 'pointer' }}>🎤</span>
          <span style={{ fontSize: '16px', padding: '0 4px', cursor: 'pointer' }}>↑</span>
        </div>
      </div>
    </div>
  );
}
