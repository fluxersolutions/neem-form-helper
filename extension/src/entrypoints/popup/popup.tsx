import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import type { StoredSettings, Language } from '../../types';

const DEFAULT: StoredSettings = {
  language: 'en',
  fontSize: 'normal',
  darkMode: false,
  showFloatingIcon: true,
  autoStartGuidedFill: false,
  hasSeenNudge: false,
};

const LANG_LABELS: Record<Language, string> = { en: 'English', hi: 'हिन्दी', ta: 'தமிழ்' };

function PopupApp() {
  const [settings, setSettings] = useState<StoredSettings>(DEFAULT);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chrome.storage.sync.get(DEFAULT, (result) => {
      setSettings(result as StoredSettings);
      setLoading(false);
    });

    // Check if content script is active on current tab
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) return;
      try {
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'PING' });
        setIsActive(response?.active === true);
      } catch {
        setIsActive(false);
      }
    });
  }, []);

  const save = (patch: Partial<StoredSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    chrome.storage.sync.set(patch);
    // Notify all tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { type: 'SETTINGS_CHANGED', changes: patch }).catch(() => {});
        }
      });
    });
  };

  const openPanel = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_PANEL' }).catch(() => {});
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading…</div>;

  const bg = settings.darkMode ? '#18181B' : '#FFFFFF';
  const text = settings.darkMode ? '#FAFAFA' : '#09090B';
  const muted = settings.darkMode ? '#A1A1AA' : '#71717A';
  const border = settings.darkMode ? '#3F3F46' : '#E5E5EA';
  const surface2 = settings.darkMode ? '#27272A' : '#F7F7F9';

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button role="switch" aria-checked={value} onClick={() => onChange(!value)}
      style={{ width: '40px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: value ? '#5B5BD6' : border, position: 'relative', transition: 'background 0.2s' }}>
      <span style={{ position: 'absolute', top: '2px', left: value ? '18px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
    </button>
  );

  const Row = ({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) => (
    <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${border}`, gap: '12px' }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '14px', color: text, margin: 0, fontWeight: 500 }}>{label}</p>
        {sub && <p style={{ fontSize: '12px', color: muted, margin: '2px 0 0' }}>{sub}</p>}
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ background: bg, color: text, minHeight: '400px', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#5B5BD6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '16px' }}>S</div>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Neem</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isActive ? '#22C55E' : muted }} />
            <span style={{ fontSize: '12px', color: isActive ? '#22C55E' : muted }}>
              {isActive ? 'Active on this page' : 'No form detected'}
            </span>
          </div>
        </div>
      </div>

      {/* Open panel button */}
      {isActive && (
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${border}` }}>
          <button onClick={openPanel}
            style={{ width: '100%', padding: '10px', background: '#5B5BD6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            Open Form Assistant
          </button>
        </div>
      )}

      {/* Settings rows */}
      <Row label="Show floating icon" sub="On forms Neem recognises">
        <Toggle value={settings.showFloatingIcon} onChange={(v) => save({ showFloatingIcon: v })} />
      </Row>
      <Row label="Guided fill auto-start">
        <Toggle value={settings.autoStartGuidedFill} onChange={(v) => save({ autoStartGuidedFill: v })} />
      </Row>
      <Row label="Dark mode">
        <Toggle value={settings.darkMode} onChange={(v) => save({ darkMode: v })} />
      </Row>

      {/* Language */}
      <Row label="Language">
        <select value={settings.language} onChange={(e) => save({ language: e.target.value as Language })}
          style={{ padding: '6px 10px', borderRadius: '6px', border: `1px solid ${border}`, background: surface2, color: text, fontSize: '13px', fontFamily: 'inherit', cursor: 'pointer' }}>
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="ta">தமிழ்</option>
        </select>
      </Row>

      {/* Font size */}
      <Row label="Text size">
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['normal', 'large', 'xlarge'] as const).map((size, i) => (
            <button key={size} onClick={() => save({ fontSize: size })}
              style={{ width: '34px', height: '34px', borderRadius: '6px', border: `1px solid ${settings.fontSize === size ? '#5B5BD6' : border}`, background: settings.fontSize === size ? '#EDEDFB' : surface2, color: settings.fontSize === size ? '#5B5BD6' : text, fontSize: 10 + i * 2 + 'px', fontWeight: 700, cursor: 'pointer' }}>
              A{i > 0 ? '+'.repeat(i) : ''}
            </button>
          ))}
        </div>
      </Row>

      {/* Proxy URL config */}
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${border}`, marginTop: 'auto' }}>
        <p style={{ fontSize: '11px', color: muted, marginBottom: '6px' }}>AI Proxy URL</p>
        <input
          type="url"
          placeholder="http://localhost:3001"
          onBlur={(e) => chrome.storage.local.set({ proxyUrl: e.target.value })}
          defaultValue="http://localhost:3001"
          style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: `1px solid ${border}`, background: surface2, color: text, fontSize: '12px', fontFamily: 'inherit' }}
        />
        <p style={{ fontSize: '10px', color: muted, marginTop: '4px' }}>Keep API keys on your proxy. Never in the extension.</p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PopupApp />
  </React.StrictMode>
);
