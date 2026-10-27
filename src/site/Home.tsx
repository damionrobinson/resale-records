import type { ReactNode } from 'react';
import { GOV, PAY_URL } from '../shared/site';
import { GUIDES } from './guides';
import { SiteFooter, SiteHeader } from './Layout';
import ReportChecker from './ReportChecker';

const PROBLEMS: [string, ReactNode][] = [
  ['Platforms report by calendar year', 'Each platform tells HMRC about you if you make 30 or more sales, or take more than €2,000 (about £1,700), on that platform in a calendar year.'],
  ['Tax works on the tax year', 'The £1,000 trading allowance and Self Assessment run from 6 April to 5 April. Your platform totals won’t line up with that unless you re-sort them.'],
  ['Not every sale is trading', <><a href={GOV.onlinePlatformsIncome} rel="noopener" target="_blank">GOV.UK says</a> if you’re selling personal possessions you “probably do not have to pay Income Tax”, but you’re “probably trading” if you sell goods you bought intending to sell for a profit. A record shows which was which.</>],
];
const VS = [
  ['Your buyers’ names and addresses', 'Uploaded to an AI company', 'Never leave your device'],
  ['6 April tax year and the 30-sale rule', 'Worked out fresh each time, and can be wrong', 'Built in and tested, with GOV.UK links'],
  ['Same answer every time', 'Not guaranteed', 'Yes'],
  ['Keeps your record all year', 'One chat at a time', 'Yes, with backups'],
  ['Effort', 'Export files and write prompts', 'Drop in your sales file'],
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="wrap">
            <div className="hero-copy">
              <span className="label">For UK Vinted, eBay, Etsy &amp; Depop sellers</span>
              <h1>Every sale sorted into the UK tax year, with your clear-outs kept separate.</h1>
              <p className="lede">Vinted, eBay, Etsy and Depop. No account, no logins: your sales never leave your device. Check free if you’re over the reporting limits.</p>
              <div className="actions">
                <a className="btn" href="/app/">Try it free</a>
                <a className="btn ghost" href="#check">Will I be reported? Free check</a>
              </div>
              <p className="fine">Free for up to 20 sales, then £19 once. Works in your browser; your sales never leave your device. A record-keeping tool, not tax advice.</p>
            </div>
            <figure className="receipt" aria-label="Example summary">
              <span className="ex">EXAMPLE</span>
              <h3>Tax year 2025/26</h3>
              <div className="sub">6 Apr 2025 – 5 Apr 2026</div>
              <table>
                <tbody>
                  <tr><td>Vinted · 47 sales</td><td>£1,286</td></tr>
                  <tr><td>eBay · 12 sales</td><td>£418</td></tr>
                  <tr><td>Depop · 6 sales</td><td>£142</td></tr>
                  <tr className="sep"><td>Bought to resell</td><td>£1,104</td></tr>
                  <tr><td>Personal clear-out</td><td>£742</td></tr>
                  <tr className="sep"><td>Vinted 2026 report</td><td className="flag">Yes · 30+ sales</td></tr>
                  <tr><td>eBay 2026 report</td><td>Not yet</td></tr>
                </tbody>
              </table>
            </figure>
          </div>
        </section>

        <section className="band">
          <div className="wrap">
            <div className="head">
              <span className="label">The problem</span>
              <h2>Two different years, four platforms, one deadline</h2>
            </div>
            <ul className="grid3">
              {PROBLEMS.map(([h, p]) => <li key={h}><h3>{h}</h3><p>{p}</p></li>)}
            </ul>
          </div>
        </section>

        <section className="plain" id="check">
          <div className="wrap">
            <div className="head">
              <span className="label">Free check</span>
              <h2>Will a platform report you for 2026?</h2>
              <p>Enter your sales so far this calendar year on each platform. Nothing leaves your browser.</p>
            </div>
            <ReportChecker />
          </div>
        </section>

        <section className="band" id="offer">
          <div className="wrap offer">
            <div className="ticket">
              <span className="label">Pricing</span>
              <div className="price">Free <small>up to 20 sales</small></div>
              <ul>
                <li>Import, sort and see your tax-year summary and platform reports, free</li>
                <li><strong>£19 once</strong> unlocks unlimited sales and your tax year record to save, print or give to an accountant</li>
                <li>Covers the 2025/26 and 2026/27 tax years</li>
                <li>Full refund within 14 days, no questions</li>
              </ul>
              <div className="actions"><a className="btn" href="/app/">Try it free</a><a className="btn ghost" href={PAY_URL} rel="noopener">Unlock for £19</a></div>
              <p className="fine">Your 2025/26 record is what you need for the 31 January 2027 Self Assessment deadline.</p>
            </div>
            <div className="head" style={{ margin: 0 }}>
              <h2>What it does</h2>
              <p>One place for all your selling platforms, sorted by UK tax year.</p>
              <dl className="platforms">
                <div><dt>Etsy</dt><dd>Import the orders file from Shop Manager</dd></div>
                <div><dt>eBay</dt><dd>Import the orders report from Seller Hub</dd></div>
                <div><dt>Depop</dt><dd>Import the sales file from Selling Hub</dd></div>
                <div><dt>Vinted</dt><dd>Copy your Vinted payment history and paste it in. Exact dates, sales only</dd></div>
              </dl>
              <p>Then mark each sale as bought-to-resell or personal, add what you paid, and get a tax year record for your Self Assessment or your accountant.</p>
            </div>
          </div>
        </section>

        <section className="plain" id="vs-ai">
          <div className="wrap">
            <div className="head">
              <span className="label">Why not just ask an AI chat?</span>
              <h2>Your buyers' details stay private, and the rules are built in</h2>
              <p>AI chats are handy, but your sales files contain your buyers' names and addresses, and a chat works the rules out from scratch every time.</p>
            </div>
            <div className="vs-wrap">
              <table className="vs">
                <thead><tr><th scope="col"></th><th scope="col">Asking an AI chat</th><th scope="col">Resale Records</th></tr></thead>
                <tbody>{VS.map(([a, b, c]) => <tr key={a}><th scope="row">{a}</th><td className="them">{b}</td><td className="us">{c}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="band">
          <div className="wrap">
            <div className="head"><span className="label">Questions</span><h2>Common questions</h2></div>
            <div className="faq">
              <details><summary>Does being reported mean I owe tax?</summary>
                <div><p>No. A platform report tells HMRC what you sold. Whether you owe anything depends on whether you were trading and your profit. GOV.UK has a <a href={GOV.additionalIncome} rel="noopener" target="_blank">checker for additional income</a>, and explains the <a href={GOV.reporting} rel="noopener" target="_blank">platform reporting rules</a>.</p></div></details>
              <details><summary>Why not just ask ChatGPT?</summary>
                <div><p>You can, but you'd be uploading your buyers' names and addresses to an AI company, and the answer depends on the chat getting the 6 April tax year and the reporting rules right each time. Resale Records keeps everything on your device, applies the same tested rules every time, and keeps your record all year.</p></div></details>
              <details><summary>Is this tax advice?</summary>
                <div><p>No. Resale Records organises your records and shows the published rules. It won't tell you whether you're trading or what you owe. If you're unsure, use HMRC's guidance or an accountant.</p></div></details>
              <details><summary>Do you connect to my accounts?</summary>
                <div><p>No. You download your own sales files from each platform and upload them. We never ask for your platform passwords.</p></div></details>
              <details><summary>What happens to my data?</summary>
                <div><p>Your sales stay in your own browser on your device. Nothing is uploaded to us. Read the <a href="/privacy.html">privacy notice</a>.</p></div></details>
              <details><summary>What do I get free, and what does £19 add?</summary>
                <div><p>Free: everything for up to 20 sales, including your tax-year summary, the platform report check and a preview of your tax year record. £19 once: unlimited sales, and your tax year record to save as a PDF, print or give to an accountant. After paying, we email your unlock code within one working day.</p></div></details>
            </div>
          </div>
        </section>

        <section className="plain" id="guides">
          <div className="wrap">
            <div className="head"><span className="label">Guides</span><h2>The rules, explained</h2></div>
            <ul className="grid3 guides">
              {GUIDES.map((g) => <li key={g.key}><h3><a href={g.path}>{g.h1}</a></h3><p>{g.blurb}</p></li>)}
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
