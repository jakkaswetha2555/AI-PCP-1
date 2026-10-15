import type { Config } from "tailwindcss";

/** The shared visual language for CollabAI. Extend these tokens before adding one-off styles. */
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: { cream: "#F7F4EE", paper: "#FFFDF9", ink: "#1E1E1C", muted: "#6F6C64", line: "#D9D4CA", terra: { DEFAULT: "#B65134", dark: "#8E3B27", pale: "#F1DDD4" } },
      fontFamily: { display: ["Iowan Old Style", "Baskerville", "Georgia", "serif"], body: ["Arial", "Helvetica", "sans-serif"] },
      spacing: { "18": "4.5rem", "22": "5.5rem", "30": "7.5rem" },
      maxWidth: { content: "76rem" },
      borderRadius: { card: "1.25rem" },
      letterSpacing: { editorial: "-0.035em" }
    }
  },
  plugins: []
};
export default config;
