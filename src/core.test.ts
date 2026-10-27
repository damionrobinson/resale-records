import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as C from './core';
import type { Sale } from './core';

const data = (f: string) => readFileSync(join(__dirname, '../test-data', f), 'utf8');
const sale = (p: Partial<Sale>): Sale => ({ id: Math.random().toString(36), platform: 'eBay', date: '2025-06-01', item: 'x', amount: 10, fees: 0, cost: null, kind: 'unsorted', ...p });

describe('dates and money', () => {
  it('tax year boundary is 6 April', () => {
    expect(C.taxYearOf('2026-04-05')).toBe('2025/26');
    expect(C.taxYearOf('2026-04-06')).toBe('2026/27');
    expect(C.taxYearOf('2026-01-15')).toBe('2025/26');
    expect(C.taxYearOf('2025-12-31')).toBe('2025/26');
  });
  it('parses UK, US-style, text-month and ISO dates', () => {
    expect(C.parseDate('21/10/2026', 'DMY')).toBe('2026-10-21');
    expect(C.parseDate('04/05/26', 'MDY')).toBe('2026-04-05');
    expect(C.parseDate('04/05/26', 'DMY')).toBe('2026-05-04');
    expect(C.parseDate('14-Mar-26')).toBe('2026-03-14');
    expect(C.parseDate('Oct 21, 2026')).toBe('2026-10-21');
    expect(C.parseDate('10 August 2024')).toBe('2024-08-10');
    expect(C.parseDate('2026-10-21T10:00:00Z')).toBe('2026-10-21');
    expect(C.parseDate('not a date')).toBe('');
    expect(C.guessDateOrder(['11/21/25'], 'Etsy')).toBe('MDY');
    expect(C.guessDateOrder(['21/10/2026'], '')).toBe('DMY');
  });
  it('localISO uses the local date, not UTC', () => {
    expect(C.localISO(new Date(2025, 4, 3, 0, 30))).toBe('2025-05-03');
  });
  it('parses money', () => {
    expect(C.parseMoney('£1,250.00')).toBe(1250);
    expect(C.parseMoney('1.250,50')).toBe(1250.5);
    expect(C.parseMoney('(3.20)')).toBe(-3.2);
    expect(C.parseMoney('abc')).toBeNaN();
    expect(C.parseMoney('1 234,56')).toBe(1234.56);
    expect(C.parseMoney('1,234')).toBe(1234);
  });
});

describe('imports', () => {
  it('Etsy: US-style dates, fees, no item column, split at 6 April', () => {
    const { headers, records } = C.parseCSV(data('etsy-orders-sample.csv'));
    const map = C.guessMapping(headers, 'EtsySoldOrders2026.csv');
    expect(map).toMatchObject({ platform: 'Etsy', date: 'Sale Date', amount: 'Order Value', item: '', fees: 'Card Processing Fees' });
    const order = C.guessDateOrder(records.map((r) => r[map.date]), map.platform);
    const { sales, skipped } = C.recordsToSales(records, map, order);
    expect(skipped).toEqual([]);
    expect(sales.map((s) => s.date)).toEqual(['2026-04-05', '2026-04-06', '2025-11-21']);
    expect(sales.map((s) => C.taxYearOf(s.date))).toEqual(['2025/26', '2026/27', '2025/26']);
    expect(sales[2].amount).toBe(1250);
    expect(sales[0].fees).toBe(1.2);
  });
  // Shapes from docs/research/2026-10-27-export-columns.md, with made-up values (no real exports in tests).
  it('eBay orders file: notes and a blank row above the header, Title Case, quantity, summary and footer rows', () => {
    const csv = [
      'Seller Hub orders report, downloaded 13 Aug 2026, one, two, three',
      '',
      'Sales Record Number,Order Number,Buyer Username,Item Title,Quantity,Sold For,Total Price,Sale Date,Transaction ID',
      '201,10-001,b1,,,,$31.00,Aug-13-26,',
      '201,10-001,b1,Mug,2,$12.00,,Aug-13-26,t1',
      '201,10-001,b1,Plate,1,$7.00,,Aug-13-26,t2',
      '2 record(s) downloaded',
    ].join('\n');
    const { headers, records } = C.parseCSV(csv);
    expect(headers[0]).toBe('Sales Record Number');
    const map = C.guessMapping(headers, 'orders.csv');
    expect(map).toMatchObject({ platform: 'eBay', amount: 'Sold For', quantity: 'Quantity' });
    const { sales, skipped } = C.recordsToSales(records, map, 'DMY');
    expect(sales.map((s) => [s.date, s.amount])).toEqual([['2026-08-13', 24], ['2026-08-13', 7]]);
    expect(skipped).toHaveLength(2); // the order summary row and the footer
  });
  it('Depop: placeholders read as empty, refunds in the row come off the price', () => {
    const header = 'Date of sale,Time of sale,Date of listing,Bundle,Bundle - amount of items,Buyer,Brand,Description,Size,Item price,Buyer shipping cost,Total,USPS Cost,Depop fee,Depop Payments fee,Buyer Marketplace Fee,Boosting fee,Payment type,Estimated payout date,Payout arrival date,Category,Name,Address Line 1,Address Line 2,City,State,Post Code,Country,US Sales tax,Refunded to buyer amount,Fees refunded to seller';
    const dash = '"=""-"""';
    const row = (date: string, price: string, refund: string) =>
      [`"${date}"`, '"10:00"', '"01/01/2025"', '"No"', dash, '"x"', '"x"', '"Tee"', '"M"', `"${price}"`, '"$3.00"', '"$0"', '"N/A"', dash, '"$0.80"', '"N/A"', '"N/A"',
        ...Array(12).fill('"x"'), `"${refund}"`, '"N/A"'].join(',');
    const { headers, records } = C.parseCSV([header, row('10/25/2024', '$20.00', '$0.00'), row('10/26/2024', '$15.00', '$5.00')].join('\n'));
    const map = C.guessMapping(headers, 'depop.csv');
    expect(map).toMatchObject({ platform: 'Depop', amount: 'Item price', fees: 'Depop fee' });
    const order = C.guessDateOrder(records.map((r) => r[map.date]), map.platform);
    const { sales } = C.recordsToSales(records, map, order);
    expect(sales.map((s) => [s.date, s.amount, s.fees])).toEqual([['2024-10-25', 20, 0], ['2024-10-26', 10, 0]]);
  });
  it('Etsy Orders file with a byte-order mark and $ amounts', () => {
    const { headers, records } = C.parseCSV('﻿Sale Date,Order ID,Number of Items,Currency,Order Value,Order Total,Card Processing Fees,Adjusted Order Total\n03/03/26,1,3,GBP,$5.00,$7.50,$0.40,');
    const map = C.guessMapping(headers, 'EtsySoldOrders2026.csv');
    expect(headers[0]).toBe('Sale Date');
    expect(C.recordsToSales(records, map, 'MDY').sales.map((s) => [s.date, s.amount, s.fees])).toEqual([['2026-03-03', 5, 0.4]]);
  });
  it('Etsy: takes refunds off Order Value using Adjusted Order Total', () => {
    const csv = 'Sale Date,Order ID,Order Value,Order Total,Adjusted Order Total\n04/05/26,1,25.00,28.50,\n04/06/26,2,40.00,44.00,0\n04/07/26,3,40.00,44.00,34.00';
    const { headers, records } = C.parseCSV(csv);
    const sales = C.recordsToSales(records, C.guessMapping(headers, 'EtsySoldOrders.csv'), 'MDY').sales;
    expect(sales.map((s) => s.amount)).toEqual([25, 0, 30]);
  });
  it('eBay: detects platform and removes the duplicate row', () => {
    const { headers, records } = C.parseCSV(data('ebay-orders-sample.csv'));
    const map = C.guessMapping(headers, 'orders.csv');
    expect(map.platform).toBe('eBay');
    expect(map.amount).toBe('Sold for');
    const merged = C.mergeSales([], C.recordsToSales(records, map, 'DMY').sales);
    expect(merged.added).toBe(2);
    expect(merged.duplicates).toBe(1);
  });
  it('Depop: skips the broken row', () => {
    const { headers, records } = C.parseCSV(data('depop-sales-sample.csv'));
    const map = C.guessMapping(headers, 'depop.csv');
    expect(map.platform).toBe('Depop');
    const { sales, skipped } = C.recordsToSales(records, map, 'DMY');
    expect(sales).toHaveLength(1);
    expect(skipped).toEqual([3]);
  });
  it('Vinted payment history paste: sales only, exact dates, no duplicates on re-paste', () => {
    const { sales, skipped } = C.parseVintedHistory(data('vinted-payment-history-sample.txt'));
    expect(skipped).toBe(0);
    expect(sales.map((s) => [s.date, s.amount])).toEqual([['2024-06-29', 12.8], ['2024-06-24', 10], ['2024-04-05', 8.8]]);
    expect(C.taxYearOf(sales[2].date)).toBe('2023/24');
    const again = C.mergeSales(sales, C.parseVintedHistory(data('vinted-payment-history-sample.txt')).sales);
    expect(again).toMatchObject({ added: 0, duplicates: 3 });
    expect(C.parseVintedHistory('Sold\nNo price or date here').skipped).toBe(1);
  });
  it('Vinted paste also reads +£ amounts, dd/mm/yyyy dates, Today and Yesterday', () => {
    const today = new Date(2026, 9, 26);
    const { sales } = C.parseVintedHistory('Sold\nA\n+£5.00\nToday\nSold\nB\n£6.00\nYesterday\nSold\nC\n£1,234.50\n10/08/2024', today);
    expect(sales.map((s) => [s.date, s.amount])).toEqual([['2026-10-26', 5], ['2026-10-25', 6], ['2024-08-10', 1234.5]]);
  });
  it('overlapping files without order numbers don\'t double up, and repeats within a file are kept', () => {
    const map = { platform: 'Depop', date: 'Date of sale', amount: 'Item price', item: 'Item description', orderId: '', fees: '' };
    const read = (csv: string) => C.recordsToSales(C.parseCSV(csv).records, map, 'DMY').sales;
    const first = read('Date of sale,Item description,Item price\n01/03/2026,Sticker,2\n01/03/2026,Sticker,2\n02/03/2026,Y,6');
    const second = read('Date of sale,Item description,Item price\n28/02/2026,W,4\n01/03/2026,Sticker,2\n01/03/2026,Sticker,2\n02/03/2026,Y,6');
    expect(first).toHaveLength(3);
    expect(C.mergeSales(first, second)).toMatchObject({ added: 1, duplicates: 3 });
  });
});

describe('summaries', () => {
  it('reporting check: 30 sales or more than 1,700 per platform per calendar year', () => {
    const mk = (platform: string, n: number, amount: number, date: string) => Array.from({ length: n }, () => sale({ platform, amount, date }));
    const rows = C.reportingCheck([...mk('Vinted', 30, 5, '2026-03-01'), ...mk('eBay', 29, 5, '2026-03-01'), ...mk('Etsy', 1, 1700.01, '2026-03-01'), ...mk('Depop', 1, 1700, '2026-03-01'), ...mk('Vinted', 40, 5, '2025-03-01')], 2026);
    const r = Object.fromEntries(rows.map((x) => [x.platform, x]));
    expect(r.Vinted).toMatchObject({ reported: true, count: 30 });
    expect(r.eBay).toMatchObject({ reported: false, near: true });
    expect(r.Etsy.reported).toBe(true);
    expect(r.Depop.reported).toBe(false);
  });
  it('tax year summary: resale profit and trading allowance flag', () => {
    const sales = [
      sale({ date: '2025-06-01', amount: 800, fees: 50, cost: 300, kind: 'resale' }),
      sale({ date: '2026-01-01', amount: 300, fees: 20, kind: 'resale' }),
      sale({ platform: 'Vinted', date: '2025-07-01', amount: 40, kind: 'personal' }),
      sale({ platform: 'Vinted', date: '2026-04-06', amount: 99, kind: 'resale' }),
    ];
    const s = C.taxYearSummary(sales, '2025/26');
    expect(s).toMatchObject({ count: 3, resale: 1100, resaleProfit: 730, missingCost: 1, personal: 40, overTradingAllowance: true });
  });
  it('refunds and cancelled orders net off the totals but are not counted as sales', () => {
    const sales = [
      sale({ date: '2026-03-01', amount: 10, kind: 'resale' }),
      sale({ date: '2026-03-02', amount: -10, kind: 'resale' }),
      sale({ date: '2026-03-03', amount: 0 }),
    ];
    expect(C.reportingCheck(sales, 2026)[0]).toMatchObject({ count: 1, total: 0 });
    expect(C.taxYearSummary(sales, '2025/26')).toMatchObject({ count: 1, resale: 0, missingCost: 1, unsortedCount: 0 });
  });
});

describe('missing fees notice', () => {
  it('names only file-imported Etsy, eBay and Depop resale sales in the tax year', () => {
    const sales = [
      sale({ platform: 'Etsy', date: '2025-06-01', kind: 'resale', source: 'import' }),
      sale({ platform: 'eBay', date: '2025-07-01', kind: 'resale', source: 'manual' }),
      sale({ platform: 'Vinted', date: '2025-07-01', kind: 'resale', source: 'vinted-paste' }),
      sale({ platform: 'Depop', date: '2025-08-01', kind: 'personal', source: 'import' }),
      sale({ platform: 'eBay', date: '2026-05-01', kind: 'resale', source: 'import' }),
    ];
    expect(C.incompleteFeePlatforms(sales, '2025/26')).toEqual(['Etsy']);
    expect(C.incompleteFeePlatforms(sales, '2026/27')).toEqual(['eBay']);
    expect(C.incompleteFeePlatforms(sales.filter((s) => s.source !== 'import'), '2025/26')).toEqual([]);
    expect(C.listWords(['Etsy', 'eBay', 'Depop'])).toBe('Etsy, eBay and Depop');
    expect(C.listWords(['Etsy', 'eBay'])).toBe('Etsy and eBay');
  });
});

describe('first-time filers', () => {
  it('registration date and filing deadline come from the tax year', () => {
    expect(C.selfAssessmentDates('2025/26')).toEqual({ registerBy: '2026-10-05', fileAndPayBy: '2027-01-31' });
    expect(C.selfAssessmentDates('2026/27')).toEqual({ registerBy: '2027-10-05', fileAndPayBy: '2028-01-31' });
  });
  it('the £1,000 statement: over only above £1,000', () => {
    expect(C.allowanceStatement(0)).toBe('not-over');
    expect(C.allowanceStatement(1000)).toBe('not-over');
    expect(C.allowanceStatement(1000.01)).toBe('over');
  });
  it('knows when the registration date has passed', () => {
    expect(C.registrationPassed('2025/26', '2026-10-05')).toBe(false);
    expect(C.registrationPassed('2025/26', '2026-10-06')).toBe(true);
    expect(C.registrationPassed('2026/27', '2026-10-27')).toBe(false);
  });
});

describe('tax year record', () => {
  const sales = [
    sale({ platform: 'Vinted', date: '2025-04-06', amount: 600, cost: 200, kind: 'resale' }),
    sale({ platform: 'Vinted', date: '2025-12-20', amount: 900, fees: 30, cost: 400, kind: 'resale' }),
    sale({ platform: 'eBay', date: '2026-04-05', amount: 50, kind: 'personal' }),
    sale({ platform: 'eBay', date: '2026-04-06', amount: 70, kind: 'resale' }), // next tax year
    sale({ platform: 'Depop', date: '2026-02-01', amount: 15 }),
  ];
  const r = C.taxYearRecord(sales, '2025/26');
  it('shows profit both ways', () => {
    expect(r.actualCostsProfit).toBe(1500 - 600 - 30);
    expect(r.allowanceProfit).toBe(500);
    expect(C.taxYearRecord([sale({ amount: 400, kind: 'resale' })], '2025/26').allowanceProfit).toBe(0);
  });
  it('months run April to March, with 1-5 April counted in March', () => {
    expect(r.months[0].label).toBe('Apr 2025');
    expect(r.months[11].label).toBe('Mar 2026');
    expect(r.months[0].resale).toBe(600);
    expect(r.months[8].resale).toBe(900);
    expect(r.months[11].personal).toBe(50);
    expect(r.months[10].unsorted).toBe(15);
    expect(r.months.reduce((a, m) => a + m.count, 0)).toBe(4);
  });
  it('lists the two calendar years the tax year touches', () => {
    expect(r.calendarReports.map((c) => c.year)).toEqual([2025, 2026]);
    expect(r.calendarReports[1].rows.find((x) => x.platform === 'eBay')).toMatchObject({ count: 2, total: 120 });
  });
  it('sale list is only this tax year, in date order', () => {
    expect(r.sales.map((s) => s.date)).toEqual(['2025-04-06', '2025-12-20', '2026-02-01', '2026-04-05']);
  });
});

describe('export and codes', () => {
  it('CSV formats money and guards against spreadsheet formulas', () => {
    const csv = C.exportCSV([sale({ item: '=HYPERLINK("x")', amount: 5, fees: 0.6, kind: 'resale' })], '2025/26');
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
    expect(csv).toContain('5.00,0.60');
    expect(csv).toContain('Profit using the GBP 1000 trading allowance instead (GBP),0.00');
  });
  it('unlock codes validate and reject tampering', () => {
    let seed = 1;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 200; i++) expect(C.isValidCode(C.makeCode(rnd))).toBe(true);
    const c = C.makeCode(rnd);
    expect(C.isValidCode(c.toLowerCase())).toBe(true);
    expect(C.isValidCode(c.slice(0, -1) + (c.endsWith('A') ? 'B' : 'A'))).toBe(false);
    expect(C.isValidCode('RR-AAAA-AAAA')).toBe(false);
  });
  it('codes made by the old app still unlock', () => {
    expect(C.isValidCode('RR-GGTS-M7A8-WP')).toBe(true);
  });
});
