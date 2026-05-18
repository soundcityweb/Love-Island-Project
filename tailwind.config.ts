import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        /**
         * Primary UI font — Nunito (Century Gothic web-equivalent per brand guide).
         * Used for all body text, labels, and UI components.
         */
        sans: ['var(--font-nunito)', 'Century Gothic', 'system-ui', 'sans-serif'],
        /**
         * Display font — Josefin Sans (official Love Island logo typeface).
         * Apply via `font-display` for large headings and the site wordmark.
         */
        display: ['var(--font-josefin)', 'Josefin Sans', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'monospace'],
      },
      colors: {
        /**
         * Love Island brand palette — available as explicit utilities:
         * bg-li-sky, text-li-magenta, border-li-ocean, etc.
         */
        li: {
          sky:     '#56D8E5',   /* primary — Light Blue     */
          sand:    '#F9E9B9',   /* primary — Light Yellow   */
          ocean:   '#3A82A6',   /* primary — Dark Blue      */
          magenta: '#FF36A0',   /* secondary — Magenta CTA  */
          yellow:  '#FCFB3A',   /* secondary — Bright Yellow */
          orange:  '#FF7A17',   /* secondary — Bright Orange */
          red:     '#C40610',   /* additional — Deep Red    */
          purple:  '#580CE3',   /* additional — Purple      */
          lime:    '#A3FF36',   /* additional — Lime Green  */
          navy:    '#0B1A25',   /* UI — deep night navy     */
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)'    },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'fade-up':  'fade-up  0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in':  'fade-in  0.45s ease both',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
