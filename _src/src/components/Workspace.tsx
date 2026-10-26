import { useState } from 'react';
import * as C from '../core';
import type { Kind, Sale } from '../core';
import { gbp, ukDate } from '../state';

const GOV_REPORTING = 'https://www.gov.uk/guidance/reporting-rules-for-digital-platforms';
const GOV_ALLOWANCE = 'https://www.gov.uk/guidance/tax-free-allowances-on-property-and-trading-income';

interface Props {
  sales: Sale[];
  taxYear: string;
  calYear: number;
  setTaxYear: (y: string) => void;
  setCalYear: (y: number) => void;
  update: (ids: Set<string>, patch: Partial<Sale> | ((s: Sale) => Partial<Sale>)) => void;
  remove: (id: string) => void;
  onOpenRecord: () => void;
  onImportFile: (f: File) => void;
  onVinted: () => void;
  onAdd: () => void;
  onExportCSV: () => void;
  onBackup: () => void;
  onRestore: (f: File) => void;
  onClear: () => void;
}

export function Summary({ sales, taxYear, calYear, setTaxYear, setCalYear, onOpenRecord }: Props) {
  const years = C.taxYearsIn(sales);
  const cals = [...new Set(sales.map((s) => C.calendarYearOf(s.date)))].sort().reverse();
  const s = C.taxYearSummary(sales, taxYear);
  const start = C.taxYearStart(taxYear);
  const rep = C.reportingCheck(sales, calYear);
  return (
    <aside className="panel">
      <div className="toolbar">
        <h2>Summary</h2>
        <select aria-label="Tax year" value={taxYear} onChange={(e) => setTaxYear(e.target.value)}>{years.map((y) => <option key={y}>{y}</option>)}</select>
      </div>
      <div className="kv">
        <span className="label">Tax year {taxYear} · 6 Apr {start} – 5 Apr {start + 1}</span>
        <div><span>Bought to resell</span><span className="big">{gbp(s.resale)}</span></div>
        <div><span>What you paid</span><span>{gbp(s.resaleCost)}</span></div>
        <div><span>Platform fees</span><span>{gbp(s.resaleFees)}</span></div>
        <div className="sep"><strong>Resale profit</strong><strong>{gbp(s.resaleProfit)}</strong></div>
        <div className="sep"><span>Personal clear-out</span><span>{gbp(s.personal)}</span></div>
        <div><span>Not sorted yet</span><span>{gbp(s.unsorted)}</span></div>
        <div><span>Sales this tax year</span><span>{s.count}</span></div>
      </div>
      {s.unsortedCount > 0 && <div className="callout info">Mark each sale as bought to resell or personal. Unsorted sales aren't counted in either total.</div>}
      {s.missingCost > 0 && <div className="callout info">{s.missingCost} resale {s.missingCost === 1 ? 'sale is' : 'sales are'} missing what you paid, so profit is overstated.</div>}
      {s.overTradingAllowance && <div className="callout">Your bought-to-resell takings are over £{C.TRADING_ALLOWANCE.toLocaleString('en-GB')}, the trading allowance limit. <a href={GOV_ALLOWANCE} target="_blank" rel="noopener">GOV.UK explains what that means</a>.</div>}
      <button className="btn" type="button" onClick={onOpenRecord}>View tax year record</button>

      <div className="toolbar">
        <h2>Platform reports</h2>
        <select aria-label="Calendar year" value={calYear} onChange={(e) => setCalYear(Number(e.target.value))}>{cals.map((y) => <option key={y}>{y}</option>)}</select>
      </div>
      <p className="notice">Each platform reports you to HMRC once you make 30 sales, or take more than about £1,700, on it in a calendar year.</p>
      <div className="rep">
        {rep.length ? rep.map((r) => (
          <div key={r.platform}>
            <strong>{r.platform}</strong>
            <span>{r.count} sale{r.count === 1 ? '' : 's'} · {gbp(r.total)}</span>
            <span className={`chip ${r.reported ? 'flag' : r.near ? '' : 'ok'}`}>{r.reported ? 'Will report' : r.near ? 'Close' : 'Not yet'}</span>
          </div>
        )) : <p className="notice">No sales in this year.</p>}
      </div>
      <p className="notice">A record-keeping tool, not tax advice. See <a href={GOV_REPORTING} target="_blank" rel="noopener">GOV.UK reporting rules</a> and <a href={GOV_ALLOWANCE} target="_blank" rel="noopener">the trading allowance</a>.</p>
    </aside>
  );
}

export function SalesTable(p: Props) {
  const [platform, setPlatform] = useState('');
  const [kind, setKind] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const platforms = [...new Set(p.sales.map((s) => s.platform))].sort();
  const rows = p.sales
    .filter((s) => C.taxYearOf(s.date) === p.taxYear && (!platform || s.platform === platform) && (!kind || s.kind === kind))
    .sort((a, b) => b.date.localeCompare(a.date));
  const ids = () => new Set(rows.map((r) => r.id));
  const toggle = (s: Sale, k: Kind) => p.update(new Set([s.id]), { kind: s.kind === k ? 'unsorted' : k });

  return (
    <section className="panel">
      <div className="toolbar">
        <h2>Sales · {rows.length} shown</h2>
        <div className="row">
          <label className="btn small">Import file<input type="file" accept=".csv,.txt,text/csv" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) p.onImportFile(f); e.target.value = ''; }} /></label>
          <button className="btn small ghost" type="button" onClick={p.onVinted}>Paste from Vinted</button>
          <button className="btn small ghost" type="button" onClick={p.onAdd}>Add sale</button>
          <button className="btn small ghost" type="button" onClick={p.onExportCSV}>Download CSV</button>
        </div>
      </div>
      <div className="toolbar">
        <div className="filters">
          <select aria-label="Filter by platform" value={platform} onChange={(e) => setPlatform(e.target.value)}><option value="">All platforms</option>{platforms.map((x) => <option key={x}>{x}</option>)}</select>
          <select aria-label="Filter by type" value={kind} onChange={(e) => setKind(e.target.value)}><option value="">All types</option><option value="unsorted">Not sorted</option><option value="resale">Bought to resell</option><option value="personal">Personal</option></select>
        </div>
        <div className="row">
          <span className="notice">Mark all shown as</span>
          <button className="btn small ghost" type="button" onClick={() => p.update(ids(), { kind: 'resale' })}>Resale</button>
          <button className="btn small ghost" type="button" onClick={() => p.update(ids(), { kind: 'personal' })}>Personal</button>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Platform</th><th>Item</th><th>Sold for £</th><th>Fees £</th><th>You paid £</th><th>Type</th><th></th></tr></thead>
          <tbody>
            {rows.length ? rows.map((s) => (
              <tr key={s.id}>
                <td>{ukDate(s.date)}</td>
                <td>{s.platform}</td>
                <td className="item">{s.item || <span className="notice">No description</span>}</td>
                <td className="num">{gbp(s.amount)}</td>
                <td className="num">{s.fees ? gbp(s.fees) : '–'}</td>
                <td className="num">
                  <input key={`${s.id}|${s.cost}`} type="number" min="0" step="0.01" aria-label={`What you paid for ${s.item}`} defaultValue={s.cost ?? ''}
                    onBlur={(e) => { const v = e.target.value; p.update(new Set([s.id]), { cost: v === '' ? null : Math.round(parseFloat(v) * 100) / 100 }); }} />
                </td>
                <td>
                  <span className="seg">
                    <button type="button" className="resale" aria-pressed={s.kind === 'resale'} onClick={() => toggle(s, 'resale')}>Resale</button>
                    <button type="button" className="personal" aria-pressed={s.kind === 'personal'} onClick={() => toggle(s, 'personal')}>Personal</button>
                  </span>
                </td>
                <td><button type="button" className="del" aria-label="Delete this sale" onClick={() => p.remove(s.id)}>×</button></td>
              </tr>
            )) : <tr><td colSpan={8} className="notice">No sales match these filters.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="row">
        <button className="btn small ghost" type="button" onClick={p.onBackup}>Back up data</button>
        <label className="btn small ghost">Restore backup<input type="file" accept=".json,application/json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) p.onRestore(f); e.target.value = ''; }} /></label>
        <button className="btn small ghost" type="button" onClick={() => {
          if (confirmClear) { p.onClear(); setConfirmClear(false); } else { setConfirmClear(true); setTimeout(() => setConfirmClear(false), 4000); }
        }}>{confirmClear ? 'Click again to delete everything' : 'Delete all data'}</button>
      </div>
    </section>
  );
}

export function EmptyState({ onImportFile, onVinted, onAdd, onExample }: { onImportFile: (f: File) => void; onVinted: () => void; onAdd: () => void; onExample: () => void }) {
  const [over, setOver] = useState(false);
  return (
    <section className="empty">
      <div>
        <span className="label">Step 1</span>
        <h1>Bring in your sales</h1>
        <p className="notice">Download your sales file from each platform, then drop it here. Nothing is uploaded; the file is read on this device.</p>
      </div>
      <div className={`drop${over ? ' over' : ''}`}
        onDragEnter={(e) => { e.preventDefault(); setOver(true); }} onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)} onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) onImportFile(f); }}>
        <strong>Drop a sales file here (.csv)</strong>
        <div className="row">
          <label className="btn">Choose file<input type="file" accept=".csv,.txt,text/csv" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) onImportFile(f); e.target.value = ''; }} /></label>
          <button className="btn ghost" type="button" onClick={onVinted}>Paste from Vinted</button>
          <button className="btn ghost" type="button" onClick={onAdd}>Add a sale by hand</button>
          <button className="btn ghost" type="button" onClick={onExample}>Try example data</button>
        </div>
      </div>
      <dl className="how">
        <div><dt>Etsy</dt><dd>Shop Manager › Settings › Options › Download Data › Orders</dd></div>
        <div><dt>eBay</dt><dd>Seller Hub › Orders › Download report</dd></div>
        <div><dt>Depop</dt><dd>Selling Hub on the website › Stats › Download sales (3 months per file)</dd></div>
        <div><dt>Vinted</dt><dd>Balance › Payment history › pick a month, select all and copy, then "Paste from Vinted"</dd></div>
      </dl>
    </section>
  );
}
