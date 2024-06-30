/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    'postcss-flexbugs-fixes': {},
    'postcss-preset-env': {},
    '@fullhuman/postcss-purgecss': {
      content: [
        './pages/**/*.{js,jsx,ts,tsx}',
        './components/**/*.{js,jsx,ts,tsx}',
      ],
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
    },
  },
};

module.exports = config;
