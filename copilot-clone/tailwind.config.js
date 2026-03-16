/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        // ── Backgrounds — light defaults / dark overrides ─────────────────────
        background:            '#F2F2F7',
        'background-dark':     '#0E0E10',
        surface:               '#FFFFFF',
        'surface-dark':        '#1C1C1E',
        'surface-raised':      '#EFEFF4',
        'surface-raised-dark': '#2C2C2E',
        input:                 '#E5E5EA',
        'input-dark':          '#2C2C2E',

        // ── Text ─────────────────────────────────────────────────────────────
        primary:               '#000000',
        'primary-dark':        '#FFFFFF',
        secondary:             '#6C6C70',
        'secondary-dark':      '#8E8E93',
        tertiary:              '#AEAEB2',
        'tertiary-dark':       '#636366',

        // ── Structural ───────────────────────────────────────────────────────
        separator:             '#C6C6C8',
        'separator-dark':      '#38383A',

        // ── Accent (same in both modes) ───────────────────────────────────────
        accent: '#0A84FF',

        // ── Budget/Spending States ────────────────────────────────────────────
        'budget-green':        '#34C759',
        'budget-light-orange': '#FF9F0A',
        'budget-dark-orange':  '#FF6B00',
        'budget-red':          '#FF3B30',

        // ── Income ───────────────────────────────────────────────────────────
        'income-green': '#34C759',
      },
      fontFamily: {
        sans:        ['Inter_400Regular', 'System'],
        'sans-md':   ['Inter_500Medium', 'System'],
        'sans-semi': ['Inter_600SemiBold', 'System'],
        'sans-bold': ['Inter_700Bold', 'System'],
      },
    },
  },
  plugins: [],
};
