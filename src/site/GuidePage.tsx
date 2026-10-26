import type { ReactNode } from 'react';
import { GUIDES, type Guide } from './guides';
import { SiteFooter, SiteHeader } from './Layout';
import ReportChecker from './ReportChecker';

/** A link to GOV.UK (or another official source), opened in a new tab like the rest of the site. */
export function Gov({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} rel="noopener" target="_blank">{children}</a>;
}

/** A search guide: the answer first, the article, the free check, a way into the app, the FAQ, then the other guides. */
export function GuidePage({ guide, answer, children }: { guide: Guide; answer: ReactNode; children: ReactNode }) {
  const others = GUIDES.filter((g) => g.key !== guide.key);
  return (
    <>
      <SiteHeader />
      <main className="guide">
        <article className="doc">
          <span className="label">Guide</span>
          <h1>{guide.h1}</h1>
          <p className="answer">{answer}</p>
          <p className="notice">This guide explains the published rules. It isn’t tax advice: it can’t tell you whether you’re trading or what you owe. For that, use HMRC’s guidance or an accountant.</p>
          {children}
        </article>

        <section className="band" id="check">
          <div className="wrap">
            <div className="head">
              <span className="label">Free check</span>
              <h2>Check each platform against the limits</h2>
              <p>Enter your sales so far this calendar year on each platform. Nothing leaves your browser.</p>
            </div>
            <ReportChecker />
          </div>
        </section>

        <section className="doc">
          <div className="ticket">
            <span className="label">Resale Records</span>
            <h2>Get your sales into a UK tax-year record</h2>
            <p>Resale Records puts your Vinted, eBay, Etsy and Depop sales in one place, sorted by UK tax year. Import your Etsy, eBay and Depop files, or paste your Vinted payment history. It runs in your browser and your sales stay on your device.</p>
            <p>Free for up to 20 sales. £19 once unlocks unlimited sales and your tax year record.</p>
            <div className="actions"><a className="btn" href="/app/">Try it free</a><a className="btn ghost" href="/">How it works</a></div>
          </div>

          <h2>Common questions</h2>
          <div className="faq">
            {guide.faqs!.map((f) => <details key={f.q}><summary>{f.q}</summary><div><p>{f.a}</p></div></details>)}
          </div>

          <nav aria-label="More guides" className="more">
            <h2>More guides</h2>
            <ul>
              {others.map((g) => <li key={g.key}><a href={g.path}>{g.h1}</a></li>)}
              <li><a href="/">Resale Records home</a></li>
            </ul>
          </nav>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
