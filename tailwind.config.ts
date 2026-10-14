import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./vendor/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        ink: "var(--color-text)",
        muted: "var(--color-text-muted)",
        subtle: "var(--color-text-subtle)",
        faint: "var(--color-text-faint)",
        line: "var(--color-border)",
        "line-md": "var(--color-border-medium)",
        surface: "var(--color-surface)",
        hover: "var(--color-hover)",
        accent: "var(--color-accent)",
        "accent-h": "var(--color-accent-hover)",
        success: "var(--color-success)",
        "success-bg": "var(--color-success-bg)",
        "success-line": "var(--color-success-border)",
        "success-ink": "var(--color-success-text)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        ioc: "var(--color-ioc)",
        evidence: "var(--color-evidence)",
        page: "#F3F4F6",
        // HAX SDK bridge: shadcn-style token names the vendored artifacts use.
        // Additive only — `muted`/`accent` above keep their v1 meaning; these
        // supply the names v1 lacks, each routed to an --sh-* var (app/v2.css).
        background: "var(--sh-background)",
        foreground: "var(--sh-foreground)",
        card: "var(--sh-card)",
        "card-foreground": "var(--sh-card-foreground)",
        popover: "var(--sh-popover)",
        "popover-foreground": "var(--sh-popover-foreground)",
        primary: "var(--sh-primary)",
        "primary-foreground": "var(--sh-primary-foreground)",
        secondary: "var(--sh-secondary)",
        "secondary-foreground": "var(--sh-secondary-foreground)",
        "muted-foreground": "var(--sh-muted-foreground)",
        "accent-foreground": "var(--sh-accent-foreground)",
        destructive: "var(--sh-destructive)",
        "destructive-foreground": "var(--sh-destructive-foreground)",
        border: "var(--sh-border)",
        input: "var(--sh-input)",
        ring: "var(--sh-ring)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        heading: ["var(--font-sans)", "system-ui", "sans-serif"],
        body: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono-code)", "var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "16px",
        pill: "40px",
      },
      boxShadow: {
        card: "0 1px 3px 0 var(--color-shadow)",
        "card-hover": "0 8px 32px rgba(34, 104, 190, 0.08)",
        glow: "0 0 40px -10px rgba(0, 188, 235, 0.35)",
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        "gradient-shift": "gradient-shift 18s ease infinite",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.7s ease-out forwards",
        "pulse-glow": "pulseGlow 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
