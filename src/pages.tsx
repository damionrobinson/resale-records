import type { ComponentType } from 'react';
import Home from './site/Home';
import Privacy from './site/Privacy';
import Thanks from './site/Thanks';

/** Website pages: pre-rendered to HTML at build time, then made interactive in the browser. */
export const PAGES: Record<string, { file: string; Component: ComponentType }> = {
  home: { file: 'index.html', Component: Home },
  privacy: { file: 'privacy.html', Component: Privacy },
  thanks: { file: 'thanks.html', Component: Thanks },
};
