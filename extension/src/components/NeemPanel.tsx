import React, { useState } from 'react';
import PanelHeader from './PanelHeader';
import FormSummaryView from './views/FormSummaryView';
import GuidedFillView from './views/GuidedFillView';
import ChatView from './views/ChatView';
import ReviewView from './views/ReviewView';
import SettingsView from './views/SettingsView';
import { parseForm, flattenFields } from '../utils/formParser';
import type { PanelState, ViewState, FormSection } from '../types';

interface NeemPanelProps {
  state: PanelState;
  onStateChange: (s: PanelState) => void;
  onClose: () => void;
}

export default function NeemPanel({ state, onStateChange, onClose }: NeemPanelProps) {
  const [sections] = useState<FormSection[]>(() => parseForm());
  const fields = flattenFields(sections);

  const setView = (view: ViewState) => onStateChange({ ...state, currentView: view });
  const setFieldIndex = (i: number) => onStateChange({ ...state, currentFieldIndex: i });
  const setLanguage = (lang: typeof state.language) => {
    onStateChange({ ...state, language: lang });
    chrome.storage.sync.set({ language: lang });
  };

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    top: '0',
    right: '0',
    width: '400px',
    height: '100vh',
    background: state.darkMode ? '#18181B' : '#FFFFFF',
    borderLeft: '1px solid #E5E5EA',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 2147483645,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: state.fontSize === 'xlarge' ? '18px' : state.fontSize === 'large' ? '16px' : '14px',
    color: state.darkMode ? '#FAFAFA' : '#09090B',
    boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
    pointerEvents: 'auto',
    transition: 'transform 0.3s ease',
  };

  if (state.isMinimized) {
    panelStyle.transform = 'translateX(344px)';
  }

  const renderView = () => {
    switch (state.currentView) {
      case 'summary':
        return (
          <FormSummaryView
            sections={sections}
            language={state.language}
            darkMode={state.darkMode}
            onStart={() => setView('guided-fill')}
          />
        );
      case 'guided-fill':
        return (
          <GuidedFillView
            fields={fields}
            currentIndex={state.currentFieldIndex}
            language={state.language}
            darkMode={state.darkMode}
            onIndexChange={setFieldIndex}
            onChat={() => setView('chat')}
            onReview={() => setView('review')}
          />
        );
      case 'chat':
        return (
          <ChatView
            language={state.language}
            darkMode={state.darkMode}
            onBack={() => setView('guided-fill')}
          />
        );
      case 'review':
        return (
          <ReviewView
            fields={fields}
            language={state.language}
            darkMode={state.darkMode}
            onGoToField={(index) => {
              setFieldIndex(index);
              setView('guided-fill');
            }}
          />
        );
      case 'settings':
        return (
          <SettingsView
            state={state}
            onStateChange={onStateChange}
            language={state.language}
            darkMode={state.darkMode}
          />
        );
    }
  };

  return (
    <div style={panelStyle} role="complementary" aria-label="Neem Form Assistant">
      <PanelHeader
        language={state.language}
        darkMode={state.darkMode}
        isMinimized={state.isMinimized}
        currentView={state.currentView}
        onLanguageChange={setLanguage}
        onMinimize={() => onStateChange({ ...state, isMinimized: !state.isMinimized })}
        onClose={onClose}
        onSettings={() => setView('settings')}
        onBack={() => setView('summary')}
      />
      {!state.isMinimized && (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {renderView()}
        </div>
      )}
      {/* Footer nav */}
      {!state.isMinimized && (
        <div
          style={{
            display: 'flex',
            borderTop: '1px solid #E5E5EA',
            background: state.darkMode ? '#27272A' : '#F7F7F9',
          }}
        >
          {(['summary', 'guided-fill', 'chat', 'review'] as ViewState[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              aria-current={state.currentView === v ? 'page' : undefined}
              style={{
                flex: 1,
                padding: '10px 4px',
                fontSize: '11px',
                fontWeight: state.currentView === v ? 700 : 400,
                color: state.currentView === v ? '#5B5BD6' : '#71717A',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderTop: state.currentView === v ? '2px solid #5B5BD6' : '2px solid transparent',
                fontFamily: 'inherit',
                transition: 'color 0.15s',
                textTransform: 'capitalize',
              }}
            >
              {v === 'guided-fill' ? '📝' : v === 'chat' ? '💬' : v === 'review' ? '✅' : '📋'}
              <br />
              {v === 'guided-fill' ? 'Guide' : v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
