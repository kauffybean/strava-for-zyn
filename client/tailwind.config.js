/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Strong military-inspired colors
        primary: '#2A3439', // Dark slate (main color)
        secondary: '#406E8E', // Navy blue
        accent: '#8FB339', // Military green
        danger: '#C74545', // Militant red
        warning: '#F9A826', // Tactical yellow
        info: '#4D5D6C', // Steel blue
        success: '#5D9C59', // Forest green
        muted: '#8A8B8C', // Tactical gray
        background: {
          DEFAULT: '#F2F3F4', // Light gray for backgrounds
          dark: '#1A1F24', // Dark mode background
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Rajdhani', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'ios': '8px',
        'pill': '9999px',
      },
      boxShadow: {
        'ios': '0 2px 10px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}