import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#0D5C63", // Midnight Teal
                    foreground: "#FFFFFF",
                },
                secondary: {
                    DEFAULT: "#C5A059", // Elegant Gold
                    foreground: "#FFFFFF",
                },
                background: "#FDFBF7", // Warm Cream
                foreground: "#2D3748", // Softer Dark Gray
            },
            fontFamily: {
                sans: ['var(--font-geist-sans)'],
                mono: ['var(--font-geist-mono)'],
            },
        },
    },
    plugins: [],
};
export default config;
