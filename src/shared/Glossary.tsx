import { useId, useState, type ReactNode } from 'react';

// Plain-English definitions for the words first-time filers don't know (docs/research/first-timers.md).
// Shown by a "What's this?" button rather than a hover tooltip, so they work on phones.
export const GLOSSARY = {
  'Self Assessment': 'HMRC’s system for income that isn’t taxed automatically, such as income from self-employment. You report it on a tax return once a year.',
  UTR: 'Unique Taxpayer Reference: the number HMRC gives you when you register for Self Assessment. You need it to file your return.',
  'Government Gateway': 'A user ID and password for signing in to HMRC’s online services, including filing your tax return. GOV.UK shows the sign-in options when you start.',
  'tax year': 'The UK tax year runs from 6 April to 5 April. The 2025/26 tax year is 6 April 2025 to 5 April 2026.',
  'trading allowance': '£1,000 of gross trading income each tax year. You can deduct it instead of your actual costs, not as well as them.',
  trading: 'GOV.UK says selling regularly to make a profit, or making items to sell for profit, are signs of trading. Occasionally selling your own things is treated differently: HMRC’s checker can help.',
} as const;
export type GlossaryTerm = keyof typeof GLOSSARY;

/** A term with a "What's this?" toggle that reveals its definition inline. `children` overrides the visible text. */
export function Term({ term, children }: { term: GlossaryTerm; children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <>
      {children ?? term}{' '}
      <button type="button" className="term-toggle" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        {open ? 'Hide' : 'What’s this?'}
      </button>
      <span id={id} className="term-def" hidden={!open}> ({GLOSSARY[term].replace(/\.$/, '')})</span>
    </>
  );
}
