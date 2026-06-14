// ----------------------------------------------------------------------------
// parse.js — Turn raw OCR text into structured { name, phone } contacts.
//
// Pure logic, no DOM. Works in the browser (uses the global `libphonenumber`
// from the CDN bundle when present) and in Node for tests (falls back to a
// dependency-free normalizer so `node parse.test.js` runs with zero install).
// ----------------------------------------------------------------------------

// Words that label a number/section but are not a person's name.
const LABELS = new Set([
  'mobile', 'cell', 'home', 'work', 'office', 'main', 'other', 'tel', 'phone',
  'telephone', 'call', 'message', 'sms', 'fax', 'iphone', 'android', 'whatsapp',
  'favorites', 'favourites', 'recents', 'recent', 'contacts', 'contact', 'info',
  'details', 'number', 'no', 'ph',
]);

// Minimal calling-code table for the dependency-free fallback path only.
// When libphonenumber-js is loaded (browser), it is used instead of this.
const COUNTRY_CALLING_CODES = {
  US: '1', CA: '1', GB: '44', IE: '353', FR: '33', DE: '49', ES: '34',
  IT: '39', NL: '31', ET: '251', KE: '254', NG: '234', GH: '233', ZA: '27',
  EG: '20', IN: '91', PK: '92', BD: '880', CN: '86', JP: '81', AU: '61',
  BR: '55', MX: '52', AE: '971', SA: '966',
};

function getPhoneLib() {
  if (typeof window !== 'undefined' && window.libphonenumber) return window.libphonenumber;
  if (typeof require !== 'undefined') {
    try { return require('libphonenumber-js'); } catch (e) { /* not installed */ }
  }
  return null;
}

function onlyDigits(s) {
  return (s || '').replace(/[^\d]/g, '');
}

// Normalize a raw phone string to E.164. Returns { e164, national, valid, intl }.
function normalizePhone(raw, country) {
  const hasPlus = /\+/.test(raw);
  const lib = getPhoneLib();
  if (lib && typeof lib.parsePhoneNumberFromString === 'function') {
    try {
      const p = lib.parsePhoneNumberFromString(raw, hasPlus ? undefined : country);
      if (p && p.isValid()) {
        return { e164: p.number, national: p.formatNational(), valid: true, intl: hasPlus };
      }
    } catch (e) { /* fall through to fallback */ }
  }
  return fallbackNormalize(raw, country, hasPlus);
}

function fallbackNormalize(raw, country, hasPlus) {
  const digits = onlyDigits(raw);
  if (hasPlus) {
    const valid = digits.length >= 8 && digits.length <= 15;
    return { e164: valid ? '+' + digits : '', national: digits, valid, intl: true };
  }
  const nsn = digits.replace(/^0+/, ''); // strip trunk-prefix zero(s)
  const code = COUNTRY_CALLING_CODES[(country || '').toUpperCase()];
  if (code) {
    const full = code + nsn;
    const valid = nsn.length >= 6 && full.length >= 8 && full.length <= 15;
    return { e164: valid ? '+' + full : '', national: digits, valid, intl: false };
  }
  const valid = nsn.length >= 7 && nsn.length <= 15;
  return { e164: valid ? '+' + nsn : '', national: digits, valid, intl: false };
}

// Find phone-number-shaped substrings in a single line.
function findPhoneMatches(line, minDigits) {
  const re = /\+?\d[\d\s().\-]{5,}\d/g;
  const out = [];
  let m;
  while ((m = re.exec(line)) !== null) {
    if (onlyDigits(m[0]).length >= minDigits) out.push(m[0]);
  }
  return out;
}

function isMostlyDigits(line) {
  const compact = (line || '').replace(/\s/g, '');
  if (!compact) return false;
  const digits = onlyDigits(compact).length;
  return digits / compact.length > 0.6 && digits >= 4;
}

function isPureLabel(line) {
  const tokens = (line || '').toLowerCase().split(/[^a-z]+/).filter(Boolean);
  return tokens.length > 0 && tokens.every((t) => LABELS.has(t));
}

// Is this line plausibly a person's name?
function isNameLike(line) {
  const letters = (line.match(/[A-Za-zÀ-ɏ]/g) || []).length;
  const digits = (line.match(/\d/g) || []).length;
  const words = (line || '').split(/\s+/).filter((w) => /[A-Za-z]{2,}/.test(w));
  return letters >= 2 && letters >= digits && words.length >= 1 && !isPureLabel(line);
}

// Strip label words / phone digits / stray punctuation from a name candidate.
function cleanName(line) {
  const tokens = (line || '')
    .split(/\s+/)
    .map((t) => t.replace(/^[^A-Za-zÀ-ɏ]+|[^A-Za-zÀ-ɏ.'’-]+$/g, ''))
    .filter((t) => t && !LABELS.has(t.toLowerCase()) && !/^\d+$/.test(t));
  return tokens.join(' ').replace(/\s+/g, ' ').trim();
}

// Scan outward from index `i` for the nearest name-like line.
function findNearbyName(lines, i, usedAsName) {
  for (let j = i - 1; j >= 0; j--) {
    if (usedAsName.has(j)) continue;
    if (findPhoneMatches(lines[j], 7).length) continue;
    if (isNameLike(lines[j])) { usedAsName.add(j); return cleanName(lines[j]); }
  }
  for (let j = i + 1; j < lines.length; j++) {
    if (usedAsName.has(j)) continue;
    if (findPhoneMatches(lines[j], 7).length) continue;
    if (isNameLike(lines[j])) { usedAsName.add(j); return cleanName(lines[j]); }
  }
  return '';
}

function statusFor(norm) {
  if (!norm.valid) return 'Check';
  return norm.intl ? 'Valid' : 'Local';
}

// Extract contacts from a single image's OCR text.
function extractContacts(text, options) {
  const opts = options || {};
  const country = opts.country || (typeof CONFIG !== 'undefined' ? CONFIG.DEFAULT_COUNTRY : 'US');
  const minDigits = opts.minDigits || (typeof CONFIG !== 'undefined' ? CONFIG.PHONE_MIN_DIGITS : 7);
  const source = opts.source || '';

  const lines = (text || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const results = [];
  const usedAsName = new Set();
  const consumed = new Set();

  for (let i = 0; i < lines.length; i++) {
    if (consumed.has(i)) continue;
    const matches = findPhoneMatches(lines[i], minDigits);
    if (!matches.length) continue;

    // Name from the remainder of the SAME line (e.g. "John Doe 0911 22 33 44").
    let remainder = lines[i];
    matches.forEach((mtch) => { remainder = remainder.replace(mtch, ' '); });
    const sameLineName = isNameLike(remainder) ? cleanName(remainder) : '';

    matches.forEach((rawNumber) => {
      let norm = normalizePhone(rawNumber, country);

      // Number wrapped onto the next line: join digit runs and re-validate.
      if (!norm.valid && i + 1 < lines.length && !consumed.has(i + 1)
          && isMostlyDigits(lines[i + 1]) && !findPhoneMatches(lines[i + 1], minDigits).length) {
        const joined = normalizePhone(rawNumber + lines[i + 1], country);
        if (joined.valid) { norm = joined; consumed.add(i + 1); }
      }

      const name = sameLineName || findNearbyName(lines, i, usedAsName);
      results.push({
        name,
        rawNumber: rawNumber.trim(),
        e164: norm.e164,
        national: norm.national,
        status: statusFor(norm),
        source,
        include: norm.valid, // valid rows default checked; questionable ones opt-in
      });
    });
  }
  return results;
}

// Remove duplicate numbers across all collected contacts (first wins).
function dedupe(contacts) {
  const seen = new Map();
  const out = [];
  for (const c of contacts) {
    const key = c.e164 || onlyDigits(c.rawNumber);
    if (!key) { out.push(c); continue; }
    if (seen.has(key)) {
      const first = seen.get(key);
      if (!first.name && c.name) first.name = c.name; // keep whichever has a name
      out.push(Object.assign({}, c, { status: 'Dup', include: false }));
    } else {
      seen.set(key, c);
      out.push(c);
    }
  }
  return out;
}

// Convenience: extract from many images at once, then dedupe.
function extractAll(texts, options) {
  let all = [];
  (texts || []).forEach((t, idx) => {
    const source = (t && t.source) || `image ${idx + 1}`;
    const text = typeof t === 'string' ? t : t.text;
    all = all.concat(extractContacts(text, Object.assign({}, options, { source })));
  });
  return dedupe(all);
}

// Split a display name into given/family for vCard & CSV.
function splitName(full) {
  const parts = (full || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { given: '', family: '' };
  if (parts.length === 1) return { given: parts[0], family: '' };
  return { given: parts[0], family: parts.slice(1).join(' ') };
}

const ParseAPI = {
  normalizePhone, extractContacts, extractAll, dedupe, splitName,
  // exported for testing
  isNameLike, cleanName, findPhoneMatches, isPureLabel,
};

if (typeof module !== 'undefined' && module.exports) module.exports = ParseAPI;
if (typeof window !== 'undefined') window.Parse = ParseAPI;
