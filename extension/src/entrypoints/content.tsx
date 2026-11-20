// content.tsx — WXT content script (must be .tsx for JSX support)
import React from 'react';
import ReactDOM from 'react-dom/client';
import { hasFormElements } from '../utils/formParser';
import FloatingButton from '../components/FloatingButton';
import NeemPanel from '../components/NeemPanel';
import type { PanelState, StoredSettings } from '../types';

export default defineContentScript({
  matches: ['<all_urls>'],

  async main(ctx) {
    if (!hasFormElements()) return;

    const settings = await new Promise<StoredSettings>((resolve) => {
      chrome.storage.sync.get(
        {
          language: 'en',
          fontSize: 'normal',
          darkMode: false,
          showFloatingIcon: true,
          autoStartGuidedFill: false,
          hasSeenNudge: false,
        },
        (result) => resolve(result as StoredSettings)
      );
    });

    if (!settings.showFloatingIcon) return;

    // Shadow DOM host — pointer-events:none so it never intercepts the page
    const host = document.createElement('div');
    host.id = 'neem-ai-root';
    host.style.cssText = 'position:fixed;z-index:2147483647;top:0;left:0;width:0;height:0;pointer-events:none;';
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });

    const styleEl = document.createElement('style');
    styleEl.textContent = getShadowStyles();
    shadow.appendChild(styleEl);

    const container = document.createElement('div');
    container.style.cssText = 'pointer-events:auto;';
    shadow.appendChild(container);

    const initialState: PanelState = {
      isOpen: false,
      isMinimized: false,
      currentView: 'summary',
      currentFieldIndex: 0,
      language: settings.language,
      fontSize: settings.fontSize,
      darkMode: settings.darkMode,
      showFloatingIcon: settings.showFloatingIcon,
      autoStartGuidedFill: settings.autoStartGuidedFill,
    };

    requestAnimationFrame(() => {
      const root = ReactDOM.createRoot(container);
      root.render(
        <React.StrictMode>
          <NeemApp initialState={initialState} hasSeenNudge={settings.hasSeenNudge} />
        </React.StrictMode>
      );
    });

    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'PING') {
        sendResponse({ active: true });
        return false;
      }
      if (message.type === 'TOGGLE_PANEL') {
        window.dispatchEvent(new CustomEvent('neem:toggle-panel'));
      }
      if (message.type === 'SETTINGS_CHANGED') {
        window.dispatchEvent(new CustomEvent('neem:settings-changed', { detail: message.changes }));
      }
    });

    ctx.onInvalidated(() => {
      host.remove();
    });
  },
});

// ─── App root component ───────────────────────────────────────────────────────

interface NeemAppProps {
  initialState: PanelState;
  hasSeenNudge: boolean;
}

function NeemApp({ initialState, hasSeenNudge }: NeemAppProps) {
  const [panelOpen, setPanelOpen] = React.useState(initialState.autoStartGuidedFill);
  const [state, setState] = React.useState<PanelState>(initialState);
  const [showNudge, setShowNudge] = React.useState(!hasSeenNudge);

  React.useEffect(() => {
    const handleToggle = () => setPanelOpen((prev) => !prev);
    const handleSettings = (e: Event) => {
      const changes = (e as CustomEvent<Record<string, { newValue: unknown }>>) .detail;
      setState((prev) => {
        const next = { ...prev };
        if (changes.language) next.language = changes.language.newValue as typeof prev.language;
        if (changes.fontSize) next.fontSize = changes.fontSize.newValue as typeof prev.fontSize;
        if (changes.darkMode !== undefined) next.darkMode = changes.darkMode.newValue as boolean;
        return next;
      });
    };

    window.addEventListener('neem:toggle-panel', handleToggle);
    window.addEventListener('neem:settings-changed', handleSettings);
    return () => {
      window.removeEventListener('neem:toggle-panel', handleToggle);
      window.removeEventListener('neem:settings-changed', handleSettings);
    };
  }, []);

  const handleNudgeAccept = () => {
    setShowNudge(false);
    setPanelOpen(true);
    chrome.storage.sync.set({ hasSeenNudge: true });
  };

  const handleNudgeDismiss = () => {
    setShowNudge(false);
    chrome.storage.sync.set({ hasSeenNudge: true });
  };

  return (
    <>
      <FloatingButton
        onOpen={() => setPanelOpen(true)}
        showNudge={showNudge}
        onNudgeAccept={handleNudgeAccept}
        onNudgeDismiss={handleNudgeDismiss}
        panelOpen={panelOpen}
        language={state.language}
      />
      {panelOpen && (
        <NeemPanel
          state={state}
          onStateChange={setState}
          onClose={() => setPanelOpen(false)}
        />
      )}
    </>
  );
}

// ─── Minimal Shadow DOM reset styles ─────────────────────────────────────────

function getShadowStyles(): string {
  return `
    *, *::before, *::after { box-sizing: border-box; }
    * { margin: 0; padding: 0; }
    button { cursor: pointer; border: none; background: none; font-family: inherit; }
    input, textarea, select { font-family: inherit; }
  `;
}
