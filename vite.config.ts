import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// One project, several pages: the website (/, /privacy.html, /thanks.html) and the app (/app/).
// `npm run build` writes dist/, which GitHub Actions publishes to resalerecords.com.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        thanks: resolve(__dirname, 'thanks.html'),
        app: resolve(__dirname, 'app/index.html'),
      },
    },
  },
  test: { environment: 'node' },
});
