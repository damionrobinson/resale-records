import { COMPANY, COMPANY_NUMBER, CONTACT, GOV, REGISTERED_OFFICE } from '../shared/site';
import { DocPage } from './Layout';

export default function Privacy() {
  const mail = <a href={`mailto:${CONTACT}`}>{CONTACT}</a>;
  return (
    <DocPage>
      <h1>Privacy notice</h1>
      <p className="updated">Last updated 26 October 2026.</p>

      <h2>Who we are</h2>
      <p>Resale Records is a trading name of {COMPANY}, registered in England and Wales, company number {COMPANY_NUMBER}, registered office {REGISTERED_OFFICE}. We are the data controller. Contact us at {mail}.</p>

      <h2>What we collect and why</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Information</th><th>Why</th><th>Legal basis</th></tr></thead>
          <tbody>
            <tr><td>Your name, email address and country when you pay for an unlock (collected by PayPal)</td><td>To email your unlock code, help with your order, and refund you</td><td>Contract</td></tr>
            <tr><td>Payment records (amount, date, refunds)</td><td>To keep the company's accounts</td><td>Legal obligation</td></tr>
            <tr><td>Anything you send us by email</td><td>To reply to you</td><td>Legitimate interests (answering your question)</td></tr>
          </tbody>
        </table>
      </div>
      <p>The app and the "Will I be reported?" check run entirely in your browser. Sales files you open, and the records you build, are stored only in your browser on your device (local storage). They are never sent to us, and we can't see them. Clearing your browser data deletes them, so use "Back up data" to keep a copy.</p>
      <p>We don't see or store your card or bank details; PayPal handles them. We don't sell your information or use it for advertising.</p>

      <h2>Who we share it with</h2>
      <ul>
        <li><strong>PayPal</strong>, to take payments and process refunds. PayPal may process data outside the UK under its own safeguards. See <a href={GOV.paypalPrivacy} rel="noopener" target="_blank">PayPal's privacy statement</a>.</li>
        <li>Our website host, which handles the technical data any website receives (such as your IP address) to serve the page.</li>
        <li>Google Fonts, which supplies the page's typefaces and so receives your IP address when the page loads. It sets no cookies.</li>
        <li>Our accountant and HMRC, where needed for the company's accounts and tax.</li>
      </ul>

      <h2>How long we keep it</h2>
      <p>If you get a refund and don't use the product, we delete your name and email within 90 days, apart from the payment record. Payment records are kept for six years for tax purposes.</p>

      <h2>Cookies</h2>
      <p>This site sets no cookies and uses no analytics or tracking. If that changes, we'll update this notice and ask for consent where the law requires it.</p>

      <h2>Your rights</h2>
      <p>You can ask to see, correct or delete your information, object to how we use it, or ask us to restrict it. Email {mail} and we'll reply within one month.</p>
      <p>If you're unhappy with how we've handled your information, you can complain to the Information Commissioner's Office at <a href={GOV.icoComplaint} rel="noopener" target="_blank">ico.org.uk</a>.</p>
    </DocPage>
  );
}
