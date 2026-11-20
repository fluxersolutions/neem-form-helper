import { defineConfig } from 'wxt';
import react from '@vitejs/plugin-react';

export default defineConfig({
  extensionApi: 'chrome',
  srcDir: 'src',
  outDir: '.output',
  manifest: {
    name: 'Neem – AI Form Assistant',
    description: 'Explains government e-forms in plain language, in your language, field by field.',
    version: '0.1.0',
    manifest_version: 3,
    permissions: ['storage', 'activeTab', 'tabs', 'scripting'],
    host_permissions: ['<all_urls>'],
    action: {
      default_popup: 'popup/popup.html',
      default_title: 'Neem – AI Form Assistant',
    },
    // Icons omitted — Chrome uses a default icon if files are absent
  },
  vite: () => ({
    plugins: [react()],
  }),
});
