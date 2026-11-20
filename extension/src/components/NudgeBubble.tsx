import React from 'react';
import { t } from '../i18n';
import type { Language } from '../types';

interface NudgeBubbleProps {
  onAccept: () => void;
  onDismiss: () => void;
  language: Language;
  position: { x: number; y: number };
}

export default function NudgeBubble({ onAccept, onDismiss, language, position }: NudgeBubbleProps) {
  // Position bubble above/to the left of FAB
  const bubbleRight = window.innerWidth - position.x - 56;
  const bubbleBottom = window.innerHeight - position.y + 8;

  return (
    <div
      role="dialog"
      aria-label={t(language, 'nudgeTitle')}
      style={{
        position: 'fixed',
        right: `${bubbleRight}px`,
        bottom: `${bubbleBottom}px`,
        width: '240px',
        background: '#FFFFFF',
        border: '1px solid #E5E5EA',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        zIndex: 2147483646,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        pointerEvents: 'auto',
      }}
    >
      {/* Arrow */}
      <div
        style={{
          position: 'absolute',
          bottom: '-8px',
          right: '20px',
          width: '14px',
          height: '14px',
          background: '#FFFFFF',
          border: '1px solid #E5E5EA',
          borderTop: 'none',
          borderLeft: 'none',
          transform: 'rotate(45deg)',
          borderRadius: '2px',
        }}
      />
      <p
        style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#09090B',
          marginBottom: '12px',
          lineHeight: '1.4',
        }}
      >
        {t(language, 'nudgeTitle')}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={onAccept}
          style={{
            background: '#5B5BD6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#4747C2')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#5B5BD6')}
        >
          {t(language, 'nudgeYes')}
        </button>
        <button
          onClick={onDismiss}
          style={{
            background: 'transparent',
            color: '#71717A',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '13px',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {t(language, 'nudgeNo')}
        </button>
      </div>
    </div>
  );
}
