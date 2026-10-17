/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"]
      },
      colors: {
        panteron: {
          black: "#050508",
          purple: "#7F00FF",
          violet: "#B266FF",
          deep: "#2B003D"
        }
      },
      backgroundImage: {
        "panteron-gradient": "radial-gradient(circle at top, rgba(127, 0, 255, 0.35) 0%, rgba(5, 5, 8, 1) 58%)"
      }
    }
  },
  plugins: []
};
