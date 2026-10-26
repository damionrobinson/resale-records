import { SITE_URL } from '../shared/site';

export type Faq = { q: string; a: string };

/** What a search engine or link preview sees for a page. Written into its <head> at build time. */
export type PageHead = {
  title: string;
  description: string;
  path: string; // e.g. '/' or '/hmrc-30-sales-rule.html'
  type: 'website' | 'article';
  faqs?: Faq[]; // shown on the page too; the structured data must match what readers see
};

const attr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function renderHead(h: PageHead): string {
  const url = SITE_URL + h.path;
  const tags = [
    `<title>${attr(h.title)}</title>`,
    `<meta name="description" content="${attr(h.description)}">`,
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:type" content="${h.type}">`,
    `<meta property="og:site_name" content="Resale Records">`,
    `<meta property="og:locale" content="en_GB">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:title" content="${attr(h.title)}">`,
    `<meta property="og:description" content="${attr(h.description)}">`,
  ];
  if (h.faqs?.length) {
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: h.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    };
    // "<" escaped so text in an answer can never close the script tag.
    tags.push(`<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`);
  }
  return tags.join('\n');
}
