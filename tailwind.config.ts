import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm "adventure journal" palette — nostalgic, not corporate.
        parchment: "#FBF6EC",
        cream: "#F4EBDA",
        ink: "#2C2620",
        forest: {
          DEFAULT: "#2F5D45",
          light: "#3E7659",
          dark: "#22432F",
        },
        sunset: {
          DEFAULT: "#DA6A3C",
          light: "#E78A5E",
        },
        gold: {
          DEFAULT: "#E0A951",
          light: "#F0C77E",
        },
        sky: {
          DEFAULT: "#5E8DB5",
          light: "#9DBED6",
        },
        clay: "#A8543A",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 0 0 rgba(44,38,32,0.06), 0 8px 24px -12px rgba(44,38,32,0.25)",
        lift: "0 12px 36px -14px rgba(44,38,32,0.4)",
      },
      backgroundImage: {
        "paper-grain":
          "radial-gradient(rgba(44,38,32,0.025) 1px, transparent 1px)",
      },
      keyframes: {
        "pop-in": {
          "0%": { transform: "scale(0.92)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "pop-in": "pop-in 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        "slide-up": "slide-up 0.4s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
