/**
 * PostCSS processes CSS before it reaches the browser.
 * This wires Tailwind (utility classes) + autoprefixer (vendor prefixes).
 * You should never need to edit this file.
 */
const config = {
  plugins: {
    tailwindcss: {}, // reads tailwind.config.ts
    autoprefixer: {}, // adds -webkit- etc. for older browsers
  },
};

export default config;
