import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "bebas-neue": ["Bebas Neue", "sans-serif"],
        "gemunu-libre": ["Gemunu Libre", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
        teko: ["Teko", "sans-serif"],
        russo : ["Russo One", "sans-serif"],
        oswald : ["Oswald", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
} satisfies Config;
