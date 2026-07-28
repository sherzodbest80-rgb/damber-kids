import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0B0B0F",        // deep showroom black (fon)
        panel: "#14141B",      // karta foni
        line: "#23232E",       // chegaralar
        neon: "#E1121D",       // qizil neon (rasmlardan)
        "neon-soft": "#FF3B45",
        amber: "#F5B301",      // issiq, bolalar uchun quvnoq akcent
        cream: "#F5F3EC",      // matn
        muted: "#9A9AA6",      // ikkilamchi matn
        steel: "#B8BCC4",      // metall his
      },
      fontFamily: {
        display: ["var(--font-archivo)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 40px -8px rgba(225,18,29,0.55)",
        "neon-lg": "0 0 80px -10px rgba(225,18,29,0.6)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
