// Generates unlock codes to email to paying customers.
// Run: npm run make-code [-- count]
import crypto from 'node:crypto';
import { makeCode, isValidCode } from '../src/core.ts';

const n = Number(process.argv[2] || 1);
for (let i = 0; i < n; i++) {
  const code = makeCode(() => crypto.randomInt(0, 1e9) / 1e9);
  if (!isValidCode(code)) throw new Error('generated an invalid code');
  console.log(code);
}
