import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// One project, several pages: the website (/, the guides, /privacy.html, /thanks.html) and the app (/app/).
// `npm run build` writes dist/, which GitHub Actions publishes to resalerecords.com.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        vinted: resolve(__dirname, 'will-vinted-report-me-to-hmrc.html'),
        thirtySales: resolve(__dirname, 'hmrc-30-sales-rule.html'),
        taxYear: resolve(__dirname, 'tax-year-vs-calendar-year-selling-online.html'),
        firstTime: resolve(__dirname, 'first-tax-return-selling-online.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        thanks: resolve(__dirname, 'thanks.html'),
        app: resolve(__dirname, 'app/index.html'),
      },
    },
  },
  test: { environment: 'node' },
});
