// Resale Records core logic: CSV parsing, platform detection, UK tax years, reporting thresholds,
// the tax-year record and unlock codes. Pure functions, no network.

export const REPORT_SALES = 30; // platforms report at 30+ sales in a calendar year...
export const REPORT_GBP = 1700; // ...or more than EUR 2,000 (about GBP 1,700 at the platform's rate)
export const TRADING_ALLOWANCE = 1000; // GBP of gross trading income per tax year
export const FREE_SALES_LIMIT = 20;

export type Kind = 'resale' | 'personal' | 'unsorted';
export interface Sale {
  id: string;
  platform: string;
  date: string; // ISO yyyy-mm-dd
  item: string;
  amount: number;
  fees: number;
  cost: number | null;
  kind: Kind;
  source?: string;
}
export type DateOrder = 'DMY' | 'MDY';
export interface ColumnMap {
  platform: string;
  date: string;
  amount: string;
  item: string;
  orderId: string;
  quantity?: string;
  fees: string;
}
export type CsvRecord = Record<string, string>;

const round2 = (n: number) => Math.round(n * 100) / 100;
/** A refund (negative) or cancelled (£0) row still nets off the totals, but isn't counted as a sale. */
export const isSale = (s: Sale) => s.amount > 0;

// ---------- CSV ----------
export function parseCSV(input: string): { headers: string[]; records: CsvRecord[] } {
  const text = String(input || '').replace(/^﻿/, '');
  const first = text.split('\n')[0];
  const count = (re: RegExp) => (first.match(re) || []).length;
  const delim = count(/\t/g) > count(/,/g) ? '\t' : count(/;/g) > count(/,/g) ? ';' : ',';
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
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
const norm = (s: string) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
type Field = 'date' | 'amount' | 'item' | 'orderId' | 'quantity' | 'fees';
const FIELD_HINTS: Record<Field, string[]> = {
  date: ['sale date', 'date of sale', 'sold date', 'order date', 'date sold', 'paid on date', 'transaction date', 'date'],
  amount: ['order value', 'item total', 'sold for', 'item price', 'price', 'total price', 'sale price', 'order total', 'total', 'amount', 'gross'],
  item: ['item name', 'item title', 'item description', 'title', 'description', 'item', 'product'],
  orderId: ['order id', 'order number', 'sales record number', 'transaction id', 'order no', 'receipt id', 'id'],
  quantity: ['quantity', 'qty', 'number of items'],
  fees: ['fees', 'card processing fees', 'transaction fees', 'final value fee', 'depop fee', 'selling fees'],
};
// Headers that contain a hint word but hold something else (e.g. "Number of Items" is a count, not an item).
const FIELD_EXCLUDE: Partial<Record<Field, RegExp>> = {
  item: /number|quantity|qty|count|id\b/,
  amount: /fee|tax|vat|shipping|postage|discount/,
  date: /ship|dispatch|deliver/,
};
function guessColumn(headers: string[], field: Field): string {
  const hs = headers.map(norm);
  const ok = (h: string) => !FIELD_EXCLUDE[field]?.test(h);
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
export function detectPlatform(headers: string[], fileName = ''): string {
  const hs = headers.map(norm).join('|');
  const f = norm(fileName);
  if (/etsy/.test(f) || (/sale date/.test(hs) && /(order value|item total|number of items)/.test(hs))) return 'Etsy';
  if (/ebay/.test(f) || /(sales record number|sold for)/.test(hs)) return 'eBay';
  if (/depop/.test(f) || (/date of sale/.test(hs) && /item price/.test(hs))) return 'Depop';
  if (/vinted/.test(f)) return 'Vinted';
  return '';
}
export function guessMapping(headers: string[], fileName = ''): ColumnMap {
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
export function parseMoney(v: unknown): number {
  if (v == null) return NaN;
  let s = String(v).replace(/[£$€\s]|GBP|USD|EUR/gi, '');
  const neg = /^\(.*\)$/.test(s) || /^-/.test(s);
  s = s.replace(/[()-]/g, '');
  if (/^\d+(\.\d{3})*,\d{1,2}$/.test(s)) s = s.replace(/\./g, '').replace(',', '.'); // 1.234,56 or 1 234,56
  else s = s.replace(/,/g, '');
  const n = parseFloat(s);
  return isNaN(n) ? NaN : neg ? -n : n;
}

const MONTHS: Record<string, number> = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12 };
const monthOf = (word: string) => MONTHS[word.slice(0, 4).toLowerCase()] || MONTHS[word.slice(0, 3).toLowerCase()] || 0;
const fullYear = (y: number) => (y < 100 ? 2000 + y : y);
const iso = (y: number, m: number, d: number) =>
  m >= 1 && m <= 12 && d >= 1 && d <= 31 ? `${fullYear(y)}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` : '';

// order: 'DMY' (UK) or 'MDY' (US-style, used by some exports). Text months and ISO dates are unambiguous.
export function parseDate(v: unknown, order: DateOrder = 'DMY'): string {
  const s = String(v || '').trim();
  let m: RegExpMatchArray | null;
  if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) return iso(+m[1], +m[2], +m[3]);
  if ((m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/))) {
    const a = +m[1], b = +m[2], y = +m[3];
    if (a > 12) return iso(y, b, a);
    if (b > 12) return iso(y, a, b);
    return order === 'MDY' ? iso(y, a, b) : iso(y, b, a);
  }
  if ((m = s.match(/^(\d{1,2})[\s-]([A-Za-z]{3,9})[\s,-]+(\d{2,4})/))) return iso(+m[3], monthOf(m[2]), +m[1]);
  if ((m = s.match(/^([A-Za-z]{3,9})[\s-](\d{1,2})(?:st|nd|rd|th)?[\s,-]+(\d{2,4})/))) return iso(+m[3], monthOf(m[1]), +m[2]);
  return '';
}
export function guessDateOrder(values: string[], platform: string): DateOrder {
  for (const v of values) {
    const m = String(v || '').trim().match(/^(\d{1,2})[/.-](\d{1,2})[/.-]\d{2,4}/);
    if (!m) continue;
    if (+m[1] > 12) return 'DMY';
    if (+m[2] > 12) return 'MDY';
  }
  return platform === 'Etsy' ? 'MDY' : 'DMY';
}
/** Local calendar date as yyyy-mm-dd (avoids the UTC shift of toISOString in UK summer time). */
export function localISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ---------- Import ----------
export function recordsToSales(records: CsvRecord[], map: ColumnMap, dateOrder: DateOrder, source = 'import') {
  const sales: Sale[] = [];
  const skipped: number[] = [];
  const seen: Record<string, number> = {};
  records.forEach((r, i) => {
    const date = parseDate(r[map.date], dateOrder);
    let amount = parseMoney(r[map.amount]);
    // Etsy's Orders file leaves refunds out of Order Value. "Adjusted Order Total" is blank with no refund, 0 after a
    // full refund and the remainder after a partial one, so the refund is Order Total minus Adjusted Order Total.
    const adjusted = r['Adjusted Order Total'];
    if (map.amount === 'Order Value' && adjusted != null && adjusted !== '' && !isNaN(amount)) {
      const refund = parseMoney(r['Order Total']) - parseMoney(adjusted);
      if (refund > 0) amount = Math.max(0, amount - refund);
    }
    if (!date || isNaN(amount)) { skipped.push(i + 2); return; }
    const fees = map.fees ? Math.abs(parseMoney(r[map.fees])) : 0;
    // With an order number, an identical row is the same sale listed twice. Without one, the nth identical row
    // in a file is numbered n, so overlapping downloads (Depop gives 3 months per file) match up instead of doubling.
    let id = `${map.platform}|${map.orderId ? r[map.orderId] : ''}|${date}|${amount}|${map.item ? r[map.item] : ''}|`;
    if (!map.orderId) id += (seen[id] = (seen[id] || 0) + 1);
    sales.push({
      id,
      platform: map.platform || 'Other',
      date,
      item: (map.item ? r[map.item] : '').slice(0, 140),
      amount: round2(amount),
      fees: isNaN(fees) ? 0 : round2(fees),
      cost: null,
      kind: 'unsorted',
      source,
    });
  });
  return { sales, skipped };
}

// Vinted has no sales download. Its Balance › Payment history pages (one month each) copy as blocks:
//   Sold / <item title> / £12.00 / 10 August 2024
// Withdrawals, purchases and refunds use other first lines and are skipped. Works on a whole-page copy.
const MONEY_LINE = /^[-+]?£\s?[\d,]+(\.\d{1,2})?$/;
const DATE_LINE = /^(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4}|today|yesterday)$/i;
function vintedDate(line: string, today: Date): string {
  const word = line.toLowerCase();
  if (word === 'today' || word === 'yesterday') return localISO(new Date(today.getFullYear(), today.getMonth(), today.getDate() - (word === 'yesterday' ? 1 : 0)));
  return parseDate(line, 'DMY');
}
export function parseVintedHistory(text: string, today = new Date()) {
  const lines = String(text || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const sales: Sale[] = [];
  let skipped = 0;
  for (let i = 0; i < lines.length; i++) {
    if (!/^sold$/i.test(lines[i])) continue;
    const title: string[] = [];
    let j = i + 1;
    while (j < lines.length && !MONEY_LINE.test(lines[j]) && title.length < 3) title.push(lines[j++]);
    const money = lines[j], date = lines[j + 1];
    if (!MONEY_LINE.test(money || '') || !DATE_LINE.test(date || '')) { skipped++; continue; }
    const when = vintedDate(date, today);
    const amount = parseMoney(money.replace('+', ''));
    if (!when || isNaN(amount)) { skipped++; continue; }
    const item = title.join(' ').slice(0, 140);
    sales.push({ id: `Vinted|history|${when}|${amount}|${item}`, platform: 'Vinted', date: when, item, amount: round2(amount), fees: 0, cost: null, kind: 'unsorted', source: 'vinted-paste' });
    i = j + 1;
  }
  return { sales, skipped };
}

export function mergeSales(existing: Sale[], incoming: Sale[]) {
  const seen = new Set(existing.map((s) => s.id));
  const added = incoming.filter((s) => !seen.has(s.id) && !!seen.add(s.id));
  return { sales: existing.concat(added), added: added.length, duplicates: incoming.length - added.length };
}

// ---------- Years and totals ----------
/** UK tax year starting 6 April, e.g. '2025/26'. */
export function taxYearOf(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const start = m > 4 || (m === 4 && d >= 6) ? y : y - 1;
  return `${start}/${String((start + 1) % 100).padStart(2, '0')}`;
}
export const calendarYearOf = (isoDate: string) => Number(isoDate.slice(0, 4));
export const taxYearStart = (taxYear: string) => Number(taxYear.slice(0, 4));
export const taxYearsIn = (sales: Sale[]) => [...new Set(sales.map((s) => taxYearOf(s.date)))].sort().reverse();

export interface TaxYearSummary {
  taxYear: string;
  count: number;
  byPlatform: Record<string, { count: number; total: number }>;
  resale: number;
  personal: number;
  unsorted: number;
  unsortedCount: number;
  resaleCost: number;
  resaleFees: number;
  resaleProfit: number;
  missingCost: number;
  overTradingAllowance: boolean;
}
export function taxYearSummary(sales: Sale[], taxYear: string): TaxYearSummary {
  const inYear = sales.filter((s) => taxYearOf(s.date) === taxYear);
  const byPlatform: TaxYearSummary['byPlatform'] = {};
  let resale = 0, personal = 0, unsorted = 0, unsortedCount = 0, resaleCost = 0, resaleFees = 0, missingCost = 0;
  for (const s of inYear) {
    const p = (byPlatform[s.platform] = byPlatform[s.platform] || { count: 0, total: 0 });
    if (isSale(s)) p.count++;
    p.total += s.amount;
    if (s.kind === 'resale') {
      resale += s.amount; resaleFees += s.fees || 0;
      if (s.cost != null) resaleCost += s.cost;
      else if (isSale(s)) missingCost++;
    } else if (s.kind === 'personal') personal += s.amount;
    else { unsorted += s.amount; if (isSale(s)) unsortedCount++; }
  }
  Object.values(byPlatform).forEach((p) => { p.total = round2(p.total); });
  return {
    taxYear, count: inYear.filter(isSale).length, byPlatform,
    resale: round2(resale), personal: round2(personal), unsorted: round2(unsorted), unsortedCount,
    resaleCost: round2(resaleCost), resaleFees: round2(resaleFees),
    resaleProfit: round2(resale - resaleCost - resaleFees), missingCost,
    overTradingAllowance: resale > TRADING_ALLOWANCE,
  };
}

export interface ReportRow { platform: string; count: number; total: number; reported: boolean; near: boolean }
export function reportingCheck(sales: Sale[], year: number): ReportRow[] {
  const by: Record<string, { count: number; total: number }> = {};
  for (const s of sales) {
    if (calendarYearOf(s.date) !== year) continue;
    const p = (by[s.platform] = by[s.platform] || { count: 0, total: 0 });
    if (isSale(s)) p.count++;
    p.total += s.amount;
  }
  return Object.entries(by).map(([platform, p]) => {
    const reported = p.count >= REPORT_SALES || p.total > REPORT_GBP;
    return { platform, count: p.count, total: round2(p.total), reported, near: !reported && (p.count >= REPORT_SALES - 5 || p.total > REPORT_GBP * 0.85) };
  }).sort((a, b) => a.platform.localeCompare(b.platform));
}

// ---------- First-time filers ----------
/** Self Assessment dates for a tax year, as GOV.UK states them: tell HMRC (register) by 5 October after the tax year
 *  ends, then file online and pay by 31 January after that. For '2025/26': 2026-10-05 and 2027-01-31. */
export function selfAssessmentDates(taxYear: string) {
  const start = taxYearStart(taxYear);
  return { registerBy: `${start + 1}-10-05`, fileAndPayBy: `${start + 2}-01-31` };
}
/** Which GOV.UK statement applies to these bought-to-resell takings: 'over' the £1,000 trading allowance, or not.
 *  It describes the rule beside the figure; it never decides for the user. */
export const allowanceStatement = (takings: number): 'over' | 'not-over' => (takings > TRADING_ALLOWANCE ? 'over' : 'not-over');

// ---------- Tax year record ----------
export interface TaxYearRecord {
  summary: TaxYearSummary;
  /** Profit using actual costs (takings minus what you paid and fees). */
  actualCostsProfit: number;
  /** Profit using the £1,000 trading allowance instead of costs (never below zero). */
  allowanceProfit: number;
  months: { label: string; key: string; resale: number; personal: number; unsorted: number; count: number }[];
  /** Calendar years the tax year touches, with what each platform reported for that calendar year. */
  calendarReports: { year: number; rows: ReportRow[] }[];
  sales: Sale[];
}
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function taxYearRecord(all: Sale[], taxYear: string): TaxYearRecord {
  const summary = taxYearSummary(all, taxYear);
  const sales = all.filter((s) => taxYearOf(s.date) === taxYear).sort((a, b) => a.date.localeCompare(b.date) || a.item.localeCompare(b.item));
  const start = taxYearStart(taxYear);
  // Tax-year months run April..March; April holds 6-30 April and the next April's 1-5 days fall into March's bucket.
  const months = Array.from({ length: 12 }, (_, i) => {
    const m = ((3 + i) % 12) + 1; const y = m >= 4 ? start : start + 1;
    return { key: `${y}-${String(m).padStart(2, '0')}`, label: `${MONTH_NAMES[m - 1]} ${y}`, resale: 0, personal: 0, unsorted: 0, count: 0 };
  });
  for (const s of sales) {
    let key = s.date.slice(0, 7);
    if (key === `${start + 1}-04`) key = `${start + 1}-03`; // 1-5 April of the following year
    const row = months.find((r) => r.key === key);
    if (!row) continue;
    if (isSale(s)) row.count++;
    row[s.kind] = round2(row[s.kind] + s.amount);
  }
  return {
    summary,
    actualCostsProfit: summary.resaleProfit,
    allowanceProfit: round2(Math.max(0, summary.resale - TRADING_ALLOWANCE)),
    months,
    calendarReports: [start, start + 1].map((year) => ({ year, rows: reportingCheck(all, year) })),
    sales,
  };
}

// ---------- Export ----------
const csvCell = (v: unknown) => {
  let s = String(v == null ? '' : v);
  if (/^[=+\-@]/.test(s)) s = "'" + s; // keep spreadsheets from running formulas
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const money = (n: number) => (Number(n) || 0).toFixed(2);
export function exportCSV(all: Sale[], taxYear: string): string {
  const r = taxYearRecord(all, taxYear);
  const s = r.summary;
  const rows: unknown[][] = [
    ['Resale Records: tax year record', `Tax year ${taxYear}`],
    ['Record-keeping summary, not tax advice. Check GOV.UK or an accountant before filing.'],
    [],
    ['Bought to resell: takings (GBP)', money(s.resale)],
    ['Bought to resell: what you paid (GBP)', money(s.resaleCost)],
    ['Bought to resell: platform fees (GBP)', money(s.resaleFees)],
    ['Profit using actual costs (GBP)', money(r.actualCostsProfit)],
    [`Profit using the GBP ${TRADING_ALLOWANCE} trading allowance instead (GBP)`, money(r.allowanceProfit)],
    ['Resale sales missing what you paid', s.missingCost],
    ['Personal clear-out takings (GBP)', money(s.personal)],
    ['Not yet sorted (GBP)', money(s.unsorted)],
    [],
    ['Date', 'Platform', 'Item', 'Sale amount (GBP)', 'Fees (GBP)', 'What you paid (GBP)', 'Type'],
    ...r.sales.map((x) => [x.date, x.platform, x.item, money(x.amount), money(x.fees || 0), x.cost == null ? '' : money(x.cost), x.kind]),
  ];
  return rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
}

// ---------- Unlock codes ----------
// Format RR-XXXX-XXXX-CC. The check characters stop typos and casual guessing; this is honour-system protection.
const ALPH = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function checkChars(body: string): string {
  let h = 2166136261;
  const s = 'resale-records|' + body;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return ALPH[h % ALPH.length] + ALPH[Math.floor(h / ALPH.length) % ALPH.length];
}
export function isValidCode(code: string): boolean {
  const m = String(code || '').toUpperCase().replace(/\s/g, '').match(/^RR-([A-Z0-9]{4})-([A-Z0-9]{4})-([A-Z0-9]{2})$/);
  return !!m && checkChars(m[1] + m[2]) === m[3];
}
export function makeCode(random: () => number): string {
  const pick = () => ALPH[Math.floor(random() * ALPH.length)];
  const body = Array.from({ length: 8 }, pick).join('');
  return `RR-${body.slice(0, 4)}-${body.slice(4)}-${checkChars(body)}`;
}
