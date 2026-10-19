import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211b",
        sage: "#a8d5ba",
        mint: "#dff2e6",
        cream: "#f7f8f3",
      },
      boxShadow: {
        soft: "0 16px 40px rgba(33, 58, 42, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
