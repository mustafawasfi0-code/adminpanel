/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          // Deep steady teal-blue — "clear sky / clear breath", the primary color.
          sky: '#1E6E8C',
          skyDeep: '#154D63',
          skySoft: '#E4EFF2',
          // Cool mist background instead of pure white/grey.
          mist: '#F3F7F8',
          paper: '#FFFFFF',
          // Text
          ink: '#16232B',
          slate: '#5D7278',
          line: '#DCE6E8',
          lineSoft: '#EAF1F2',
        },
        zone: {
          green: '#2E9B6C',
          greenSoft: '#E4F5EC',
          amber: '#C4830F',
          amberSoft: '#FBF0DC',
          red: '#D1483F',
          redSoft: '#FAE7E5',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '14px',
        chip: '999px',
      },
    },
  },
  plugins: [],
};