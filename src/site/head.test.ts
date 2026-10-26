import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PAGES } from '../pages';
import { SITE_URL } from '../shared/site';
import { GUIDES } from './guides';
import { renderHead } from './head';

const heads = Object.values(PAGES).flatMap((p) => (p.head ? [p.head] : []));

describe('page metadata', () => {
  it('titles fit in search results and are unique', () => {
    for (const h of heads) expect(h.title.length, h.title).toBeLessThan(60);
    for (const h of heads) expect(h.description.length, h.description).toBeLessThan(155);
    expect(new Set(heads.map((h) => h.title)).size).toBe(heads.length);
    expect(new Set(heads.map((h) => h.description)).size).toBe(heads.length);
  });
  it('writes canonical, Open Graph and FAQ structured data that matches the page', () => {
    for (const g of GUIDES) {
      const html = renderHead(g);
      expect(html).toContain(`<link rel="canonical" href="${SITE_URL}${g.path}">`);
      expect(html).toContain(`<meta property="og:url" content="${SITE_URL}${g.path}">`);
      expect(g.faqs!.length).toBeGreaterThanOrEqual(3);
      const ld = JSON.parse(html.match(/<script type="application\/ld\+json">(.*)<\/script>/)![1]);
      expect(ld['@type']).toBe('FAQPage');
      expect(ld.mainEntity.map((q: { name: string }) => q.name)).toEqual(g.faqs!.map((f) => f.q));
    }
  });
  it('escapes quotes and angle brackets', () => {
    const html = renderHead({ path: '/', type: 'website', title: 'A "b" <c>', description: 'd & e', faqs: [{ q: 'q', a: '</script>' }] });
    expect(html).toContain('<title>A &quot;b&quot; &lt;c&gt;</title>');
    expect(html).toContain('content="d &amp; e"');
    expect(html).not.toContain('</script><');
  });
  it('the sitemap lists every indexable page', () => {
    const sitemap = readFileSync(join(__dirname, '../../public/sitemap.xml'), 'utf8');
    for (const h of heads) expect(sitemap).toContain(`<loc>${SITE_URL}${h.path}</loc>`);
    expect(sitemap).not.toContain('/thanks.html');
    expect(sitemap).not.toContain('/app/');
  });
});
