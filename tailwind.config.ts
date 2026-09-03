import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "var(--cream)",
        ink: "var(--ink)",
        accent: "var(--accent)",
        yellow: "var(--yellow)",
        violet: "var(--violet)",
        panel: "var(--panel)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
      },
      fontFamily: {
        grotesk: ["var(--font-grotesk)", "sans-serif"],
      },
      boxShadow: {
        brutal: "4px 4px 0 0 var(--shadow)",
        "brutal-md": "8px 8px 0 0 var(--shadow)",
        "brutal-lg": "12px 12px 0 0 var(--shadow)",
        "brutal-xl": "16px 16px 0 0 var(--shadow)",
      },
      animation: {
        "spin-slow": "spin 10s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
