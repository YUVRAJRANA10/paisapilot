/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    fontSize: {
      'headline-lg': ['28px', { lineHeight: '36px', fontWeight: '600' }],
      'headline-lg-mobile': ['22px', { lineHeight: '30px', fontWeight: '600' }],
      'headline-md': ['20px', { lineHeight: '28px', fontWeight: '600' }],
      'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
      'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
      'body-sm': ['12px', { lineHeight: '18px', fontWeight: '400' }],
      'label-lg': ['14px', { lineHeight: '20px', fontWeight: '600' }],
      'label-md': ['12px', { lineHeight: '16px', fontWeight: '600' }],
      'label-sm': ['11px', { lineHeight: '14px', fontWeight: '700' }],
    },
    extend: {
      colors: {
        // Light theme (primary)
        surface: '#f8f9ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#eff4ff',
        'surface-container': '#e5eeff',
        'surface-container-high': '#dce9ff',
        'surface-container-highest': '#d3e4fe',
        'on-surface': '#0b1c30',
        'on-surface-variant': '#3d4a42',
        primary: '#006948',
        'primary-container': '#00855d',
        'on-primary': '#ffffff',
        'on-primary-container': '#f5fff7',
        secondary: '#565e74',
        'secondary-container': '#dae2fd',
        'on-secondary-container': '#5c647a',
        tertiary: '#0058be',
        'tertiary-container': '#2170e4',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
        outline: '#6d7a72',
        'outline-variant': '#bccac0',
        // Semantic aliases
        income: '#006948',
        expense: '#ba1a1a',
        warning: '#f59e0b',
        success: '#006948',
        // Dark sidebar (cockpit)
        'inverse-surface': '#213145',
        'inverse-on-surface': '#eaf1ff',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        gutter: '1.5rem',      // 24px
        margin: '2rem',        // 32px
        'space-xs': '0.25rem', // 4px
        'space-sm': '0.5rem',  // 8px
        'space-md': '1rem',    // 16px
        'space-lg': '1.5rem',  // 24px
        'space-xl': '2.5rem',  // 40px
      },
      borderRadius: {
        DEFAULT: '0.5rem',    // 8px
        lg: '0.75rem',        // 12px
        xl: '1rem',           // 16px
        full: '9999px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
        'elevated': '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
        'modal': '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
      },
    },
  },
  plugins: [],
}