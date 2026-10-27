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

export const FIRST_TIME: Guide = {
  key: 'first-time',
  path: '/first-tax-return-selling-online.html',
  type: 'article',
  title: 'First tax return for online sellers · Resale Records',
  description: 'Never done a tax return and sell on Vinted, eBay, Etsy or Depop? The £1,000 rule, the 5 October and 31 January dates and the steps, from GOV.UK.',
  h1: 'Never done a tax return? What Vinted, eBay, Etsy and Depop sellers need to know',
  blurb: 'The £1,000 rule, the dates that matter for 2025/26, what happens if you’re late, and the steps in order.',
  faqs: [
    { q: 'Do I need to do a tax return if I sell on Vinted?', a: 'It depends on whether you’re trading and on your gross trading income. GOV.UK says you must tell HMRC about gross trading income over £1,000 by registering for Self Assessment. Selling your own unwanted things occasionally is treated differently, and HMRC’s online checker can help you work out which applies.' },
    { q: 'When do I need to register for Self Assessment?', a: 'For a first tax return for the 2025/26 tax year, GOV.UK says you must tell HMRC by 5 October 2026. Telling HMRC after that date could mean a penalty.' },
    { q: 'When is the deadline to file and pay for 2025/26?', a: '31 January 2027, for an online return and for paying any tax due.' },
    { q: 'What happens if I file or pay late?', a: 'GOV.UK lists a £100 penalty for a late return, then daily penalties of £10 after 3 months (up to £900), then 5% of the tax due or £300, whichever is greater, at 6 and 12 months. Paying late adds 5% of the unpaid tax at 30 days, 6 months and 12 months, plus interest.' },
  ],
};

// Brief 005: copy from docs/outreach/drafts/G-007 "Page A", word for word, with the brief's settled changes.
// The FAQ answers are the opening text of each page section (no separate FAQ block on this page).
export const VINTED_MESSAGE: Guide = {
  key: 'vinted-message',
  path: '/vinted-hmrc-message.html',
  type: 'article',
  title: 'Vinted sent me an HMRC message: what now? · Resale Records',
  description: 'Vinted asks sellers with 30+ sales or over €2,000 to fill in an HMRC form. What it means, why it isn’t a tax bill, and what GOV.UK says to check next.',
  ogTitle: 'Vinted sent me an HMRC message: what now?',
  ogDescription: 'Being reported isn’t a tax bill. What the message means and what to check next, with GOV.UK’s rules.',
  h1: 'Vinted sent me an HMRC message: what now?',
  blurb: 'What the message means, why it isn’t a tax bill, and what GOV.UK says to check next.',
  faqs: [
    { q: 'Why has Vinted asked me for information for HMRC?', a: 'Since 1 January 2024, online platforms, Vinted included, have had to report sellers’ details and sales to HMRC. Each report covers a calendar year (January to December) and goes to HMRC by 31 January the following year.' },
    { q: 'Does it mean I owe tax?', a: 'No. Being reported is information, not a tax bill. Vinted says the same: meeting the requirements “doesn’t mean you have to pay taxes on your Vinted sales”. HMRC says a platform sharing your sales data “does not automatically mean” you need to complete a tax return. Whether you need to tell HMRC depends on whether you’re trading and on your gross trading income.' },
    { q: 'Do I have to pay tax on my Vinted sales?', a: 'HMRC says a platform sharing your sales data “does not automatically mean” you need to complete a tax return. GOV.UK says if you’re selling personal possessions you “probably do not have to pay Income Tax”, but you’re “probably trading” if you sell goods you bought intending to sell for a profit. Whether you need to tell HMRC depends on whether you’re trading and on your gross trading income: HMRC’s checker can help.' },
    { q: 'Is selling my old clothes on Vinted trading?', a: 'GOV.UK draws the line like this: if you’re selling personal possessions, you “probably do not have to pay Income Tax”. If you sell goods you bought intending to sell for a profit, you’re “probably trading”.' },
    { q: 'How much can I sell before I need to tell HMRC?', a: 'The trading allowance is £1,000 of gross trading income (your takings, before costs) per tax year. GOV.UK says that above that you tell HMRC by registering for Self Assessment. On a return you can deduct the £1,000 allowance or your actual costs, not both.' },
  ],
};

export const GUIDES: Guide[] = [VINTED, THIRTY_SALES, TAX_YEAR, FIRST_TIME, VINTED_MESSAGE];
