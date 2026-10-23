// Core modules
const path = require('node:path');

// External modules
const react = require('@vitejs/plugin-react');
const tailwind = require('@tailwindcss/vite').default;
const { defineConfig } = require('vite');

// Local modules

// Configures the client dev server and isolated browser tests.
module.exports = defineConfig({
  root: __dirname,
  plugins: [react(), tailwind()],
  server: {
    proxy: { '/api': 'http://localhost:3007' },
  },
  resolve: { alias: { '@': path.join(__dirname, 'src') } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/testSetup.js'],
    include: ['src/**/*.test.jsx'],
  },
  build: { outDir: 'dist', emptyOutDir: true },
});
