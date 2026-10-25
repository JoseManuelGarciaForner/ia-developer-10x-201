import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { name: 'page-runtime', environment: 'node' },
});
