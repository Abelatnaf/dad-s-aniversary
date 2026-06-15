// Run with: node export.test.js  (no dependencies required)
const E = require('./www/export.js');

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.error(`✗ ${msg}`); } }
function eq(a, e, msg) { ok(JSON.stringify(a) === JSON.stringify(e), `${msg}\n    expected ${JSON.stringify(e)}\n    got      ${JSON.stringify(a)}`); }

const contacts = [
  { name: 'John Smith', rawNumber: '+1 415 555 0132', e164: '+14155550132', include: true },
  { name: 'Doe, Jr', rawNumber: '+1 212 555 0188', e164: '+12125550188', include: true },
  { name: 'Skip Me', rawNumber: '+1 303 555 0150', e164: '+13035550150', include: false },
];

// vCard
const vcf = E.toVCard(contacts);
ok(vcf.includes('BEGIN:VCARD'), 'vcard: has BEGIN');
ok(vcf.includes('VERSION:3.0'), 'vcard: version 3.0');
ok(vcf.includes('N:Smith;John;;;'), 'vcard: N split given/family');
ok(vcf.includes('FN:John Smith'), 'vcard: FN');
ok(vcf.includes('TEL;TYPE=CELL:+14155550132'), 'vcard: TEL e164');
ok(vcf.includes('FN:Doe\\, Jr'), 'vcard: comma escaped in FN');
ok(!vcf.includes('Skip Me'), 'vcard: excluded contact omitted');
ok((vcf.match(/BEGIN:VCARD/g) || []).length === 2, 'vcard: exactly 2 cards');
ok(vcf.includes('\r\n'), 'vcard: CRLF line endings');

// CSV
const csv = E.toCsv(contacts);
const lines = csv.trim().split('\r\n');
eq(lines[0], 'Name,Given Name,Family Name,Phone 1 - Type,Phone 1 - Value', 'csv: exact header');
ok(lines[1] === 'John Smith,John,Smith,Mobile,+14155550132', 'csv: first data row');
ok(lines[2] === '"Doe, Jr","Doe,",Jr,Mobile,+12125550188', 'csv: comma fields quoted');
ok(lines.length === 3, 'csv: header + 2 included rows');

// selectable
eq(E.selectable(contacts).length, 2, 'selectable: only included');

console.log(`\nexport.test.js: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
