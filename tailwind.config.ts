import type { Config } from "tailwindcss"

export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#2563EB",
          600: "#1d4ed8",
          700: "#1e40af"
        },
        accent: "#10B981",
        warn: "#F59E0B",
        danger: "#EF4444",
        surface: "var(--surface)",
        background: "var(--background)"
      },
      boxShadow: {
        glow: "0 10px 40px rgba(37, 99, 235, 0.16)",
        glass: "0 20px 60px rgba(15, 23, 42, 0.12)"
      },
      backgroundImage: {
        aurora:
          "radial-gradient(circle at top left, rgba(37,99,235,.24), transparent 30%), radial-gradient(circle at top right, rgba(124,58,237,.18), transparent 28%), linear-gradient(180deg, rgba(248,250,252,1), rgba(241,245,249,1))"
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        }
      },
      animation: {
        floaty: "floaty 7s ease-in-out infinite"
      }
    }
  },
  plugins: []
} satisfies Config

