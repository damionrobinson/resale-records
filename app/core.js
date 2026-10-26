/* Resale Records core logic. No network, no dependencies. Works in the browser (window.RRCore) and Node (require). */
(function (root) {
  'use strict';

  const REPORT_SALES = 30;          // platforms report at 30+ sales in a calendar year...
  const REPORT_GBP = 1700;          // ...or more than EUR 2,000 (about GBP 1,700 at the platform's rate)
  const TRADING_ALLOWANCE = 1000;   // GBP of gross trading income per tax year
  const FREE_SALES_LIMIT = 20;

  // ---------- CSV ----------
  function parseCSV(text) {
    text = String(text || '').replace(/^﻿/, '');
    const delim = (text.split('\n')[0].match(/\t/g) || []).length > (text.split('\n')[0].match(/,/g) || []).length ? '\t'
      : (text.split('\n')[0].match(/;/g) || []).length > (text.split('\n')[0].match(/,/g) || []).length ? ';' : ',';
    const rows = []; let row = []; let field = ''; let q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
        else field += c;
      } else if (c === '"') q = true;
      else if (c === delim) { row.push(field); field = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(field); field = '';
        if (row.some((v) => v.trim() !== '')) rows.push(row);
        row = [];
      } else field += c;
    }
    row.push(field);
    if (row.some((v) => v.trim() !== '')) rows.push(row);
    if (!rows.length) return { headers: [], records: [] };
    // Some exports put a title line above the real header; use the first row with 3+ non-empty cells.
    let h = rows.findIndex((r) => r.filter((v) => v.trim()).length >= 3);
    if (h < 0) h = 0;
    const headers = rows[h].map((v) => v.trim());
    const records = rows.slice(h + 1).map((r) => Object.fromEntries(headers.map((k, j) => [k, (r[j] || '').trim()])));
    return { headers, records };
  }

  // ---------- Column detection ----------
  const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const FIELD_HINTS = {
    date: ['sale date', 'date of sale', 'sold date', 'order date', 'date sold', 'paid on date', 'transaction date', 'date'],
    amount: ['order value', 'item total', 'sold for', 'item price', 'price', 'total price', 'sale price', 'order total', 'total', 'amount', 'gross'],
    item: ['item name', 'item title', 'item description', 'title', 'description', 'item', 'product'],
    orderId: ['order id', 'order number', 'sales record number', 'transaction id', 'order no', 'receipt id', 'id'],
    quantity: ['quantity', 'qty', 'number of items'],
    fees: ['fees', 'card processing fees', 'transaction fees', 'final value fee', 'depop fee', 'selling fees'],
  };
  // Headers that contain a hint word but hold something else (e.g. "Number of Items" is a count, not an item).
  const FIELD_EXCLUDE = { item: /number|quantity|qty|count|id\b/, amount: /fee|tax|vat|shipping|postage|discount/, date: /ship|dispatch|deliver/ };
  function guessColumn(headers, field) {
    const hs = headers.map(norm);
    const ok = (h) => !(FIELD_EXCLUDE[field] && FIELD_EXCLUDE[field].test(h));
    for (const hint of FIELD_HINTS[field]) {
      const exact = hs.indexOf(hint);
      if (exact >= 0) return headers[exact];
    }
    for (const hint of FIELD_HINTS[field]) {
      const i = hs.findIndex((h) => h.includes(hint) && ok(h));
      if (i >= 0) return headers[i];
    }
    return '';
  }
  function detectPlatform(headers, fileName) {
    const hs = headers.map(norm).join('|');
    const f = norm(fileName || '');
    if (/etsy/.test(f) || /sale date/.test(hs) && /(order value|item total|number of items)/.test(hs)) return 'Etsy';
    if (/ebay/.test(f) || /(sales record number|sold for)/.test(hs)) return 'eBay';
    if (/depop/.test(f) || /date of sale/.test(hs) && /item price/.test(hs)) return 'Depop';
    if (/vinted/.test(f)) return 'Vinted';
    return '';
  }
  function guessMapping(headers, fileName) {
    return {
      platform: detectPlatform(headers, fileName),
      date: guessColumn(headers, 'date'),
      amount: guessColumn(headers, 'amount'),
      item: guessColumn(headers, 'item'),
      orderId: guessColumn(headers, 'orderId'),
      quantity: guessColumn(headers, 'quantity'),
      fees: guessColumn(headers, 'fees'),
    };
  }

  // ---------- Values ----------
  function parseMoney(v) {
    if (v == null) return NaN;
    let s = String(v).replace(/[£$€\s]|GBP|USD|EUR/gi, '');
    const neg = /^\(.*\)$/.test(s) || /^-/.test(s);
    s = s.replace(/[()\-]/g, '');
    if (/^\d{1,3}(\.\d{3})*,\d{1,2}$/.test(s)) s = s.replace(/\./g, '').replace(',', '.'); // 1.234,56
    else s = s.replace(/,/g, '');
    const n = parseFloat(s);
    return isNaN(n) ? NaN : (neg ? -n : n);
  }

  const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12 };
  const fullYear = (y) => (y < 100 ? 2000 + y : y);
  const iso = (y, m, d) => (m >= 1 && m <= 12 && d >= 1 && d <= 31) ? `${fullYear(y)}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` : '';

  // order: 'DMY' (UK) or 'MDY' (US-style, used by some exports). Text months and ISO dates are unambiguous.
  function parseDate(v, order) {
    const s = String(v || '').trim();
    let m;
    if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) return iso(+m[1], +m[2], +m[3]);
    if ((m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/))) {
      const a = +m[1], b = +m[2], y = +m[3];
      if (a > 12) return iso(y, b, a);
      if (b > 12) return iso(y, a, b);
      return order === 'MDY' ? iso(y, a, b) : iso(y, b, a);
    }
    if ((m = s.match(/^(\d{1,2})[\s\-]([A-Za-z]{3,9})[\s\-,]+(\d{2,4})/))) return iso(+m[3], MONTHS[m[2].slice(0, 4).toLowerCase()] || MONTHS[m[2].slice(0, 3).toLowerCase()], +m[1]);
    if ((m = s.match(/^([A-Za-z]{3,9})[\s\-](\d{1,2})(?:st|nd|rd|th)?[\s\-,]+(\d{2,4})/))) return iso(+m[3], MONTHS[m[1].slice(0, 4).toLowerCase()] || MONTHS[m[1].slice(0, 3).toLowerCase()], +m[2]);
    return '';
  }
  // Guess day/month order from a column of raw dates.
  function guessDateOrder(values, platform) {
    for (const v of values) {
      const m = String(v || '').trim().match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-]\d{2,4}/);
      if (!m) continue;
      if (+m[1] > 12) return 'DMY';
      if (+m[2] > 12) return 'MDY';
    }
    return platform === 'Etsy' ? 'MDY' : 'DMY';
  }

  // ---------- Import ----------
  function recordsToSales(records, map, dateOrder, source) {
    const out = []; const skipped = [];
    records.forEach((r, i) => {
      const date = parseDate(r[map.date], dateOrder);
      const amount = parseMoney(r[map.amount]);
      if (!date || isNaN(amount)) { skipped.push(i + 2); return; }
      const fees = map.fees ? Math.abs(parseMoney(r[map.fees])) : 0;
      out.push({
        id: `${map.platform}|${map.orderId ? r[map.orderId] : ''}|${date}|${amount}|${map.item ? r[map.item] : ''}|${map.orderId ? '' : i}`,
        platform: map.platform || 'Other',
        date,
        item: (map.item ? r[map.item] : '').slice(0, 140),
        amount: Math.round(amount * 100) / 100,
        fees: isNaN(fees) ? 0 : Math.round(fees * 100) / 100,
        cost: null,
        kind: 'unsorted', // 'resale' | 'personal' | 'unsorted'
        source: source || 'import',
      });
    });
    return { sales: out, skipped };
  }
  // Vinted has no sales download. Its Balance › Payment history pages (one month each) copy as blocks:
  //   Sold / <item title> / £12.00 / 10 August 2024
  // Withdrawals, purchases and refunds use other first lines and are skipped. Works on a whole-page copy.
  const MONEY_LINE = /^-?£\s?[\d,]+(\.\d{1,2})?$/;
  const DATE_LINE = /^\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}$/;
  function parseVintedHistory(text) {
    const lines = String(text || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const sales = []; let skipped = 0;
    for (let i = 0; i < lines.length; i++) {
      if (!/^sold$/i.test(lines[i])) continue;
      const title = []; let j = i + 1;
      while (j < lines.length && !MONEY_LINE.test(lines[j]) && title.length < 3) title.push(lines[j++]);
      const money = lines[j], date = lines[j + 1];
      if (!MONEY_LINE.test(money || '') || !DATE_LINE.test(date || '')) { skipped++; continue; }
      const iso = parseDate(date, 'DMY'); const amount = parseMoney(money);
      if (!iso || isNaN(amount)) { skipped++; continue; }
      const item = title.join(' ').slice(0, 140);
      sales.push({ id: `Vinted|history|${iso}|${amount}|${item}`, platform: 'Vinted', date: iso, item, amount: Math.round(amount * 100) / 100, fees: 0, cost: null, kind: 'unsorted', source: 'vinted-paste' });
      i = j + 1;
    }
    return { sales, skipped };
  }

  function mergeSales(existing, incoming) {
    const seen = new Set(existing.map((s) => s.id));
    const added = incoming.filter((s) => !seen.has(s.id) && seen.add(s.id));
    return { sales: existing.concat(added), added: added.length, duplicates: incoming.length - added.length };
  }

  // ---------- Years and totals ----------
  // UK tax year starting 6 April. Returns e.g. '2025/26'.
  function taxYearOf(isoDate) {
    const [y, m, d] = isoDate.split('-').map(Number);
    const start = (m > 4 || (m === 4 && d >= 6)) ? y : y - 1;
    return `${start}/${String((start + 1) % 100).padStart(2, '0')}`;
  }
  const calendarYearOf = (isoDate) => Number(isoDate.slice(0, 4));
  const round2 = (n) => Math.round(n * 100) / 100;

  function taxYearSummary(sales, taxYear) {
    const inYear = sales.filter((s) => taxYearOf(s.date) === taxYear);
    const byPlatform = {};
    let resale = 0, personal = 0, unsorted = 0, resaleCost = 0, resaleFees = 0, missingCost = 0;
    for (const s of inYear) {
      const p = (byPlatform[s.platform] = byPlatform[s.platform] || { count: 0, total: 0 });
      p.count++; p.total += s.amount;
      if (s.kind === 'resale') {
        resale += s.amount; resaleFees += s.fees || 0;
        if (s.cost == null) missingCost++; else resaleCost += s.cost;
      } else if (s.kind === 'personal') personal += s.amount;
      else unsorted += s.amount;
    }
    Object.values(byPlatform).forEach((p) => { p.total = round2(p.total); });
    return {
      taxYear, count: inYear.length, byPlatform,
      resale: round2(resale), personal: round2(personal), unsorted: round2(unsorted),
      resaleCost: round2(resaleCost), resaleFees: round2(resaleFees),
      resaleProfit: round2(resale - resaleCost - resaleFees), missingCost,
      overTradingAllowance: resale > TRADING_ALLOWANCE,
    };
  }

  function reportingCheck(sales, year) {
    const by = {};
    for (const s of sales) {
      if (calendarYearOf(s.date) !== year) continue;
      const p = (by[s.platform] = by[s.platform] || { count: 0, total: 0 });
      p.count++; p.total += s.amount;
    }
    return Object.entries(by).map(([platform, p]) => ({
      platform, count: p.count, total: round2(p.total),
      reported: p.count >= REPORT_SALES || p.total > REPORT_GBP,
      near: !(p.count >= REPORT_SALES || p.total > REPORT_GBP) && (p.count >= REPORT_SALES - 5 || p.total > REPORT_GBP * 0.85),
    })).sort((a, b) => a.platform.localeCompare(b.platform));
  }

  function taxYearsIn(sales) {
    return [...new Set(sales.map((s) => taxYearOf(s.date)))].sort().reverse();
  }

  // ---------- Export ----------
  const csvCell = (v) => {
    let s = String(v == null ? '' : v);
    if (/^[=+\-@]/.test(s)) s = "'" + s; // keep spreadsheets from running formulas
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  function exportCSV(sales, taxYear) {
    const sum = taxYearSummary(sales, taxYear);
    const rows = [
      ['Resale Records summary', `Tax year ${taxYear}`],
      ['Record-keeping summary, not tax advice. Check GOV.UK or an accountant before filing.'],
      [],
      ['Bought to resell: takings', sum.resale], ['Bought to resell: what you paid', sum.resaleCost], ['Bought to resell: platform fees', sum.resaleFees],
      ['Bought to resell: profit', sum.resaleProfit], ['Resale sales missing what you paid', sum.missingCost],
      ['Personal clear-out takings', sum.personal], ['Not yet sorted', sum.unsorted],
      [],
      ['Date', 'Platform', 'Item', 'Sale amount (GBP)', 'Fees (GBP)', 'What you paid (GBP)', 'Type'],
      ...sales.filter((s) => taxYearOf(s.date) === taxYear).sort((a, b) => a.date.localeCompare(b.date))
        .map((s) => [s.date, s.platform, s.item, s.amount, s.fees || 0, s.cost == null ? '' : s.cost, s.kind]),
    ];
    return rows.map((r) => r.map(csvCell).join(',')).join('\r\n');
  }

  // ---------- Unlock codes ----------
  // Format RR-XXXX-XXXX-CC. The check characters stop typos and casual guessing; this is honour-system protection.
  const ALPH = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  function checkChars(body) {
    let h = 2166136261;
    const s = 'resale-records|' + body;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return ALPH[h % ALPH.length] + ALPH[Math.floor(h / ALPH.length) % ALPH.length];
  }
  function isValidCode(code) {
    const m = String(code || '').toUpperCase().replace(/\s/g, '').match(/^RR-([A-Z0-9]{4})-([A-Z0-9]{4})-([A-Z0-9]{2})$/);
    return !!m && checkChars(m[1] + m[2]) === m[3];
  }
  function makeCode(random) {
    const pick = () => ALPH[Math.floor(random() * ALPH.length)];
    const body = Array.from({ length: 8 }, pick).join('');
    return `RR-${body.slice(0, 4)}-${body.slice(4)}-${checkChars(body)}`;
  }

  const api = {
    REPORT_SALES, REPORT_GBP, TRADING_ALLOWANCE, FREE_SALES_LIMIT,
    parseCSV, guessMapping, detectPlatform, parseMoney, parseDate, guessDateOrder,
    recordsToSales, parseVintedHistory, mergeSales, taxYearOf, calendarYearOf, taxYearSummary, reportingCheck, taxYearsIn,
    exportCSV, isValidCode, makeCode,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RRCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
