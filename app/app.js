/* Resale Records UI. All data lives in this browser's localStorage. */
(function () {
  'use strict';
  const C = window.RRCore;
  const PAY_URL = 'https://www.paypal.com/ncp/payment/7S3U3RHLNE8WW';
  const KEY = 'rr.v1';
  const $ = (id) => document.getElementById(id);
  const gbp = (n) => { const v = Number(n) || 0; return (v < 0 ? '-£' : '£') + Math.abs(v).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- State ----------
  let state = { sales: [], code: '', taxYear: '', calYear: new Date().getFullYear() };
  function load() {
    try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && Array.isArray(s.sales)) state = Object.assign(state, s); } catch (e) { /* storage unavailable */ }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { toast('Couldn’t save on this device. Back up your data to keep it.'); }
  }
  const unlocked = () => C.isValidCode(state.code);
  const room = () => (unlocked() ? Infinity : Math.max(0, C.FREE_SALES_LIMIT - state.sales.length));

  let toastTimer;
  function toast(msg) {
    let el = document.querySelector('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg; el.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, 4500);
  }

  // ---------- Rendering ----------
  function render() {
    const has = state.sales.length > 0;
    $('empty').hidden = has; $('work').hidden = !has;
    $('plan-chip').textContent = unlocked() ? 'Unlocked' : `Free · ${state.sales.length}/${C.FREE_SALES_LIMIT} sales`;
    $('plan-chip').className = 'chip' + (unlocked() ? ' ok' : state.sales.length >= C.FREE_SALES_LIMIT ? ' flag' : '');
    $('unlock-btn').hidden = unlocked();
    if (!has) return;

    const years = C.taxYearsIn(state.sales);
    if (!years.includes(state.taxYear)) state.taxYear = years[0];
    $('tax-year').innerHTML = years.map((y) => `<option ${y === state.taxYear ? 'selected' : ''}>${y}</option>`).join('');
    const cals = [...new Set(state.sales.map((s) => C.calendarYearOf(s.date)))].sort().reverse();
    if (!cals.includes(Number(state.calYear))) state.calYear = cals[0];
    $('cal-year').innerHTML = cals.map((y) => `<option ${y === Number(state.calYear) ? 'selected' : ''}>${y}</option>`).join('');

    const s = C.taxYearSummary(state.sales, state.taxYear);
    const [a, b] = state.taxYear.split('/');
    $('kv').innerHTML = `
      <span class="label">Tax year ${esc(state.taxYear)} · 6 Apr ${a} – 5 Apr ${Number(a) + 1}</span>
      <div><span>Bought to resell</span><span class="big">${gbp(s.resale)}</span></div>
      <div><span>What you paid</span><span>${gbp(s.resaleCost)}</span></div>
      <div><span>Platform fees</span><span>${gbp(s.resaleFees)}</span></div>
      <div class="sep"><strong>Resale profit</strong><strong>${gbp(s.resaleProfit)}</strong></div>
      <div class="sep"><span>Personal clear-out</span><span>${gbp(s.personal)}</span></div>
      <div><span>Not sorted yet</span><span>${gbp(s.unsorted)}</span></div>
      <div><span>Sales this tax year</span><span>${s.count}</span></div>`;
    const notes = [];
    if (s.unsorted > 0) notes.push(`<div class="callout info">Mark each sale as bought to resell or personal. Unsorted sales aren't counted in either total.</div>`);
    if (s.missingCost > 0) notes.push(`<div class="callout info">${s.missingCost} resale ${s.missingCost === 1 ? 'sale is' : 'sales are'} missing what you paid, so profit is overstated.</div>`);
    if (s.overTradingAllowance) notes.push(`<div class="callout">Your bought-to-resell takings are over £${C.TRADING_ALLOWANCE.toLocaleString('en-GB')}, the trading allowance limit for gross trading income. <a href="https://www.gov.uk/guidance/tax-free-allowances-on-property-and-trading-income" target="_blank" rel="noopener">GOV.UK explains what that means</a>.</div>`);
    $('allowance').innerHTML = notes.join('');

    const rep = C.reportingCheck(state.sales, Number(state.calYear));
    $('rep').innerHTML = rep.map((r) => `<div><strong>${esc(r.platform)}</strong><span>${r.count} sale${r.count === 1 ? '' : 's'} · ${gbp(r.total)}</span>
      <span class="chip ${r.reported ? 'flag' : r.near ? '' : 'ok'}">${r.reported ? 'Will report' : r.near ? 'Close' : 'Not yet'}</span></div>`).join('') || '<p class="notice">No sales in this year.</p>';

    const platforms = [...new Set(state.sales.map((x) => x.platform))].sort();
    const fp = $('f-platform').value;
    $('f-platform').innerHTML = '<option value="">All platforms</option>' + platforms.map((p) => `<option ${p === fp ? 'selected' : ''}>${esc(p)}</option>`).join('');
    renderRows();
  }

  function shown() {
    const p = $('f-platform').value, k = $('f-kind').value;
    return state.sales.filter((x) => C.taxYearOf(x.date) === state.taxYear && (!p || x.platform === p) && (!k || x.kind === k))
      .sort((a, b) => b.date.localeCompare(a.date));
  }
  function renderRows() {
    const rows = shown();
    $('sales-title').textContent = `Sales · ${rows.length} shown`;
    $('rows').innerHTML = rows.map((x) => `<tr data-id="${esc(x.id)}">
      <td>${x.date.split('-').reverse().join('/')}</td><td>${esc(x.platform)}</td><td class="item">${esc(x.item) || '<span class="notice">No description</span>'}</td>
      <td class="num">${gbp(x.amount)}</td><td class="num">${x.fees ? gbp(x.fees) : '–'}</td>
      <td class="num"><input type="number" min="0" step="0.01" value="${x.cost == null ? '' : x.cost}" aria-label="What you paid for ${esc(x.item)}" data-field="cost"></td>
      <td><span class="seg"><button type="button" class="resale" data-kind="resale" aria-pressed="${x.kind === 'resale'}">Resale</button><button type="button" class="personal" data-kind="personal" aria-pressed="${x.kind === 'personal'}">Personal</button></span></td>
      <td class="no-print"><button type="button" class="del" data-del aria-label="Delete this sale">×</button></td></tr>`).join('')
      || '<tr><td colspan="8" class="notice">No sales match these filters.</td></tr>';
  }

  // ---------- Import ----------
  let pending = null;
  function readFile(file) {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => openMapping(file.name, String(r.result));
    r.onerror = () => toast('Couldn’t read that file. Try downloading it again.');
    r.readAsText(file);
  }
  function openMapping(name, text) {
    const parsed = C.parseCSV(text);
    if (!parsed.headers.length || !parsed.records.length) { toast('That file has no rows we can read. Check it’s the sales download (.csv).'); return; }
    const map = C.guessMapping(parsed.headers, name);
    pending = { name, parsed };
    const opts = (sel, optional) => (optional ? '<option value="">None</option>' : '') + parsed.headers.map((h) => `<option ${h === sel ? 'selected' : ''}>${esc(h)}</option>`).join('');
    $('m-platform').value = map.platform || 'Other';
    $('m-date').innerHTML = opts(map.date); $('m-amount').innerHTML = opts(map.amount);
    $('m-item').innerHTML = opts(map.item, true); $('m-fees').innerHTML = opts(map.fees, true); $('m-orderId').innerHTML = opts(map.orderId, true);
    $('m-order').value = C.guessDateOrder(parsed.records.map((rec) => rec[map.date]), map.platform);
    $('map-file').textContent = `${name} · ${parsed.records.length} rows`;
    updatePreview();
    $('map-dlg').showModal();
  }
  function currentMap() {
    return { platform: $('m-platform').value, date: $('m-date').value, amount: $('m-amount').value, item: $('m-item').value, fees: $('m-fees').value, orderId: $('m-orderId').value };
  }
  function updatePreview() {
    if (!pending) return;
    const { sales, skipped } = C.recordsToSales(pending.parsed.records, currentMap(), $('m-order').value, 'import');
    $('map-preview').textContent = sales.slice(0, 4).map((x) => `${x.date}  ${gbp(x.amount).padStart(10)}  ${x.item.slice(0, 40)}`).join('\n')
      + (skipped.length ? `\n${skipped.length} row(s) without a readable date or amount will be skipped.` : '');
    const left = room();
    $('map-limit').textContent = left < sales.length ? `The free version holds ${C.FREE_SALES_LIMIT} sales. ${left} more will be imported; unlock to import all ${sales.length}.` : '';
  }
  ['m-platform', 'm-order', 'm-date', 'm-amount', 'm-item', 'm-fees', 'm-orderId'].forEach((id) => $(id).addEventListener('change', updatePreview));
  // Act on the form submit rather than the dialog's close event, which some browsers don't fire reliably.
  $('map-form').addEventListener('submit', (e) => {
    if (!e.submitter || e.submitter.value !== 'ok' || !pending) { pending = null; return; }
    const { sales } = C.recordsToSales(pending.parsed.records, currentMap(), $('m-order').value, 'import');
    const before = state.sales.length;
    const merged = C.mergeSales(state.sales, sales);
    // Free version: keep at most FREE_SALES_LIMIT sales in total.
    const result = unlocked() ? merged.sales : merged.sales.slice(0, Math.max(before, C.FREE_SALES_LIMIT));
    const added = result.length - before;
    state.sales = result; pending = null;
    if (added > 0) state.taxYear = C.taxYearOf(state.sales[state.sales.length - 1].date);
    save(); render();
    toast(`Added ${added} sale${added === 1 ? '' : 's'}${merged.duplicates ? `, skipped ${merged.duplicates} already here` : ''}.` + (merged.added > added ? ` Unlock to import the other ${merged.added - added}.` : ''));
  });

  // ---------- Manual add ----------
  function openAdd() {
    if (room() <= 0) { openUnlock('The free version holds 20 sales.'); return; }
    $('add-form').reset(); $('a-date').value = new Date().toISOString().slice(0, 10);
    $('add-dlg').showModal();
  }
  $('add-form').addEventListener('submit', (e) => {
    if (!e.submitter || e.submitter.value !== 'ok') return;
    const amount = parseFloat($('a-amount').value), date = $('a-date').value;
    if (!date || isNaN(amount)) return;
    const cost = $('a-cost').value === '' ? null : parseFloat($('a-cost').value);
    const sale = { id: `manual|${Date.now()}|${Math.random().toString(36).slice(2, 7)}`, platform: $('a-platform').value, date, item: $('a-item').value.trim(),
      amount: Math.round(amount * 100) / 100, fees: parseFloat($('a-fees').value) || 0, cost, kind: $('a-kind').value, source: 'manual' };
    state.sales.push(sale); state.taxYear = C.taxYearOf(date); save(); render(); toast('Sale added.');
  });

  // ---------- Example data ----------
  function example() {
    const items = ['Levi’s 501 jeans', 'Nike Air Max 90', 'Barbour wax jacket', 'Zara midi dress', 'Vintage band tee', 'Dr Martens 1460', 'North Face fleece', 'Ralph Lauren shirt'];
    const plats = ['Vinted', 'Vinted', 'Vinted', 'eBay', 'Depop'];
    const out = [];
    for (let i = 0; i < 20; i++) {
      const d = new Date(2025, 4 + Math.floor(i / 2), 3 + (i * 7) % 25);
      const amount = 8 + ((i * 37) % 60);
      out.push({ id: `example|${i}`, platform: plats[i % plats.length], date: d.toISOString().slice(0, 10), item: items[i % items.length] + ' (example)',
        amount, fees: plats[i % plats.length] === 'Vinted' ? 0 : Math.round(amount * 0.13 * 100) / 100,
        cost: i % 3 === 0 ? Math.round(amount * 0.4) : null, kind: i % 4 === 0 ? 'personal' : i % 5 === 0 ? 'unsorted' : 'resale', source: 'example' });
    }
    state.sales = out; save(); render(); toast('Example data loaded. Delete it any time with "Delete all data".');
  }

  // ---------- Unlock, export, backup ----------
  function openUnlock(reason) {
    $('pay-link').href = PAY_URL;
    $('code-msg').textContent = reason || '';
    $('code-input').value = '';
    $('unlock-dlg').showModal();
  }
  $('unlock-form').addEventListener('submit', (e) => {
    if (e.submitter && e.submitter.value === 'ok') {
      const code = $('code-input').value.trim().toUpperCase();
      if (!C.isValidCode(code)) { e.preventDefault(); $('code-msg').textContent = 'That code isn’t valid. Check it matches the email, including the dashes.'; return; }
      state.code = code; save(); render(); toast('Unlocked. Thank you.');
    }
  });
  function download(name, text, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function exportSummary() {
    if (!unlocked()) { openUnlock('Downloading the summary is part of the unlocked version.'); return; }
    download(`resale-records-${state.taxYear.replace('/', '-')}.csv`, C.exportCSV(state.sales, state.taxYear), 'text/csv');
  }
  function printSummary() {
    if (!unlocked()) { openUnlock('Printing the summary is part of the unlocked version.'); return; }
    window.print();
  }

  // ---------- Events ----------
  document.addEventListener('click', (e) => {
    const act = e.target.closest('[data-action]');
    if (act) {
      const a = act.dataset.action;
      if (a === 'add') openAdd();
      else if (a === 'example') example();
      else if (a === 'export') exportSummary();
      else if (a === 'print') printSummary();
      else if (a === 'backup') download('resale-records-backup.json', JSON.stringify({ app: 'resale-records', version: 1, sales: state.sales }, null, 1), 'application/json');
      else if (a === 'clear') {
        if (act.dataset.confirm === '1') { state.sales = []; save(); render(); toast('All data deleted from this device.'); }
        else { act.dataset.confirm = '1'; act.textContent = 'Click again to delete everything'; setTimeout(() => { act.dataset.confirm = ''; act.textContent = 'Delete all data'; }, 4000); }
      } else if (a === 'bulk-resale' || a === 'bulk-personal') {
        const ids = new Set(shown().map((x) => x.id)); const kind = a === 'bulk-resale' ? 'resale' : 'personal';
        state.sales.forEach((x) => { if (ids.has(x.id)) x.kind = kind; }); save(); render();
      }
      return;
    }
    const kindBtn = e.target.closest('[data-kind]');
    if (kindBtn) {
      const id = kindBtn.closest('tr').dataset.id; const sale = state.sales.find((x) => x.id === id);
      sale.kind = sale.kind === kindBtn.dataset.kind ? 'unsorted' : kindBtn.dataset.kind; save(); render(); return;
    }
    if (e.target.closest('[data-del]')) {
      const id = e.target.closest('tr').dataset.id; state.sales = state.sales.filter((x) => x.id !== id); save(); render();
    }
  });
  $('rows').addEventListener('change', (e) => {
    if (e.target.dataset.field !== 'cost') return;
    const sale = state.sales.find((x) => x.id === e.target.closest('tr').dataset.id);
    sale.cost = e.target.value === '' ? null : Math.round(parseFloat(e.target.value) * 100) / 100;
    save(); render();
  });
  $('tax-year').addEventListener('change', (e) => { state.taxYear = e.target.value; save(); render(); });
  $('cal-year').addEventListener('change', (e) => { state.calYear = Number(e.target.value); save(); render(); });
  $('f-platform').addEventListener('change', renderRows);
  $('f-kind').addEventListener('change', renderRows);
  $('unlock-btn').addEventListener('click', () => openUnlock(''));
  ['file-input', 'file-input-2'].forEach((id) => $(id).addEventListener('change', (e) => { readFile(e.target.files[0]); e.target.value = ''; }));
  $('restore-input').addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(String(r.result));
        if (data.app !== 'resale-records' || !Array.isArray(data.sales)) throw new Error('bad');
        const sales = unlocked() ? data.sales : data.sales.slice(0, C.FREE_SALES_LIMIT);
        state.sales = sales; save(); render();
        toast(`Restored ${sales.length} sales.` + (sales.length < data.sales.length ? ' Unlock to restore the rest.' : ''));
      } catch (err) { toast('That isn’t a Resale Records backup file.'); }
    };
    r.readAsText(f); e.target.value = '';
  });
  const drop = $('drop');
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (e) => readFile(e.dataTransfer.files[0]));

  load(); render();
})();
