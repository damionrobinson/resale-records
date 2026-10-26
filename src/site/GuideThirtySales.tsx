import { GOV } from '../shared/site';
import { Gov, GuidePage } from './GuidePage';
import { TAX_YEAR, THIRTY_SALES, VINTED } from './guides';

export default function GuideThirtySales() {
  return (
    <GuidePage
      guide={THIRTY_SALES}
      answer={<>Each selling platform has to report you to HMRC if you make 30 or more sales, or receive more than €2,000 (about £1,700), on that platform in a calendar year. It’s a reporting rule, not a tax rule: it decides what HMRC is told, not whether you owe anything.</>}
    >
      <h2>Where the rule comes from</h2>
      <p>Since 1 January 2024, online platforms including Vinted, eBay, Etsy and Depop have had to report sellers’ details and sales to HMRC under the <Gov href={GOV.reporting}>reporting rules for digital platforms</Gov>. The rules include an exception for small sellers, and that exception is where the 30 sales and £1,700 figures come from.</p>

      <h2>How the two limits work together</h2>
      <p>A platform doesn’t have to report a seller who makes fewer than 30 sales and receives €2,000 or less in the calendar year. Both conditions must hold. If you reach 30 sales, or go over €2,000, the platform has to report you.</p>
      <div className="table-wrap">
        <table>
          <thead><tr><th scope="col">Sales on one platform in a year</th><th scope="col">Received</th><th scope="col">Does it have to report you?</th></tr></thead>
          <tbody>
            <tr><td>20</td><td>£600</td><td>No: under both limits</td></tr>
            <tr><td>30</td><td>£150</td><td>Yes: 30 sales</td></tr>
            <tr><td>12</td><td>£2,000</td><td>Yes: more than about £1,700</td></tr>
            <tr><td>45</td><td>£2,500</td><td>Yes: both limits</td></tr>
          </tbody>
        </table>
      </div>

      <h2>Why “about” £1,700?</h2>
      <p>The limit is set in euros: €2,000. In pounds that’s about £1,700, depending on the exchange rate, so treat £1,700 as approximate.</p>

      <h2>Each platform counts separately</h2>
      <p>The limits apply to each platform on its own. Your sales aren’t added up across platforms.</p>
      <ul>
        <li>25 sales on Vinted and 25 on eBay, each under £1,700: neither platform has to report you, even though that’s 50 sales in total.</li>
        <li>40 sales on Vinted and 5 on Depop, with Depop under £1,700: Vinted has to report you; Depop doesn’t.</li>
      </ul>
      <p>So it’s worth checking each platform you sell on. The free check on this page does that.</p>

      <h2>It counts by calendar year</h2>
      <p>The limits apply to a calendar year, 1 January to 31 December. Reports are sent by 31 January the following year, so sales in 2026 are reported by 31 January 2027. The UK tax year runs from 6 April to 5 April instead, so a platform’s yearly total won’t match a tax year. <a href={TAX_YEAR.path}>Why your platform totals don’t match the tax year</a> explains the difference.</p>

      <h2>What being reported means</h2>
      <p>Being reported doesn’t mean you owe tax. Whether tax is due depends on whether you’re trading and your profit. Selling your own unwanted possessions is usually not trading. Buying things to resell for profit usually is.</p>
      <p>HMRC’s online checker can help: <Gov href={GOV.additionalIncome}>check if you need to tell HMRC about additional income</Gov>. If you’re still not sure, ask an accountant. For Vinted in particular, see <a href={VINTED.path}>Will Vinted report me to HMRC?</a></p>
    </GuidePage>
  );
}
