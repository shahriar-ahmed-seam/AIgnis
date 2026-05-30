/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Command Center palette: near-black canvas, electric accents
        void: {
          900: "#05060a",
          800: "#0a0c14",
          700: "#0f121d",
          600: "#161a28",
          500: "#1e2333",
        },
        ink: {
          100: "#e8ecf7",
          300: "#aab2c8",
          500: "#6b748f",
          700: "#3a4055",
        },
        cyan: {
          DEFAULT: "#22d3ee",
          glow: "#5ce8ff",
          deep: "#0891b2",
        },
        violet: {
          DEFAULT: "#8b5cf6",
          glow: "#a78bfa",
          deep: "#6d28d9",
        },
        magenta: {
          DEFAULT: "#e879f9",
        },
        lime: {
          DEFAULT: "#a3e635",
        },
        // agent identity colors
        agent: {
          researcher: "#22d3ee",
          analyst: "#a78bfa",
          copywriter: "#f472b6",
          visual: "#fb923c",
          operations: "#a3e635",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Sora", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "glow-cyan": "0 0 0 1px rgba(34,211,238,0.25), 0 0 24px -4px rgba(34,211,238,0.45)",
        "glow-violet": "0 0 0 1px rgba(139,92,246,0.25), 0 0 24px -4px rgba(139,92,246,0.45)",
        "panel": "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 24px 60px -24px rgba(0,0,0,0.8)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(60% 60% at 50% 0%, rgba(34,211,238,0.16) 0%, rgba(139,92,246,0.08) 35%, transparent 70%)",
        "hero-sheen":
          "linear-gradient(135deg, #22d3ee 0%, #8b5cf6 45%, #e879f9 100%)",
      },
      keyframes: {
        "pulse-line": {
          "0%": { strokeDashoffset: "200", opacity: "0.2" },
          "50%": { opacity: "1" },
          "100%": { strokeDashoffset: "0", opacity: "0.2" },
        },
        "float-slow": {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "pulse-line": "pulse-line 2.4s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "spin-slow": "spin-slow 18s linear infinite",
      },
    },
  },
  plugins: [],
};
