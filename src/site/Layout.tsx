import type { ReactNode } from 'react';
import { COMPANY, COMPANY_NUMBER, CONTACT, REGISTERED_OFFICE } from '../shared/site';

export function SiteHeader({ cta = true }: { cta?: boolean }) {
  return (
    <header className="top">
      <div className="wrap">
        <a className="brand" href="/">Resale<span>Records</span></a>
        {cta && <a className="btn ghost" href="/app/">Open the app</a>}
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-foot">
      <div className="wrap">
        <p className="notice">Resale Records is a record-keeping tool. It is not tax advice and is not affiliated with HMRC, Vinted, eBay, Etsy or Depop.</p>
        <p>Resale Records is a trading name of {COMPANY}, registered in England and Wales, company number {COMPANY_NUMBER}. Registered office: {REGISTERED_OFFICE}.</p>
        <p>Contact: <a href={`mailto:${CONTACT}`}>{CONTACT}</a> · <a href="/privacy.html">Privacy notice</a></p>
      </div>
    </footer>
  );
}

/** A plain text page (privacy, thank-you) with the site header. */
export function DocPage({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="doc">{children}</main>
    </>
  );
}
