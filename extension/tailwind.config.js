/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        'neem-primary': '#5B5BD6',
        'neem-primary-dark': '#4747C2',
        'neem-surface': '#FFFFFF',
        'neem-surface-secondary': '#F7F7F9',
        'neem-border': '#E5E5EA',
        'neem-text': '#09090B',
        'neem-text-secondary': '#71717A',
        'neem-text-muted': '#A1A1AA',
        'neem-success': '#22C55E',
        'neem-warning': '#F59E0B',
        'neem-error': '#EF4444',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        panel: '12px',
        card: '8px',
        chip: '4px',
      },
      width: {
        panel: '400px',
        fab: '56px',
      },
      height: {
        fab: '56px',
      },
    },
  },
  plugins: [],
};
