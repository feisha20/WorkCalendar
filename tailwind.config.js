/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'card-background': '#ffffff',
        'card-foreground': '#000000',
        'primary': '#000000', // 选中日期的背景色
        'primary-foreground': '#ffffff', // 选中日期的文字颜色
        'accent': '#f3f4f6', // 今天日期的背景色
        'accent-foreground': '#000000', // 今天日期的文字颜色
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}
