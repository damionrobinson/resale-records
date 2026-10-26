import { renderToString } from 'react-dom/server';
import { PAGES } from './pages';
import { renderHead } from './site/head';

/** Used only at build time by scripts/prerender.mjs. */
export function render(page: string): string {
  const { Component } = PAGES[page];
  return renderToString(<Component />);
}
export function head(page: string): string | null {
  const h = PAGES[page].head;
  return h ? renderHead(h) : null;
}
export const pages = Object.fromEntries(Object.entries(PAGES).map(([k, v]) => [k, v.file]));
