import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Builds into ../app so GitHub Pages serves it at https://resalerecords.com/app/.
// This _src folder isn't published (GitHub Pages skips folders starting with "_").
export default defineConfig({
  plugins: [react()],
  base: '/app/',
  build: { outDir: '../app', emptyOutDir: true },
  test: { environment: 'node' },
});
