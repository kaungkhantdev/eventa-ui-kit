/* Shared Tailwind (Play CDN) config for all Eventa pages. Loaded right after the CDN script. */
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      colors: {
        brand: {
          DEFAULT: '#1ba770',
          dark: '#157e56',
          soft: 'rgb(var(--brand-soft) / <alpha-value>)',
        },
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        canvas: 'rgb(var(--canvas) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        sidebar: 'rgb(var(--sidebar) / <alpha-value>)',
        hair: 'rgb(var(--hair) / <alpha-value>)',
      },
      boxShadow: { pop: '0 8px 24px rgba(16,24,40,.12)' },
    },
  },
};
