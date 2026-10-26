// After `vite build`, renders each website page to HTML so search engines and slow phones get the
// full content immediately; React then takes over in the browser. The app (/app/) isn't pre-rendered
// because it depends on data saved in the visitor's browser.
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { render, pages } = await import(pathToFileURL(join(root, 'dist-ssr/entry-server.js')).href);

for (const [page, file] of Object.entries(pages)) {
  const path = join(root, 'dist', file);
  const html = readFileSync(path, 'utf8');
  if (!html.includes('<!--ssr-->')) throw new Error(`${file} has no <!--ssr--> placeholder`);
  writeFileSync(path, html.replace('<!--ssr-->', render(page)));
  console.log(`pre-rendered ${file}`);
}
rmSync(join(root, 'dist-ssr'), { recursive: true, force: true });
