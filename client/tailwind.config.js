/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Bebas Neue'", "cursive"],
        body: ["'Nunito'", "sans-serif"],
      },
      colors: {
        bg:      "#090910",
        surface: "#101018",
        border:  "#1C1C2E",
        accent:  "#C8FF00",
        muted:   "#52526E",
        primary: "#F0F0FF",
      },
      animation: {
        "fade-up":   "fadeUp 0.4s ease forwards",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: 0, transform: "translateY(16px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};
