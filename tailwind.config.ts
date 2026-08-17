import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base — abyssal green-black treasury
        abyss: "#0B1512",
        panel: "#122019",
        card: "#182A21",
        well: "#081009",
        // Ink
        parchment: "#EFEAD8",
        sage: "#8FA093",
        // Accents
        gold: {
          DEFAULT: "#E8B44A",
          ember: "#C68A2E",
          tint: "rgba(232,180,74,0.12)",
        },
        teal: {
          DEFAULT: "#2FA98C",
          tint: "rgba(47,169,140,0.12)",
        },
        violet: {
          DEFAULT: "#8B5CF6",
        },
        // Semantic
        profit: "#4CC38A",
        loss: "#E5534B",
        warn: "#E8934A",
        hairline: "#25382E",
        // Dota 2 rarity — exact game values
        rarity: {
          common: "#B0C3D9",
          uncommon: "#5E98D9",
          rare: "#4B69FF",
          mythical: "#8847FF",
          legendary: "#D32CE6",
          immortal: "#E4AE39",
          arcana: "#ADE55C",
          ancient: "#EB4B4B",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 24px -4px rgba(232,180,74,0.35)",
        "glow-soft": "0 0 40px -12px rgba(232,180,74,0.25)",
        relic: "inset 0 1px 0 rgba(239,234,216,0.04), 0 8px 30px -12px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        "gold-sweep":
          "linear-gradient(115deg, transparent 30%, rgba(232,180,74,0.18) 48%, rgba(239,234,216,0.28) 50%, rgba(232,180,74,0.18) 52%, transparent 70%)",
        "filigree":
          "linear-gradient(90deg, transparent, rgba(232,180,74,0.4) 20%, rgba(232,180,74,0.4) 80%, transparent)",
      },
      keyframes: {
        sweep: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(120%)" },
        },
        breathe: {
          "0%,100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        ember: {
          "0%": { transform: "translateY(0) scale(1)", opacity: "0" },
          "10%": { opacity: "0.8" },
          "100%": { transform: "translateY(-140px) scale(0.4)", opacity: "0" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "glow-pulse": {
          "0%,100%": { boxShadow: "0 0 24px -6px rgba(232,180,74,0.25)" },
          "50%": { boxShadow: "0 0 44px -6px rgba(232,180,74,0.55)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "gradient-x": {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.6)" },
          "70%": { transform: "scale(1.08)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        sweep: "sweep 2.6s ease-in-out infinite",
        breathe: "breathe 3s ease-in-out infinite",
        shimmer: "shimmer 1.8s linear infinite",
        "fade-up": "fade-up 0.6s ease-out both",
        float: "float 6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3.2s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
        "scale-in": "scale-in 0.5s ease-out both",
        "gradient-x": "gradient-x 6s ease infinite",
        "spin-slow": "spin-slow 22s linear infinite",
        "pop-in": "pop-in 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
