import { useMemo, useState } from 'react';
import * as C from '../core';
import type { ColumnMap, CsvRecord, DateOrder, Kind, Sale } from '../core';
import { gbp, PAY_URL, ukDate } from '../state';
import Modal from './Modal';

const PLATFORMS = ['Etsy', 'eBay', 'Depop', 'Vinted', 'Other'];

// ---------- File import with column check ----------
export interface PendingFile { name: string; headers: string[]; records: CsvRecord[] }

export function ImportDialog({ file, room, onClose, onImport }: {
  file: PendingFile | null;
  room: number;
  onClose: () => void;
  onImport: (sales: Sale[]) => void;
}) {
  const initial = useMemo(() => (file ? C.guessMapping(file.headers, file.name) : null), [file]);
  const [map, setMap] = useState<ColumnMap | null>(null);
  const [order, setOrder] = useState<DateOrder | null>(null);
  const m = map ?? initial;
  const o = order ?? (file && initial ? C.guessDateOrder(file.records.map((r) => r[initial.date]), initial.platform) : 'DMY');
  const parsed = useMemo(() => (file && m ? C.recordsToSales(file.records, { ...m, platform: m.platform || 'Other' }, o) : null), [file, m, o]);
  if (!file || !m || !parsed) return null;

  const set = (k: keyof ColumnMap, v: string) => setMap({ ...m, [k]: v });
  const close = () => { setMap(null); setOrder(null); onClose(); };
  const cols = (optional: boolean) => (
    <>
      {optional && <option value="">None</option>}
      {file.headers.map((h) => <option key={h} value={h}>{h}</option>)}
    </>
  );
  return (
    <Modal open title="Check how we read this file" onClose={close} submitLabel="Import" onSubmit={() => { onImport(parsed.sales); setMap(null); setOrder(null); }}>
      <p className="notice">{file.name} · {file.records.length} rows</p>
      <div className="grid2">
        <label>Platform<select value={m.platform || 'Other'} onChange={(e) => set('platform', e.target.value)}>{PLATFORMS.map((p) => <option key={p}>{p}</option>)}</select></label>
        <label>Date format<select value={o} onChange={(e) => setOrder(e.target.value as DateOrder)}><option value="DMY">Day/Month/Year</option><option value="MDY">Month/Day/Year</option></select></label>
        <label>Sale date column<select value={m.date} onChange={(e) => set('date', e.target.value)}>{cols(false)}</select></label>
        <label>Sale amount column<select value={m.amount} onChange={(e) => set('amount', e.target.value)}>{cols(false)}</select></label>
        <label>Item column<select value={m.item} onChange={(e) => set('item', e.target.value)}>{cols(true)}</select></label>
        <label>Fees column (optional)<select value={m.fees} onChange={(e) => set('fees', e.target.value)}>{cols(true)}</select></label>
        <label>Order number column (optional)<select value={m.orderId} onChange={(e) => set('orderId', e.target.value)}>{cols(true)}</select></label>
      </div>
      <div>
        <span className="label">Preview</span>
        <div className="preview">
          {parsed.sales.slice(0, 4).map((s) => `${ukDate(s.date)}  ${gbp(s.amount).padStart(10)}  ${s.item.slice(0, 40)}`).join('\n') || 'No rows could be read with these columns.'}
          {parsed.skipped.length > 0 && `\n${parsed.skipped.length} row(s) without a readable date or amount will be skipped.`}
        </div>
      </div>
      {room < parsed.sales.length && <p className="notice">The free version holds {C.FREE_SALES_LIMIT} sales. {room} more will be imported; unlock to import all {parsed.sales.length}.</p>}
    </Modal>
  );
}

// ---------- Vinted paste ----------
export function VintedDialog({ open, onClose, onImport }: { open: boolean; onClose: () => void; onImport: (sales: Sale[]) => void }) {
  const [text, setText] = useState('');
  const { sales, skipped } = useMemo(() => C.parseVintedHistory(text), [text]);
  const total = sales.reduce((a, s) => a + s.amount, 0);
  const close = () => { setText(''); onClose(); };
  return (
    <Modal open={open} title="Paste from Vinted" onClose={close} submitLabel="Import sales" submitDisabled={!sales.length}
      onSubmit={() => { onImport(sales); setText(''); }}>
      <ol className="steps-list notice">
        <li>On Vinted (on a computer), open <strong>Balance › Payment history</strong>.</li>
        <li>Pick a month, press <strong>Cmd+A</strong> (Windows: Ctrl+A) and copy. Copying the whole page is fine.</li>
        <li>Paste below. You can paste several months one after another; repeats are skipped.</li>
      </ol>
      <label className="stack">Copied text
        <textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder={'Sold\nItem title\n£12.00\n10 August 2024'} />
      </label>
      <p className="notice" role="status">
        {sales.length
          ? `Found ${sales.length} sale${sales.length === 1 ? '' : 's'} (${gbp(total)}), ${ukDate(sales[sales.length - 1].date)} to ${ukDate(sales[0].date)}.${skipped ? ` ${skipped} couldn't be read.` : ''}`
          : text ? 'No sales found yet. Copy a Payment history month that has "Sold" entries.' : 'Only entries starting with "Sold" are imported. Withdrawals and purchases are ignored.'}
      </p>
    </Modal>
  );
}

// ---------- Add a sale ----------
export function AddSaleDialog({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (sale: Sale) => void }) {
  const today = C.localISO(new Date());
  const blank = { platform: 'Vinted', date: today, item: '', amount: '', fees: '', cost: '', kind: 'unsorted' as Kind };
  const [f, setF] = useState(blank);
  const set = (k: keyof typeof blank, v: string) => setF({ ...f, [k]: v });
  const amount = parseFloat(f.amount);
  const close = () => { setF(blank); onClose(); };
  return (
    <Modal open={open} title="Add a sale" onClose={close} submitLabel="Add sale" submitDisabled={!f.date || isNaN(amount)}
      onSubmit={() => {
        onAdd({
          id: `manual|${Date.now()}|${Math.random().toString(36).slice(2, 7)}`, platform: f.platform, date: f.date, item: f.item.trim(),
          amount: Math.round(amount * 100) / 100, fees: parseFloat(f.fees) || 0, cost: f.cost === '' ? null : Math.round(parseFloat(f.cost) * 100) / 100, kind: f.kind, source: 'manual',
        });
        setF(blank);
      }}>
      <div className="grid2">
        <label>Platform<select value={f.platform} onChange={(e) => set('platform', e.target.value)}>{['Vinted', 'eBay', 'Etsy', 'Depop', 'Other'].map((p) => <option key={p}>{p}</option>)}</select></label>
        <label>Date sold<input type="date" required value={f.date} onChange={(e) => set('date', e.target.value)} /></label>
        <label>Item<input type="text" maxLength={140} placeholder="e.g. Levi's 501 jeans" value={f.item} onChange={(e) => set('item', e.target.value)} /></label>
        <label>Sold for £<input type="number" min="0" step="0.01" required value={f.amount} onChange={(e) => set('amount', e.target.value)} /></label>
        <label>Fees £ (optional)<input type="number" min="0" step="0.01" value={f.fees} onChange={(e) => set('fees', e.target.value)} /></label>
        <label>You paid £ (optional)<input type="number" min="0" step="0.01" value={f.cost} onChange={(e) => set('cost', e.target.value)} /></label>
        <label>Type<select value={f.kind} onChange={(e) => set('kind', e.target.value)}><option value="unsorted">Decide later</option><option value="resale">Bought to resell</option><option value="personal">Personal clear-out</option></select></label>
      </div>
    </Modal>
  );
}

// ---------- Unlock ----------
export function UnlockDialog({ open, reason, onClose, onUnlock }: { open: boolean; reason: string; onClose: () => void; onUnlock: (code: string) => void }) {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const close = () => { setCode(''); setMsg(''); onClose(); };
  return (
    <Modal open={open} title="Unlock Resale Records" onClose={close} cancelLabel="Close" submitLabel="Unlock"
      onSubmit={() => {
        const c = code.trim().toUpperCase();
        if (!C.isValidCode(c)) { setMsg('That code isn’t valid. Check it matches the email, including the dashes.'); return false; }
        onUnlock(c); setCode(''); setMsg('');
      }}>
      {reason && <p className="callout info">{reason}</p>}
      <p>The free version holds {C.FREE_SALES_LIMIT} sales. Unlock for unlimited sales and your tax year record to save, print or give to an accountant, for the 2025/26 and 2026/27 tax years.</p>
      <div className="row"><a className="btn" href={PAY_URL} target="_blank" rel="noopener">Pay £19 with PayPal</a><span className="notice">One payment. Refund within 14 days if it's not for you.</span></div>
      <p className="notice">After paying, we email your unlock code to your PayPal email address within one working day.</p>
      <label className="stack">Already have a code?<input type="text" placeholder="RR-XXXX-XXXX-XX" autoComplete="off" value={code} onChange={(e) => setCode(e.target.value)} /></label>
      <p className="notice" role="status">{msg}</p>
    </Modal>
  );
}
