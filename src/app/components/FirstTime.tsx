import * as C from '../../core';
import { Term } from '../../shared/Glossary';
import { GOV } from '../../shared/site';
import { gbp, longDate } from '../state';

const ext = { target: '_blank', rel: 'noopener' } as const;
const dateOf = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return longDate(new Date(y, m - 1, d)); };

/** "First time? Your steps" (brief 002): the user's takings beside GOV.UK's £1,000 rule, then the Self Assessment
 *  steps with dates for the selected tax year. States what GOV.UK says; never tells the user what applies to them. */
export default function FirstTime({ taxYear, takings, unsortedCount, capped = false, onUnlock }: {
  taxYear: string; takings: number; unsortedCount: number;
  /** The free limit is full, so `takings` may be only part of the year: show neither £1,000 branch. */
  capped?: boolean;
  onUnlock?: () => void;
}) {
  const { registerBy, fileAndPayBy } = C.selfAssessmentDates(taxYear);
  const over = C.allowanceStatement(takings) === 'over';
  const passed = C.registrationPassed(taxYear, C.localISO(new Date()));
  return (
    <section className="first-time">
      <h3>First time? Your steps</h3>
      <p>Your bought-to-resell takings for {taxYear}: <strong>{gbp(takings)}</strong>.</p>
      {capped
        ? <p>The free version only counts your first {C.FREE_SALES_LIMIT} sales, so this isn’t your full takings for {taxYear}. {onUnlock ? <button className="linklike" type="button" onClick={onUnlock}>Unlock to add the rest</button> : 'Unlock to add the rest'}. GOV.UK says anyone with gross trading income over £1,000 in a tax year must tell HMRC by registering for <Term term="Self Assessment" />. <a href={GOV.allowance} {...ext}>GOV.UK: trading allowance</a></p>
        : over
        ? <p>GOV.UK says anyone with gross trading income over £1,000 in a tax year must tell HMRC by registering for <Term term="Self Assessment" />. <a href={GOV.allowance} {...ext}>GOV.UK: trading allowance</a></p>
        : <p>GOV.UK says that with gross trading income of £1,000 or less you may not have to tell HMRC, but there are circumstances when you must register for <Term term="Self Assessment" />. <a href={GOV.allowance} {...ext}>GOV.UK: trading allowance</a></p>}
      {unsortedCount > 0 && <p className="ft-warn">{unsortedCount} sale{unsortedCount === 1 ? ' isn’t' : 's aren’t'} sorted yet, so this figure is incomplete until you mark each one as bought to resell or personal.</p>}
      <p>GOV.UK’s steps if you need to file a return:</p>
      <ol>
        <li>Check whether you need to tell HMRC about this income: <a href={GOV.additionalIncome} {...ext}>HMRC’s checker</a>.</li>
        <li><a href={GOV.register} {...ext}>Register for Self Assessment</a>. {passed
          ? <>For a first return, GOV.UK asked you to register by {dateOf(registerBy)}. That date has passed. GOV.UK says registering after it could mean a penalty: <a href={GOV.penalties} {...ext}>GOV.UK: penalties</a>.</>
          : <>For a first return, GOV.UK asks you to register by {dateOf(registerBy)}; registering after that could mean a penalty.</>}</li>
        <li>Wait for your <Term term="UTR" />. <a href={GOV.replyTime} {...ext}>Check when to expect HMRC’s reply</a>.</li>
        <li><a href={GOV.fileOnline} {...ext}>File your return online</a> by {dateOf(fileAndPayBy)}. You sign in with <Term term="Government Gateway or GOV.UK One Login" />.</li>
        <li><a href={GOV.pay} {...ext}>Pay any tax due</a> by {dateOf(fileAndPayBy)}.</li>
      </ol>
      <p className="ft-note">Not sure whether you’re trading? Use <a href={GOV.additionalIncome} {...ext}>HMRC’s checker</a> or ask an accountant. Deadlines: <a href={GOV.deadlines} {...ext}>GOV.UK</a>.</p>
    </section>
  );
}

/** "Figures you'll be asked for", in plain words, for the tax year record. No Self Assessment box numbers. */
export function FiguresAskedFor({ takings, cost, fees, feeGaps = [] }: { takings: number; cost: number; fees: number; feeGaps?: string[] }) {
  return (
    <ul className="ft-figures">
      <li><strong>Takings</strong> from items bought to resell: {gbp(takings)}.</li>
      <li>If you use your <strong>actual costs</strong>: what you paid for those items, {gbp(cost)}, plus platform fees, {gbp(fees)}{feeGaps.length > 0 && ` (may be incomplete for ${C.listWords(feeGaps)}: check your platform’s statement)`}.</li>
      <li><strong>Or instead</strong>, the £1,000 <Term term="trading allowance" />. You can use one or the other, not both.</li>
    </ul>
  );
}
