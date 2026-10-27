import type { ComponentType } from 'react';
import GuideFirstTime from './site/GuideFirstTime';
import GuideTaxYear from './site/GuideTaxYear';
import GuideVintedMessage from './site/GuideVintedMessage';
import GuideThirtySales from './site/GuideThirtySales';
import GuideVinted from './site/GuideVinted';
import { FIRST_TIME, TAX_YEAR, THIRTY_SALES, VINTED, VINTED_MESSAGE } from './site/guides';
import type { PageHead } from './site/head';
import Home from './site/Home';
import Privacy from './site/Privacy';
import Thanks from './site/Thanks';

const HOME_HEAD: PageHead = {
  path: '/',
  type: 'website',
  title: 'Resale Records',
  description: 'Vinted, eBay, Etsy and Depop. No account, no logins: your sales never leave your device. Check free if you’re over the reporting limits.',
};

/** Website pages: pre-rendered to HTML at build time, then made interactive in the browser.
 *  Pages with a `head` get their title, description, canonical, Open Graph and FAQ tags written in at <!--head-->. */
export const PAGES: Record<string, { file: string; Component: ComponentType; head?: PageHead }> = {
  home: { file: 'index.html', Component: Home, head: HOME_HEAD },
  privacy: { file: 'privacy.html', Component: Privacy },
  thanks: { file: 'thanks.html', Component: Thanks },
  vinted: { file: VINTED.path.slice(1), Component: GuideVinted, head: VINTED },
  thirtySales: { file: THIRTY_SALES.path.slice(1), Component: GuideThirtySales, head: THIRTY_SALES },
  taxYear: { file: TAX_YEAR.path.slice(1), Component: GuideTaxYear, head: TAX_YEAR },
  firstTime: { file: FIRST_TIME.path.slice(1), Component: GuideFirstTime, head: FIRST_TIME },
  vintedMessage: { file: VINTED_MESSAGE.path.slice(1), Component: GuideVintedMessage, head: VINTED_MESSAGE },
};
