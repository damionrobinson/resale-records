import { GLOSSARY, Term } from '../shared/Glossary';
import { GOV } from '../shared/site';
import { Gov, GuidePage } from './GuidePage';
import { FIRST_TIME, TAX_YEAR, THIRTY_SALES, VINTED } from './guides';

export default function GuideFirstTime() {
  return (
    <GuidePage
      guide={FIRST_TIME}
      answer={<>If your gross trading income is over £1,000 in a tax year, GOV.UK says you must tell HMRC by registering for Self Assessment. Being reported by a platform doesn’t mean you owe tax: what matters is whether you’re trading, and how much you take.</>}
    >
      <h2>Does this apply to you?</h2>
      <p>GOV.UK says you’re likely to be trading if you sell regularly to make a profit, or make items to sell for profit. Occasionally selling your own unwanted things is treated differently. If you’re not sure which describes you, <Gov href={GOV.additionalIncome}>HMRC’s online checker</Gov> asks a few questions and tells you whether you need to tell HMRC.</p>
      <p>Then there’s the £1,000 <Term term="trading allowance" />. GOV.UK says:</p>
      <ul>
        <li>If your gross trading income is <strong>over £1,000</strong> in a <Term term="tax year" />, you must tell HMRC by registering for <Term term="Self Assessment" />.</li>
        <li>If it’s <strong>£1,000 or less</strong>, you may not have to tell HMRC, but there are circumstances when you must register.</li>
      </ul>
      <p>Gross means your takings before costs. The details are on GOV.UK’s <Gov href={GOV.allowance}>trading allowance page</Gov>.</p>

      <h2>The dates for the 2025/26 tax year</h2>
      <p>The 2025/26 tax year ran from 6 April 2025 to 5 April 2026.</p>
      <ul>
        <li><strong>5 October 2026:</strong> GOV.UK asks first-timers to <Gov href={GOV.register}>register for Self Assessment</Gov> by this date.</li>
        <li><strong>31 January 2027:</strong> the <Gov href={GOV.deadlines}>deadline</Gov> to file your return online and pay any tax due.</li>
      </ul>

      <h2>If you’ve missed 5 October</h2>
      <p>GOV.UK says that if you tell HMRC after 5 October 2026, you could get a penalty. Its <Gov href={GOV.penalties}>penalties page</Gov> explains that if you register after 5 October and don’t pay all of your tax bill by 31 January, you may get a “failure to notify” penalty. The filing and payment deadline is still 31 January 2027.</p>

      <h2>What happens if you’re late</h2>
      <p>GOV.UK lists these penalties for a late return: £100 at first; after 3 months, £10 a day up to £900; after 6 months and again after 12 months, 5% of the tax due or £300, whichever is greater. Paying late adds 5% of the unpaid tax at 30 days, 6 months and 12 months, plus interest.</p>

      <h2>The steps, in order</h2>
      <ol>
        <li>Check whether you’re trading: <Gov href={GOV.additionalIncome}>HMRC’s checker</Gov>.</li>
        <li><Gov href={GOV.register}>Register for Self Assessment</Gov>.</li>
        <li>Wait for your <Term term="UTR" />. <Gov href={GOV.replyTime}>Check when to expect HMRC’s reply</Gov>.</li>
        <li><Gov href={GOV.fileOnline}>File your return online</Gov>. You sign in to HMRC online, for example with a <Term term="Government Gateway" /> user ID.</li>
        <li><Gov href={GOV.pay}>Pay any tax due</Gov> by 31 January.</li>
      </ol>

      <h2>The figures you’ll need</h2>
      <p>In plain words, the figures for your selling are:</p>
      <ul>
        <li>Your <strong>takings</strong> from items you bought to resell, for the tax year.</li>
        <li>Either your <strong>actual costs</strong> (what you paid for those items, plus platform fees), or the <strong>£1,000 trading allowance</strong> instead. You can use one or the other, not both.</li>
      </ul>
      <p>Platforms report your sales by calendar year, so their totals won’t match the tax year. <a href={TAX_YEAR.path}>Why your platform totals don’t match the tax year</a> explains the difference, and <a href={THIRTY_SALES.path}>the 30 sales or £1,700 rule</a> explains when a platform reports you. For Vinted in particular, see <a href={VINTED.path}>Will Vinted report me to HMRC?</a></p>

      <h2>Words you’ll see</h2>
      <dl className="glossary">
        {Object.entries(GLOSSARY).map(([term, def]) => <div key={term}><dt>{term[0].toUpperCase() + term.slice(1)}</dt><dd>{def}</dd></div>)}
      </dl>
      <p>If your situation is more complicated, an accountant can help. If you can’t afford one, the charity <Gov href="https://taxaid.org.uk/i-need-help-with-tax">TaxAid</Gov> helps people who have nowhere else to turn.</p>
    </GuidePage>
  );
}
