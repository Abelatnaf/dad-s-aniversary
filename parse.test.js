// Run with: node parse.test.js
// No dependencies required — exercises the built-in fallback normalizer.
const P = require('./www/parse.js');

let pass = 0, fail = 0;
function eq(actual, expected, msg) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a === e) { pass++; }
  else { fail++; console.error(`✗ ${msg}\n    expected ${e}\n    got      ${a}`); }
}
function ok(cond, msg) { if (cond) pass++; else { fail++; console.error(`✗ ${msg}`); } }

// 1. Name on the line above the number.
let r = P.extractContacts('John Smith\n+1 415 555 0132', { country: 'US' });
eq(r.length, 1, 'name-above: one contact');
eq(r[0].name, 'John Smith', 'name-above: name');
eq(r[0].e164, '+14155550132', 'name-above: e164');
eq(r[0].status, 'Valid', 'name-above: status Valid (intl)');

// 2. Name and number on the SAME line, local US number.
r = P.extractContacts('Jane Doe 415-555-0199', { country: 'US' });
eq(r.length, 1, 'same-line: one contact');
eq(r[0].name, 'Jane Doe', 'same-line: name');
eq(r[0].e164, '+14155550199', 'same-line: e164');
eq(r[0].status, 'Local', 'same-line: status Local');

// 3. Local number needing DEFAULT_COUNTRY (Ethiopia, trunk-zero stripped).
r = P.extractContacts('Abebe Kebede\n0911 22 33 44', { country: 'ET' });
eq(r[0].e164, '+251911223344', 'local-ET: e164');
eq(r[0].status, 'Local', 'local-ET: status');

// 4. Number wrapped across two lines.
r = P.extractContacts('Sara\n+1 415 555\n0123', { country: 'US' });
eq(r.length, 1, 'split-line: one contact');
eq(r[0].name, 'Sara', 'split-line: name');
eq(r[0].e164, '+14155550123', 'split-line: joined e164');

// 5. OCR noise / label lines are skipped for the name.
r = P.extractContacts('Mobile\nFavorites\nTom Hardy\n+1 212 555 0188', { country: 'US' });
eq(r.length, 1, 'noise: one contact');
eq(r[0].name, 'Tom Hardy', 'noise: name picked past labels');

// 6. Duplicate number across entries is flagged, not dropped.
r = P.extractAll([
  { text: 'Bob\n+1 303 555 0150', source: 'a' },
  { text: 'Bob B\n+1 303 555 0150', source: 'b' },
], { country: 'US' });
eq(r.length, 2, 'dup: both kept');
eq(r[1].status, 'Dup', 'dup: second flagged');
eq(r[1].include, false, 'dup: second unchecked');

// 7. Too-short junk numbers produce no contact.
r = P.extractContacts('Call 12345', { country: 'US' });
eq(r.length, 0, 'junk: short number ignored');

// 8. splitName for multi-word names.
eq(P.splitName('John Ronald Tolkien'), { given: 'John', family: 'Ronald Tolkien' }, 'splitName: multi-word');
eq(P.splitName('Cher'), { given: 'Cher', family: '' }, 'splitName: single token');

// 9. fromPairs: AI {name, phone} pairs -> normalized, deduped contacts.
r = P.fromPairs([
  { name: 'Maria Garcia', phone: '+1 415 555 0132' },
  { name: 'Local Bob', phone: '415-555-0199' },
  { name: 'Dupe Maria', phone: '+14155550132' },
], { country: 'US' });
eq(r.length, 3, 'fromPairs: keeps all rows');
eq(r[0].e164, '+14155550132', 'fromPairs: international normalized');
eq(r[1].e164, '+14155550199', 'fromPairs: local normalized via country');
eq(r[2].status, 'Dup', 'fromPairs: duplicate flagged');
eq(r[2].include, false, 'fromPairs: duplicate unchecked');

// 10. Helper predicates.
ok(P.isNameLike('Maria Garcia'), 'isNameLike: real name');
ok(!P.isNameLike('+1 415 555 0132'), 'isNameLike: phone is not a name');
ok(P.isPureLabel('Mobile'), 'isPureLabel: label');
ok(!P.isPureLabel('Mike'), 'isPureLabel: name is not a label');
eq(P.cleanName('Mobile: Kofi Annan'), 'Kofi Annan', 'cleanName: strips label + punctuation');

console.log(`\nparse.test.js: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
