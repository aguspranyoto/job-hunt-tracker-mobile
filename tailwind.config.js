/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        foreground: "#0a0a0a",
        card: {
          DEFAULT: "#ffffff",
          foreground: "#0a0a0a",
        },
        primary: {
          DEFAULT: "#0a0a0a",
          foreground: "#fafafa",
        },
        secondary: {
          DEFAULT: "#f5f5f5",
          foreground: "#1a1a1a",
        },
        muted: {
          DEFAULT: "#f5f5f5",
          foreground: "#737373",
        },
        accent: {
          DEFAULT: "#f5f5f5",
          foreground: "#1a1a1a",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#fafafa",
        },
        border: "#e5e5e5",
        input: "#e5e5e5",
        ring: "#0a0a0a",
        bookmarked: "#3b82f6",
        applied: "#6366f1",
        screening: "#f59e0b",
        interviewing: "#8b5cf6",
        offer: "#10b981",
        rejected: "#ef4444",
        ghosted: "#71717a",
        "stat-total": "#3b82f6",
        "stat-pipeline": "#8b5cf6",
        "stat-week": "#f59e0b",
        "stat-offers": "#10b981",
      },
      fontFamily: {
        sans: ["Ubuntu", "System"],
      },
    },
  },
  plugins: [],
};
