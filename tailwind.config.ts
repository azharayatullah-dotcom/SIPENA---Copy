import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0B1B3F",
        canvas: "#F4F6FA",
        teal: "#2DD4BF"
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"]
      },
      boxShadow: {
        card: "0 14px 40px rgba(11, 27, 63, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
