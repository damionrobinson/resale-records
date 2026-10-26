import { useCallback, useEffect, useRef, useState } from 'react';
import * as C from './core';
import type { Sale } from './core';
import { AddSaleDialog, ImportDialog, UnlockDialog, VintedDialog, type PendingFile } from './components/Dialogs';
import TaxYearRecord from './components/TaxYearRecord';
import { EmptyState, SalesTable, Summary } from './components/Workspace';
import { CONTACT, download, loadState, saveState, type AppState } from './state';

type View = 'sales' | 'record';

export default function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [view, setView] = useState<View>(() => (location.hash === '#record' ? 'record' : 'sales'));
  const [pending, setPending] = useState<PendingFile | null>(null);
  const [dialog, setDialog] = useState<'' | 'vinted' | 'add' | 'unlock'>('');
  const [unlockReason, setUnlockReason] = useState('');
  const [toast, setToast] = useState('');
  const toastTimer = useRef<number>(undefined);

  const unlocked = C.isValidCode(state.code);
  const room = unlocked ? Infinity : Math.max(0, C.FREE_SALES_LIMIT - state.sales.length);
  const years = C.taxYearsIn(state.sales);
  const taxYear = years.includes(state.taxYear) ? state.taxYear : years[0] ?? '';
  const cals = [...new Set(state.sales.map((s) => C.calendarYearOf(s.date)))].sort().reverse();
  const calYear = cals.includes(state.calYear) ? state.calYear : cals[0] ?? new Date().getFullYear();

  const say = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 4500);
  }, []);

  useEffect(() => {
    if (!saveState(state)) say('Couldn’t save on this device. Back up your data to keep it.');
  }, [state, say]);
  useEffect(() => {
    const target = view === 'record' ? '#record' : '';
    if (location.hash !== target) history.pushState(null, '', location.pathname + target);
    window.scrollTo(0, 0);
  }, [view]);
  useEffect(() => {
    const sync = () => setView(location.hash === '#record' ? 'record' : 'sales');
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);
  useEffect(() => {
    document.body.classList.toggle('is-locked', !unlocked);
  }, [unlocked]);

  const patch = (p: Partial<AppState>) => setState((s) => ({ ...s, ...p }));
  const openUnlock = (reason = '') => { setUnlockReason(reason); setDialog('unlock'); };

  /** Adds sales, respecting the free limit, and reports what happened. */
  const addSales = (incoming: Sale[], label = 'sale') => {
    setState((s) => {
      const before = s.sales.length;
      const merged = C.mergeSales(s.sales, incoming);
      const kept = C.isValidCode(s.code) ? merged.sales : merged.sales.slice(0, Math.max(before, C.FREE_SALES_LIMIT));
      const added = kept.length - before;
      say(`Added ${added} ${label}${added === 1 ? '' : 's'}${merged.duplicates ? `, skipped ${merged.duplicates} already here` : ''}.` + (merged.added > added ? ` Unlock to import the other ${merged.added - added}.` : ''));
      return { ...s, sales: kept, taxYear: added > 0 ? C.taxYearsIn(kept)[0] : s.taxYear };
    });
  };
  const update = (ids: Set<string>, p: Partial<Sale> | ((s: Sale) => Partial<Sale>)) =>
    setState((s) => ({ ...s, sales: s.sales.map((x) => (ids.has(x.id) ? { ...x, ...(typeof p === 'function' ? p(x) : p) } : x)) }));

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const { headers, records } = C.parseCSV(String(reader.result));
      if (!headers.length || !records.length) { say('That file has no rows we can read. Check it’s the sales download (.csv).'); return; }
      setPending({ name: file.name, headers, records });
    };
    reader.onerror = () => say('Couldn’t read that file. Try downloading it again.');
    reader.readAsText(file);
  };
  const restore = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (data.app !== 'resale-records' || !Array.isArray(data.sales)) throw new Error('not a backup');
        const sales: Sale[] = unlocked ? data.sales : data.sales.slice(0, C.FREE_SALES_LIMIT);
        patch({ sales });
        say(`Restored ${sales.length} sales.` + (sales.length < data.sales.length ? ' Unlock to restore the rest.' : ''));
      } catch {
        say('That isn’t a Resale Records backup file.');
      }
    };
    reader.readAsText(file);
  };
  const example = () => {
    const items = ['Levi’s 501 jeans', 'Nike Air Max 90', 'Barbour wax jacket', 'Zara midi dress', 'Vintage band tee', 'Dr Martens 1460', 'North Face fleece', 'Ralph Lauren shirt'];
    const plats = ['Vinted', 'Vinted', 'Vinted', 'eBay', 'Depop'];
    const sales: Sale[] = Array.from({ length: 20 }, (_, i) => {
      const platform = plats[i % plats.length];
      const amount = 8 + ((i * 37) % 60);
      return {
        id: `example|${i}`, platform, date: C.localISO(new Date(2025, 4 + Math.floor(i / 2), 3 + ((i * 7) % 25))), item: `${items[i % items.length]} (example)`,
        amount, fees: platform === 'Vinted' ? 0 : Math.round(amount * 0.13 * 100) / 100, cost: i % 3 === 0 ? Math.round(amount * 0.4) : null,
        kind: i % 4 === 0 ? 'personal' : i % 5 === 0 ? 'unsorted' : 'resale', source: 'example',
      };
    });
    patch({ sales, taxYear: '2025/26' });
    say('Example data loaded. Delete it any time with "Delete all data".');
  };
  const exportCSV = () => {
    if (!unlocked) return openUnlock('Downloading your record is part of the unlocked version.');
    download(`resale-records-${taxYear.replace('/', '-')}.csv`, C.exportCSV(state.sales, taxYear), 'text/csv');
  };
  const print = () => {
    if (!unlocked) return openUnlock('Printing or saving your tax year record is part of the unlocked version.');
    window.print();
  };
  const addOne = () => (room <= 0 ? openUnlock(`The free version holds ${C.FREE_SALES_LIMIT} sales.`) : setDialog('add'));

  const has = state.sales.length > 0;
  return (
    <>
      <header className="top no-print">
        <div className="wrap">
          <a className="brand" href="../">Resale<span>Records</span></a>
          <div className="status">
            <span>Your data stays on this device</span>
            <span className={`chip${unlocked ? ' ok' : state.sales.length >= C.FREE_SALES_LIMIT ? ' flag' : ''}`}>{unlocked ? 'Unlocked' : `Free · ${state.sales.length}/${C.FREE_SALES_LIMIT} sales`}</span>
            {!unlocked && <button className="btn small" type="button" onClick={() => openUnlock()}>Unlock all</button>}
          </div>
        </div>
      </header>

      <main className="wrap">
        {!has && <EmptyState onImportFile={readFile} onVinted={() => setDialog('vinted')} onAdd={addOne} onExample={example} />}
        {has && view === 'sales' && (
          <div className="work">
            {[Summary, SalesTable].map((Panel, i) => (
              <Panel key={i} sales={state.sales} taxYear={taxYear} calYear={calYear}
                setTaxYear={(y) => patch({ taxYear: y })} setCalYear={(y) => patch({ calYear: y })}
                update={update} remove={(id) => patch({ sales: state.sales.filter((x) => x.id !== id) })}
                onOpenRecord={() => setView('record')} onImportFile={readFile} onVinted={() => setDialog('vinted')} onAdd={addOne}
                onExportCSV={exportCSV} onBackup={() => download('resale-records-backup.json', JSON.stringify({ app: 'resale-records', version: 1, sales: state.sales }, null, 1), 'application/json')}
                onRestore={restore} onClear={() => { patch({ sales: [] }); say('All data deleted from this device.'); }} />
            ))}
          </div>
        )}
        {has && view === 'record' && (
          <TaxYearRecord sales={state.sales} taxYear={taxYear} setTaxYear={(y) => patch({ taxYear: y })} unlocked={unlocked}
            onBack={() => setView('sales')} onPrint={print} onExportCSV={exportCSV} />
        )}
      </main>

      <footer className="app-foot no-print">
        <div className="wrap">
          <span>Resale Records is a trading name of Design Definition Limited, company number 15183622. Record-keeping tool, not tax advice. Not affiliated with HMRC, Vinted, eBay, Etsy or Depop.</span>
          <span><a href="../privacy.html">Privacy notice</a> · <a href={`mailto:${CONTACT}`}>{CONTACT}</a></span>
        </div>
      </footer>

      <ImportDialog key={pending ? pending.name + pending.records.length : 'none'} file={pending} room={room} onClose={() => setPending(null)} onImport={(s) => addSales(s)} />
      <VintedDialog open={dialog === 'vinted'} onClose={() => setDialog('')} onImport={(s) => addSales(s, 'Vinted sale')} />
      <AddSaleDialog open={dialog === 'add'} onClose={() => setDialog('')} onAdd={(s) => { addSales([s]); }} />
      <UnlockDialog open={dialog === 'unlock'} reason={unlockReason} onClose={() => setDialog('')} onUnlock={(code) => { patch({ code }); say('Unlocked. Thank you.'); }} />
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}
