import { GOV, TAXAID } from '../shared/site';
import { Gov } from './GuidePage';
import { FIRST_TIME, TAX_YEAR, THIRTY_SALES, VINTED, VINTED_MESSAGE } from './guides';
import { SiteFooter, SiteHeader } from './Layout';
import ReportChecker from './ReportChecker';

const VINTED_REPORTING = 'https://www.vinted.co.uk/uk-reporting';

/** Brief 005. Unlike the other guides it follows its copy's own order: the checker sits mid-page under "Check your
 *  own numbers", the copy has its own call to action, and the FAQ answers are the sections themselves (no FAQ block). */
export default function GuideVintedMessage() {
  return (
    <>
      <SiteHeader />
      <main className="guide">
        <article className="doc">
          <span className="label">Guide</span>
          <h1>{VINTED_MESSAGE.h1}</h1>
          <p className="answer">A message from Vinted about HMRC doesn’t mean you owe tax. It means you’ve made 30 or more sales, or taken more than €2,000 (about £1,700), on Vinted this calendar year, so Vinted has to pass your details to HMRC.</p>

          <h2>Why Vinted is asking</h2>
          <p>Since 1 January 2024, online platforms, Vinted included, have had to report sellers’ details and sales to HMRC. Each report covers a calendar year (January to December) and goes to HMRC by 31 January the following year.</p>
          <p>A platform doesn’t have to report you if you make <strong>fewer than 30 sales and</strong> receive <strong>€2,000 or less</strong> in the year. Go over either one and the platform has to report you. Each platform counts on its own, so Vinted, eBay, Etsy and Depop each make their own decision.</p>
          <p>Vinted’s page says the form is pre-filled, asks you to add one detail, and is due before the end of the year. <Gov href={VINTED_REPORTING}>Vinted: What’s HMRC reporting?</Gov> · <Gov href={GOV.reporting}>GOV.UK: reporting rules for digital platforms</Gov></p>

          <h2>Does it mean I owe tax?</h2>
          <p>No. Being reported is information, not a tax bill. Vinted says the same: meeting the requirements “doesn’t mean you have to pay taxes on your Vinted sales”.</p>
          <p><Gov href={GOV.hmrcNoTaxChanges}>HMRC says</Gov> a platform sharing your sales data “does not automatically mean” you need to complete a tax return. Whether you need to tell HMRC depends on whether you’re trading and on your gross trading income.</p>

          <h2>Am I trading?</h2>
          <p>GOV.UK draws the line like this:</p>
          <ul>
            <li>If you’re selling personal possessions, you “probably do not have to pay Income Tax”.</li>
            <li>If you sell goods you bought intending to sell for a profit, you’re “probably trading”.</li>
          </ul>
          <p><Gov href={GOV.onlinePlatformsIncome}>GOV.UK: check if you need to tell HMRC about income from online platforms</Gov></p>
          <p>Many sellers do a bit of both. If you’re not sure where you stand, <Gov href={GOV.additionalIncome}>HMRC’s free checker</Gov> asks the questions and tells you whether you need to send a tax return. An accountant or the charity <Gov href={TAXAID}>TaxAid</Gov> can help with anything bigger or messier.</p>

          <h2>If you are trading</h2>
          <p>The <strong>trading allowance</strong> is £1,000 of gross trading income (your takings, before costs) per tax year. GOV.UK says that above that you tell HMRC by registering for Self Assessment. On a return you can deduct the £1,000 allowance <strong>or</strong> your actual costs, not both. <Gov href={GOV.allowance}>GOV.UK: trading allowance</Gov></p>
          <p>The deadline to file and pay for the 2025/26 tax year is <strong>31 January 2027</strong>.</p>

          <h2>Watch the dates</h2>
          <p>Vinted reports by calendar year. Tax runs from <strong>6 April to 5 April</strong>. So the total Vinted sends HMRC covers different months from your tax year, and it usually won’t match: it covers parts of two tax years. <a href={TAX_YEAR.path}>Why your platform totals don’t match the tax year</a></p>

          <h2>Check your own numbers</h2>
          <ReportChecker />

          <p>Want every sale sorted into the tax year, with clear-outs kept apart from things you bought to sell on? <a href="/app/">Try Resale Records</a>: paste your Vinted payment history or import eBay, Etsy and Depop files. Free for up to 20 sales; £19 once to unlock. Your sales stay on your device.</p>
          <p><strong>More guides:</strong> <a href={VINTED.path}>Will Vinted report me to HMRC?</a> · <a href={THIRTY_SALES.path}>The 30 sales or £1,700 rule</a> · <a href={FIRST_TIME.path}>Never done a tax return?</a></p>
          <p className="disclaimer"><em>Resale Records is a record-keeping tool, not tax advice. Not affiliated with HMRC or Vinted.</em></p>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
