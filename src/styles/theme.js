export const theme = {
  colors: {
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
    error: '#ba1a1a',
    outline: '#6d7a72',
    'inverse-surface': '#213145',
    'inverse-on-surface': '#eaf1ff',
  },
  chartColors: [
    '#ef4444',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#f59e0b',
    '#14b8a6',
    '#6366f1',
    '#f97316',
    '#84cc16',
    '#06b6d4',
  ],
  fontFamily: {
    sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
}

export const isDarkMode = false

export function getColorWithOpacity(color, opacity) {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`
}