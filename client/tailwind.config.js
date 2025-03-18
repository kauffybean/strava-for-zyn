/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Enhanced Zynfantry military-inspired colors
        primary: '#1E272E', // Darker slate (main color) - more tactical
        secondary: '#34495E', // Deep navy blue - more formal military
        accent: '#7CAD3A', // Sharper military green - reminiscent of camo
        danger: '#B33C3C', // Combat red - less bright, more serious
        warning: '#E6A317', // Tactical alert yellow - better contrast
        info: '#445566', // Military intelligence blue - more subdued 
        success: '#48924A', // Deployment success green - calmer tone
        muted: '#777A7E', // Tactical gray - improved for readability
        border: 'rgba(30, 39, 46, 0.15)', // Border color derived from primary
        background: {
          DEFAULT: '#F7F8F9', // Light field gray for backgrounds - improved contrast
          dark: '#171C21', // Dark mode background - deeper black
          card: '#FFFFFF', // Card background
        },
        card: '#FFFFFF', // Card background for compatibility
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