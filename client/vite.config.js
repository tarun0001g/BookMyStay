// Core modules
const path = require('node:path');

// External modules
const react = require('@vitejs/plugin-react');
const { defineConfig } = require('vite');

// Configures the client dev server and isolated browser tests.
module.exports = defineConfig({
  root: __dirname,
  plugins: [react()],
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
