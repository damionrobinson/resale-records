import { CONTACT } from '../shared/site';
import { DocPage } from './Layout';

export default function Thanks() {
  return (
    <DocPage>
      <h1>Thanks, you're in.</h1>
      <p>Your £19 payment for Resale Records went through. PayPal has emailed you a receipt.</p>
      <ol>
        <li>We'll email your unlock code to your PayPal email address within one working day.</li>
        <li>Open the app, click <strong>Unlock all</strong> and enter the code. Anything you've already added stays where it is.</li>
        <li>Questions or a refund: <a href={`mailto:${CONTACT}`}>{CONTACT}</a></li>
      </ol>
      <p><a className="btn" href="/app/">Open the app →</a></p>
    </DocPage>
  );
}
