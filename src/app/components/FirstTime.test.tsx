import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import FirstTime from './FirstTime';

const text = (html: string) => html.replace(/<[^>]+>/g, '').replace(/&#x27;|&#39;/g, "'");

describe('First time panel', () => {
  it('shows the GOV.UK statement that matches the takings', () => {
    expect(text(renderToString(<FirstTime taxYear="2025/26" takings={1200} unsortedCount={0} />))).toContain('anyone with gross trading income over £1,000');
    expect(text(renderToString(<FirstTime taxYear="2025/26" takings={400} unsortedCount={0} />))).toContain('£1,000 or less you may not have to tell HMRC');
  });
  it('with the free limit full, shows neither branch and says the figure is partial', () => {
    const t = text(renderToString(<FirstTime taxYear="2025/26" takings={400} unsortedCount={0} capped />));
    expect(t).not.toContain('£1,000 or less');
    expect(t).toContain('only counts your first 20 sales');
  });
});
