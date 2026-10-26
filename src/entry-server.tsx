import { renderToString } from 'react-dom/server';
import { PAGES } from './pages';

/** Used only at build time by scripts/prerender.mjs. */
export function render(page: string): string {
  const { Component } = PAGES[page];
  return renderToString(<Component />);
}
export const pages = Object.fromEntries(Object.entries(PAGES).map(([k, v]) => [k, v.file]));
