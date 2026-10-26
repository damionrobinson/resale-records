import type { Sale } from '../core';

export { CONTACT, PAY_URL } from '../shared/site';
const KEY = 'rr.v1'; // same key as the first version, so existing data carries over

export interface AppState {
  sales: Sale[];
  code: string;
  taxYear: string;
  calYear: number;
}

export function loadState(): AppState {
  const fallback: AppState = { sales: [], code: '', taxYear: '', calYear: new Date().getFullYear() };
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (s && Array.isArray(s.sales)) return { ...fallback, ...s };
  } catch {
    /* storage unavailable */
  }
  return fallback;
}

/** Returns false if the browser refused to store the data. */
export function saveState(state: AppState): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export const gbp = (n: number) => {
  const v = Number(n) || 0;
  return (v < 0 ? '-£' : '£') + Math.abs(v).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
export const ukDate = (iso: string) => iso.split('-').reverse().join('/');
const LONG_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const longDate = (d: Date) => `${d.getDate()} ${LONG_MONTHS[d.getMonth()]} ${d.getFullYear()}`;

export function download(name: string, text: string, type: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 1000);
}
