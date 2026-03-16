/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // ── Backgrounds ──────────────────────────────────────────────────
        background:      '#0E0E10',
        surface:         '#1C1C1E',
        'surface-raised': '#2C2C2E',
        input:           '#2C2C2E',

        // ── Text ─────────────────────────────────────────────────────────
        primary:         '#FFFFFF',
        secondary:       '#8E8E93',
        tertiary:        '#636366',

        // ── Accent ───────────────────────────────────────────────────────
        accent:          '#0A84FF',

        // ── Budget/Spending States ────────────────────────────────────────
        'budget-green':        '#34C759',
        'budget-light-orange': '#FF9F0A',
        'budget-dark-orange':  '#FF6B00',
        'budget-red':          '#FF3B30',

        // ── Income ───────────────────────────────────────────────────────
        'income-green': '#34C759',

        // ── Structural ───────────────────────────────────────────────────
        separator: '#38383A',
      },
      fontFamily: {
        sans:       ['Inter_400Regular', 'System'],
        'sans-md':  ['Inter_500Medium', 'System'],
        'sans-semi':['Inter_600SemiBold', 'System'],
        'sans-bold':['Inter_700Bold', 'System'],
      },
    },
  },
  plugins: [],
};
