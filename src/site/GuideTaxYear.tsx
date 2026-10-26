import { GOV } from '../shared/site';
import { Gov, GuidePage } from './GuidePage';
import { TAX_YEAR, THIRTY_SALES, VINTED } from './guides';

export default function GuideTaxYear() {
  return (
    <GuidePage
      guide={TAX_YEAR}
      answer={<>Selling platforms report your sales to HMRC by calendar year, 1 January to 31 December. The UK tax year runs from 6 April to 5 April, so a platform’s yearly total and your tax-year total cover different months and won’t match.</>}
    >
      <h2>Two different years</h2>
      <p>Since 1 January 2024, online platforms including Vinted, eBay, Etsy and Depop have had to report sellers’ details and sales to HMRC under the <Gov href={GOV.reporting}>reporting rules for digital platforms</Gov>. Each report covers a calendar year and is sent by 31 January the following year.</p>
      <p>The UK tax year is different. It runs from 6 April one year to 5 April the next, and Self Assessment works on the tax year. The 2025/26 tax year runs from 6 April 2025 to 5 April 2026.</p>

      <h2>An example</h2>
      <p>Say you sold £600 on Vinted during 2026: £200 between 1 January and 5 April, and £400 from 6 April to the end of December.</p>
      <div className="table-wrap">
        <table>
          <thead><tr><th scope="col">Sales made</th><th scope="col">Calendar year (platform report)</th><th scope="col">UK tax year</th></tr></thead>
          <tbody>
            <tr><td>1 Jan – 5 Apr 2026: £200</td><td>2026</td><td>2025/26</td></tr>
            <tr><td>6 Apr – 31 Dec 2026: £400</td><td>2026</td><td>2026/27</td></tr>
          </tbody>
        </table>
      </div>
      <p>Vinted’s 2026 report shows £600. But only £200 of that falls in the 2025/26 tax year. The other £400 belongs to 2026/27. The 2025/26 tax year also picks up your sales from 6 April to 31 December 2025, which were on Vinted’s 2025 report.</p>

      <h2>Same deadline, different years</h2>
      <p>The <Gov href={GOV.deadlines}>Self Assessment deadline</Gov> for the 2025/26 tax year is 31 January 2027. Platforms send their reports for the 2026 calendar year by the same date. So in January 2027 you’ll be looking at two sets of figures that cover different periods: 6 April 2025 to 5 April 2026 for the tax year, and 1 January to 31 December 2026 for the platform reports.</p>

      <h2>The trading allowance runs on the tax year too</h2>
      <p>The <Gov href={GOV.allowance}>trading allowance</Gov> is £1,000 of gross trading income per tax year. You can deduct it instead of your actual costs, not as well as them. Because it’s per tax year, it’s the tax-year figures that matter for it, not the platform totals.</p>
      <p>Whether you’re trading at all depends on what you sell. Selling your own unwanted possessions is usually not trading. Buying things to resell for profit usually is. HMRC’s checker can help: <Gov href={GOV.additionalIncome}>check if you need to tell HMRC about additional income</Gov>. Being reported doesn’t mean you owe tax.</p>

      <h2>Lining the two up</h2>
      <p>To get tax-year figures, you sort each sale by its date: before or after 6 April. With one platform and a few sales that’s a short job. With several platforms and hundreds of sales, the dates come in different formats and it takes longer. That’s what Resale Records does: it reads your sales files and sorts every sale into its UK tax year, alongside each platform’s calendar-year total.</p>
      <p>For the reporting limits themselves, see <a href={THIRTY_SALES.path}>the 30 sales or £1,700 rule</a> and <a href={VINTED.path}>Will Vinted report me to HMRC?</a></p>
    </GuidePage>
  );
}
