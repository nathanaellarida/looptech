import { defineConfig } from 'vitest/config'

// Test config kept separate from vite.config.js so the dev-server proxy does
// not affect the unit test run.
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.js'],
    globals: false,
  },
})
