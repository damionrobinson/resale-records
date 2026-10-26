import { useState } from 'react';
import { REPORT_GBP, REPORT_SALES } from '../core';

const PLATFORMS = ['Vinted', 'eBay', 'Etsy', 'Depop'] as const;
type Figures = Record<(typeof PLATFORMS)[number], { n: string; t: string }>;
const EXAMPLE: Figures = { Vinted: { n: '34', t: '610' }, eBay: { n: '12', t: '420' }, Etsy: { n: '0', t: '0' }, Depop: { n: '6', t: '140' } };

/** "Will a platform report you?" check. Runs in the browser; nothing is sent anywhere. */
export default function ReportChecker() {
  const [f, setF] = useState<Figures>(EXAMPLE);
  const rows = PLATFORMS.map((p) => {
    const n = Math.max(0, Number(f[p].n) || 0), t = Math.max(0, Number(f[p].t) || 0);
    const yes = n >= REPORT_SALES || t > REPORT_GBP;
    const near = !yes && (n >= REPORT_SALES - 5 || t > REPORT_GBP * 0.85);
    return { p, n, t, yes, near, active: n > 0 || t > 0 };
  });
  const active = rows.filter((r) => r.active);
  const set = (p: (typeof PLATFORMS)[number], k: 'n' | 't', v: string) => setF({ ...f, [p]: { ...f[p], [k]: v } });

  return (
    <div className="checker">
      <form className="rows" onSubmit={(e) => e.preventDefault()}>
        {PLATFORMS.map((p) => (
          <div className="row" key={p}>
            <b>{p}</b>
            <label>Sales<input type="number" min="0" step="1" value={f[p].n} onChange={(e) => set(p, 'n', e.target.value)} /></label>
            <label>Total £<input type="number" min="0" step="1" value={f[p].t} onChange={(e) => set(p, 't', e.target.value)} /></label>
          </div>
        ))}
        <p className="fine">Example figures shown. Platforms convert using their own exchange rate, so treat £1,700 as approximate.</p>
      </form>
      <div className="result" aria-live="polite">
        <span className="label" style={{ color: 'inherit', opacity: 0.7 }}>What the rules say</span>
        <ul>
          {active.length ? active.map((r) => (
            <li key={r.p}>
              <span className={r.yes ? 'yes' : 'no'}>{r.p}: {r.yes ? 'will report you' : r.near ? 'close to the limit' : 'won’t report you yet'}</span>
              {' · '}{r.n} sales, £{r.t.toLocaleString('en-GB')}
            </li>
          )) : <li>Enter your sales above.</li>}
        </ul>
        <p>{active.some((r) => r.yes)
          ? 'Being reported doesn’t mean you owe tax. It means HMRC will see these totals, so it’s worth having a record that explains them.'
          : 'Limits apply to each platform separately: 30 sales, or more than about £1,700, in a calendar year.'}</p>
      </div>
    </div>
  );
}
