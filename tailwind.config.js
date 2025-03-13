/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: '#9C6ADE',
            light: '#B794F6',
            dark: '#7C4DFF',
          },
          secondary: {
            DEFAULT: '#64B5F6',
            light: '#90CAF9',
            dark: '#42A5F5',
          },
          accent: {
            DEFAULT: '#FF8A80',
            light: '#FFAB91',
            dark: '#FF5252',
          },
          success: '#81C784',
          warning: '#FFD54F',
          error: '#E57373',
          info: '#64B5F6',
          butterfly: {
            cream: '#FFF8E1',
            lavender: '#9C6ADE',
            sky: '#64B5F6',
            coral: '#FF8A80',
          }
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
        },
        boxShadow: {
          'butterfly': '0 4px 14px 0 rgba(156, 106, 222, 0.1)',
        },
      },
    },
    plugins: [
      require('@tailwindcss/forms'),
      require('@tailwindcss/typography'),
    ],
    corePlugins: {
      preflight: true, // Enable Tailwind's base styles
    },
  }