import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-roboto)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Crystal accents
        "crystal-orange": {
          DEFAULT: "#FF6200",
          dark: "#CC4E00",
          light: "#FF8533",
          muted: "rgba(255,98,0,0.12)",
        },
        "crystal-blue": {
          DEFAULT: "#00A8FF",
          dark: "#007ACC",
          light: "#33BBFF",
          muted: "rgba(0,168,255,0.12)",
        },
        // ESPN surface colors
        espn: {
          bg: "#0e1118",
          surface: "#161b27",
          border: "#252d3d",
          "text-dim": "#7a8499",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 1px)",
        sm: "calc(var(--radius) - 2px)",
      },
      boxShadow: {
        glow: "0 0 24px -6px rgba(255, 98, 0, 0.45)",
        "glow-blue": "0 0 24px -6px rgba(0, 168, 255, 0.45)",
        "card": "0 2px 8px rgba(0,0,0,0.4)",
        "card-hover": "0 8px 32px -8px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,98,0,0.15)",
        "header": "0 1px 0 hsl(220 18% 18%)",
      },
      backgroundImage: {
        "grid-fade": "radial-gradient(ellipse at top, rgba(0,168,255,0.06), transparent 60%)",
        "orange-fade": "radial-gradient(ellipse at top left, rgba(255,98,0,0.08), transparent 50%)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        pulseSlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.25" },
        },
        fadeInLeft: {
          from: { opacity: "0", transform: "translateX(-6px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          from: { opacity: "0", height: "0" },
          to: { opacity: "1", height: "var(--height)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-slow": "pulseSlow 2s cubic-bezier(0.4,0,0.6,1) infinite",
        "fade-in-left": "fadeInLeft 0.25s ease-out",
        "fade-in-up": "fadeInUp 0.25s ease-out",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
