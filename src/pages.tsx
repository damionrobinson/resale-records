import type { ComponentType } from 'react';
import GuideTaxYear from './site/GuideTaxYear';
import GuideThirtySales from './site/GuideThirtySales';
import GuideVinted from './site/GuideVinted';
import { TAX_YEAR, THIRTY_SALES, VINTED } from './site/guides';
import type { PageHead } from './site/head';
import Home from './site/Home';
import Privacy from './site/Privacy';
import Thanks from './site/Thanks';

const HOME_HEAD: PageHead = {
  path: '/',
  type: 'website',
  title: 'Resale Records',
  description: 'Sell on Vinted, eBay, Etsy or Depop? Get your sales into a UK tax-year record before 31 January, and see when each platform reports you to HMRC.',
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
};
