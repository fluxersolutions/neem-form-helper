export default defineBackground({
  type: 'module',
  main() {
    // Handle extension icon click - open popup (popup is defined in manifest so this is optional)
    chrome.action.onClicked.addListener(async (tab) => {
      if (tab.id == null) return;
      // Popup is configured; this fires only when no popup is set
      await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_PANEL' });
    });

    // Listen for messages from content scripts
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      // PING: content script health check from popup
      if (message.type === 'PING') {
        sendResponse({ active: true });
        return false;
      }
      handleMessage(message, sender, sendResponse);
      return true; // keep channel open for async responses
    });

    // Listen for storage changes and broadcast to relevant tabs
    chrome.storage.onChanged.addListener(async (changes, area) => {
      if (area !== 'sync') return;
      const tabs = await chrome.tabs.query({ active: true });
      for (const tab of tabs) {
        if (tab.id == null) continue;
        chrome.tabs.sendMessage(tab.id, { type: 'SETTINGS_CHANGED', changes }).catch(() => {
          // Tab may not have content script; ignore
        });
      }
    });
  },
});

async function handleMessage(
  message: { type: string; payload?: unknown },
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void
): Promise<void> {
  switch (message.type) {
    case 'AI_EXPLAIN_FIELD': {
      // Placeholder: future Gemini API call
      const response = await explainField(message.payload as { label: string; type: string });
      sendResponse({ success: true, data: response });
      break;
    }
    case 'AI_CHAT': {
      const response = await chatWithAI(message.payload as { question: string; context: string });
      sendResponse({ success: true, data: response });
      break;
    }
    case 'GET_SETTINGS': {
      const settings = await new Promise((resolve) => {
        chrome.storage.sync.get(null, resolve);
      });
      sendResponse({ success: true, data: settings });
      break;
    }
    case 'SAVE_SETTINGS': {
      await new Promise<void>((resolve) => {
        chrome.storage.sync.set(message.payload as Record<string, unknown>, resolve);
      });
      sendResponse({ success: true });
      break;
    }
    default:
      sendResponse({ success: false, error: `Unknown message type: ${message.type}` });
  }
}

async function explainField(payload: { label: string; type: string }): Promise<string> {
  // TODO: Integrate Gemini API
  // For now return a placeholder explanation
  await new Promise((r) => setTimeout(r, 300)); // simulate latency
  return `This field asks for your ${payload.label.toLowerCase()}. Please enter the information as requested.`;
}

async function chatWithAI(payload: { question: string; context: string }): Promise<string> {
  // TODO: Integrate Gemini API
  await new Promise((r) => setTimeout(r, 300));
  return `Thank you for your question about "${payload.question}". I'm here to help you fill this form correctly.`;
}
