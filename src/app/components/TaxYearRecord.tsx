import { useState } from 'react';
import * as C from '../../core';
import type { Sale } from '../../core';
import { gbp, longDate, ukDate } from '../state';
import FirstTime, { FiguresAskedFor } from './FirstTime';

const GOV_ALLOWANCE = 'https://www.gov.uk/guidance/tax-free-allowances-on-property-and-trading-income';
const GOV_REPORTING = 'https://www.gov.uk/guidance/reporting-rules-for-digital-platforms';
const KIND_LABEL = { resale: 'Resale', personal: 'Personal', unsorted: 'Not sorted' } as const;

interface Props {
  sales: Sale[];
  taxYear: string;
  setTaxYear: (y: string) => void;
  unlocked: boolean;
  onBack: () => void;
  onPrint: () => void;
  onExportCSV: () => void;
}

export default function TaxYearRecord({ sales, taxYear, setTaxYear, unlocked, onBack, onPrint, onExportCSV }: Props) {
  const [name, setName] = useState('');
  const r = C.taxYearRecord(sales, taxYear);
  const s = r.summary;
  const start = C.taxYearStart(taxYear);
  const years = C.taxYearsIn(sales);
  const platforms = Object.entries(s.byPlatform).sort((a, b) => a[0].localeCompare(b[0]));
  const byPlatformKind = (p: string, k: Sale['kind']) => r.sales.filter((x) => x.platform === p && x.kind === k).reduce((a, x) => a + x.amount, 0);
  const complete = s.unsortedCount === 0 && s.missingCost === 0;
  const today = new Date();
  const capped = !unlocked && sales.length >= C.FREE_SALES_LIMIT; // some sales may not be here yet
  const feeGaps = C.incompleteFeePlatforms(sales, taxYear);

  return (
    <div className="record-view">
      <div className="record-toolbar no-print">
        <button className="btn ghost small" type="button" onClick={onBack}>← Back to sales</button>
        <select aria-label="Tax year" value={taxYear} onChange={(e) => setTaxYear(e.target.value)}>{years.map((y) => <option key={y}>{y}</option>)}</select>
        <label className="name-field">Name on record (optional)<input type="text" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /></label>
        <span className="spacer" />
        <button className="btn small ghost" type="button" onClick={onExportCSV}>Download CSV</button>
        <button className="btn small" type="button" onClick={onPrint}>{unlocked ? 'Print / Save as PDF' : 'Unlock to print or save'}</button>
      </div>

      {!unlocked && <p className="print-locked">Unlock Resale Records to print or save your tax year record.</p>}

      <article className={`record${unlocked ? '' : ' locked'}`} aria-label={`Tax year record ${taxYear}`}>
        {!unlocked && <div className="watermark" aria-hidden="true">Preview</div>}

        <header className="rec-head">
          <div>
            <div className="rec-brand">Resale<span>Records</span></div>
            <h1>Tax year record {taxYear}</h1>
            <p>6 April {start} to 5 April {start + 1}{name ? ` · ${name}` : ''}</p>
          </div>
          <dl className="rec-meta">
            <div><dt>Prepared</dt><dd>{longDate(today)}</dd></div>
            <div><dt>Sales in this tax year</dt><dd>{s.count}</dd></div>
            <div><dt>Status</dt><dd className={complete ? 'ok' : 'flag'}>{complete ? 'Complete' : 'Needs attention'}</dd></div>
          </dl>
        </header>

        {!complete && (
          <div className="rec-warn">
            {s.unsortedCount > 0 && <p>{s.unsortedCount} sale{s.unsortedCount === 1 ? ' is' : 's are'} not yet marked as resale or personal ({gbp(s.unsorted)}). They aren't counted in the figures below.</p>}
            {s.missingCost > 0 && <p>{s.missingCost} resale sale{s.missingCost === 1 ? ' is' : 's are'} missing what you paid, so profit using actual costs is overstated.</p>}
          </div>
        )}

        <section className="rec-sec">
          <h2><span>1</span>Items bought to resell</h2>
          <table className="rec-fig">
            <tbody>
              <tr><th>Takings from items bought to resell</th><td>{gbp(s.resale)}</td></tr>
              <tr><th>Less: what you paid for those items</th><td>{gbp(-s.resaleCost)}</td></tr>
              <tr><th>Less: platform fees</th><td>{gbp(-s.resaleFees)}</td></tr>
              {feeGaps.length > 0 && <tr className="note"><td colSpan={2}>Fees may be incomplete for {C.listWords(feeGaps)} sales imported from a file. These files don’t include every fee, so profit with actual costs may be too high. Check your platform’s statement.</td></tr>}
              <tr className="total"><th>Profit using actual costs</th><td>{gbp(r.actualCostsProfit)}</td></tr>
            </tbody>
          </table>
          <div className="rec-alt">
            <h3>The £1,000 trading allowance, the other way</h3>
            <table className="rec-fig">
              <tbody>
                <tr><th>Takings from items bought to resell</th><td>{gbp(s.resale)}</td></tr>
                <tr><th>Less: trading allowance</th><td>{gbp(-Math.min(s.resale, C.TRADING_ALLOWANCE))}</td></tr>
                <tr className="total"><th>Profit using the trading allowance</th><td>{gbp(r.allowanceProfit)}</td></tr>
              </tbody>
            </table>
            <p>GOV.UK lets you deduct either your actual costs or the £1,000 trading allowance, not both. Which applies depends on your circumstances. <a href={GOV_ALLOWANCE}>gov.uk/guidance/tax-free-allowances-on-property-and-trading-income</a></p>
          </div>
        </section>

        <section className="rec-sec">
          <h2><span>2</span>Figures you’ll be asked for</h2>
          <FiguresAskedFor takings={s.resale} cost={s.resaleCost} fees={s.resaleFees} feeGaps={feeGaps} />
          <p className="rec-note">Plain-English names for the figures, not form box numbers. Check the form and GOV.UK guidance as you fill it in.</p>
        </section>

        <section className="rec-sec">
          <h2><span>3</span>Personal clear-out</h2>
          <table className="rec-fig">
            <tbody><tr className="total"><th>Takings from selling your own things</th><td>{gbp(s.personal)}</td></tr></tbody>
          </table>
          <p className="rec-note">Selling your own possessions is usually different from trading. This record keeps them separate so you can show which sales were which.</p>
        </section>

        <section className="rec-sec">
          <h2><span>4</span>By platform, this tax year</h2>
          <table className="rec-tab">
            <thead><tr><th>Platform</th><th>Sales</th><th>Resale</th><th>Personal</th><th>Not sorted</th><th>Total</th></tr></thead>
            <tbody>
              {platforms.map(([p, v]) => (
                <tr key={p}><td>{p}</td><td>{v.count}</td><td>{gbp(byPlatformKind(p, 'resale'))}</td><td>{gbp(byPlatformKind(p, 'personal'))}</td><td>{gbp(byPlatformKind(p, 'unsorted'))}</td><td><strong>{gbp(v.total)}</strong></td></tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rec-sec">
          <h2><span>5</span>What your platforms report to HMRC</h2>
          <p className="rec-note">Platforms report by calendar year (1 January to 31 December), so these totals won't match the tax year above. A platform reports you once you make 30 sales or take more than about £1,700 (€2,000) on it in a calendar year. <a href={GOV_REPORTING}>gov.uk/guidance/reporting-rules-for-digital-platforms</a></p>
          <div className="rec-cal">
            {r.calendarReports.map((c) => (
              <div key={c.year}>
                <h3>Calendar year {c.year}{c.year === today.getFullYear() ? ' (so far)' : ''}</h3>
                {c.rows.length ? (
                  <table className="rec-tab">
                    <thead><tr><th>Platform</th><th>Sales</th><th>Total</th><th>Over the limit?</th></tr></thead>
                    <tbody>{c.rows.map((x) => <tr key={x.platform}><td>{x.platform}</td><td>{x.count}</td><td>{gbp(x.total)}</td><td>{x.reported ? 'Yes' : capped ? 'Can’t tell' : 'No'}</td></tr>)}</tbody>
                  </table>
                ) : <p className="rec-note">No sales recorded.</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="rec-sec">
          <h2><span>6</span>Month by month</h2>
          <table className="rec-tab">
            <thead><tr><th>Month</th><th>Sales</th><th>Resale</th><th>Personal</th><th>Not sorted</th></tr></thead>
            <tbody>
              {r.months.map((m) => (
                <tr key={m.key} className={m.count ? '' : 'muted'}><td>{m.label}{m.key.endsWith('-03') ? ' (+1–5 Apr)' : ''}</td><td>{m.count}</td><td>{gbp(m.resale)}</td><td>{gbp(m.personal)}</td><td>{gbp(m.unsorted)}</td></tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rec-sec rec-list">
          <h2><span>7</span>Every sale this tax year</h2>
          <table className="rec-tab">
            <thead><tr><th>Date</th><th>Platform</th><th>Item</th><th>Sold for</th><th>Fees</th><th>You paid</th><th>Type</th></tr></thead>
            <tbody>
              {r.sales.map((x) => (
                <tr key={x.id}><td>{ukDate(x.date)}</td><td>{x.platform}</td><td className="item">{x.item || '–'}</td><td>{gbp(x.amount)}</td><td>{x.fees ? gbp(x.fees) : '–'}</td><td>{x.cost == null ? '–' : gbp(x.cost)}</td><td>{KIND_LABEL[x.kind]}</td></tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rec-sec">
          <h2><span>8</span>If this is your first tax return</h2>
          <FirstTime taxYear={taxYear} takings={s.resale} unsortedCount={s.unsortedCount} capped={capped} />
        </section>

        <footer className="rec-foot">
          <p><strong>Record-keeping summary, not tax advice.</strong> Figures come from the sales you imported or entered. Check them, and use GOV.UK or an accountant before filing. Your data stayed on your device.</p>
          <p>Resale Records · resalerecords.com · a trading name of Design Definition Limited (15183622)</p>
        </footer>
      </article>
    </div>
  );
}
