import { GOV } from '../shared/site';
import { Gov, GuidePage } from './GuidePage';
import { TAX_YEAR, THIRTY_SALES, VINTED } from './guides';

export default function GuideVinted() {
  return (
    <GuidePage
      guide={VINTED}
      answer={<>Vinted has to report you to HMRC if you make 30 or more sales, or receive more than €2,000 (about £1,700), on Vinted in a calendar year. If you make fewer than 30 sales and receive €2,000 or less, it doesn’t have to report you.</>}
    >
      <h2>Why Vinted reports sellers</h2>
      <p>Since 1 January 2024, online platforms including Vinted, eBay, Etsy and Depop have had to report sellers’ details and sales to HMRC. This comes from the <Gov href={GOV.reporting}>reporting rules for digital platforms</Gov>.</p>

      <h2>The two limits</h2>
      <p>Vinted doesn’t have to report a seller who makes fewer than 30 sales and receives €2,000 or less (about £1,700) in the calendar year. Both conditions must hold. Cross either one and Vinted has to report you.</p>
      <ul>
        <li>30 sales of £5 each is enough, even though the total is only £150.</li>
        <li>10 sales adding up to £2,000 is enough, even though it’s far fewer than 30 sales.</li>
        <li>20 sales adding up to £600 is under both limits, so Vinted doesn’t have to report you.</li>
      </ul>
      <p>The limits are for Vinted alone. Your eBay, Etsy and Depop sales don’t count towards them; each platform counts its own. <a href={THIRTY_SALES.path}>The 30 sales or £1,700 rule</a> explains this in more detail.</p>

      <h2>When Vinted reports</h2>
      <p>Each report covers a calendar year, 1 January to 31 December, and is sent by 31 January the following year. Sales you make on Vinted in 2026 are reported by 31 January 2027.</p>
      <p>That’s a calendar year, not the UK tax year, which runs from 6 April to 5 April. So the Vinted total HMRC receives won’t line up with a tax year. <a href={TAX_YEAR.path}>Why your platform totals don’t match the tax year</a> shows how the two split.</p>

      <h2>Being reported doesn’t mean you owe tax</h2>
      <p>A report tells HMRC what you sold. Whether tax is due depends on whether you’re trading and your profit.</p>
      <p>Selling your own unwanted possessions is usually not trading. Buying things to resell for profit usually is. If you do some of each, keeping the two apart in your records shows which sale was which.</p>
      <p>HMRC has an online checker: <Gov href={GOV.additionalIncome}>check if you need to tell HMRC about additional income</Gov>. If you’re still not sure, ask an accountant.</p>

      <h2>Keep a record either way</h2>
      <p>If Vinted reports you, HMRC sees your Vinted totals for the calendar year. A record of each sale, with its date and whether it was a clear-out sale or something you bought to resell, shows what those totals are made of. Sorting the same sales into UK tax years gives you the figures that match the tax year.</p>
    </GuidePage>
  );
}
