import type { PageHead } from './head';

/** The search guides: one entry each, used for the page's <head>, its FAQ, the home page's Guides list
 *  and each guide's "More guides" links. Copy follows docs/dev-briefs/001: published rules only, never advice. */
export type Guide = PageHead & { key: string; h1: string; blurb: string };

export const VINTED: Guide = {
  key: 'vinted',
  path: '/will-vinted-report-me-to-hmrc.html',
  type: 'article',
  title: 'Will Vinted report me to HMRC? · Resale Records',
  description: 'Vinted has to report you to HMRC after 30 sales, or more than about £1,700, in a calendar year. When it reports, and what being reported means.',
  h1: 'Will Vinted report me to HMRC?',
  blurb: 'The two limits, when Vinted sends its report, and what being reported does and doesn’t mean.',
  faqs: [
    { q: 'How many sales before Vinted reports you to HMRC?', a: 'Vinted has to report you if you make 30 or more sales, or receive more than €2,000 (about £1,700), on Vinted in a calendar year. If you make fewer than 30 sales and receive €2,000 or less, it doesn’t have to report you.' },
    { q: 'When does Vinted send its report to HMRC?', a: 'Reports cover a calendar year, 1 January to 31 December, and are sent by 31 January the following year. Sales you make in 2026 are reported by 31 January 2027.' },
    { q: 'Does being reported by Vinted mean I owe tax?', a: 'No. Being reported doesn’t mean you owe tax. Whether tax is due depends on whether you’re trading and your profit. HMRC has an online checker, or you can ask an accountant.' },
    { q: 'Do my eBay or Depop sales count towards Vinted’s limits?', a: 'No. Each platform counts separately. Vinted looks only at your Vinted sales, and eBay, Etsy and Depop each look only at their own.' },
  ],
};

export const THIRTY_SALES: Guide = {
  key: 'thirty-sales',
  path: '/hmrc-30-sales-rule.html',
  type: 'article',
  title: 'The 30 sales or £1,700 rule, explained · Resale Records',
  description: 'Vinted, eBay, Etsy and Depop each report sellers to HMRC after 30 sales or about £1,700 in a calendar year. How the two limits work, with examples.',
  h1: 'The 30 sales or £1,700 rule for selling online, explained',
  blurb: 'How the two limits work together, why it’s “about” £1,700, and why each platform counts on its own.',
  faqs: [
    { q: 'Is it 30 sales or £1,700, or both?', a: 'Either one. A platform has to report you if you make 30 or more sales, or receive more than €2,000 (about £1,700), in a calendar year. It only doesn’t have to report you if both hold: fewer than 30 sales and €2,000 or less.' },
    { q: 'Is the 30 sales limit for all my platforms added together?', a: 'No. Each platform counts separately. 25 sales on Vinted and 25 on eBay is 25 sales for each platform, not 50.' },
    { q: 'Is the £1,700 limit exact?', a: 'No. The limit is set in euros: €2,000. In pounds that’s about £1,700, depending on the exchange rate, so treat £1,700 as approximate.' },
    { q: 'If a platform reports me, do I owe tax?', a: 'Not necessarily. Being reported doesn’t mean you owe tax. Whether tax is due depends on whether you’re trading and your profit.' },
  ],
};

export const TAX_YEAR: Guide = {
  key: 'tax-year',
  path: '/tax-year-vs-calendar-year-selling-online.html',
  type: 'article',
  title: 'Tax year vs calendar year for sellers · Resale Records',
  description: 'Platforms report your sales to HMRC by calendar year, but the UK tax year runs 6 April to 5 April. Why the totals differ, with a worked example.',
  h1: 'Why your platform totals don’t match the tax year',
  blurb: 'Platforms report by calendar year; the tax year starts on 6 April. A worked example of how the totals split.',
  faqs: [
    { q: 'Why doesn’t my Vinted total match my tax year?', a: 'Vinted reports by calendar year, 1 January to 31 December. The UK tax year runs from 6 April to 5 April. The two periods cover different months, so the totals differ unless you sort your sales by date into tax years.' },
    { q: 'Which tax year is a sale made on 1 March 2026 in?', a: 'The 2025/26 tax year, which runs from 6 April 2025 to 5 April 2026. On a platform’s report it counts in the 2026 calendar year.' },
    { q: 'When is the Self Assessment deadline for the 2025/26 tax year?', a: '31 January 2027. That’s also the date by which platforms report your 2026 calendar-year sales, so the two sets of figures you see that January cover different periods.' },
    { q: 'Is the £1,000 trading allowance per calendar year or per tax year?', a: 'Per tax year. It’s £1,000 of gross trading income for each tax year, 6 April to 5 April.' },
  ],
};

export const GUIDES: Guide[] = [VINTED, THIRTY_SALES, TAX_YEAR];
