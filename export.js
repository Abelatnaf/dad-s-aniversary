// ----------------------------------------------------------------------------
// export.js — Generate vCard (.vcf) and Google-compatible CSV, and trigger
// browser downloads. Pure string builders (testable in Node).
// ----------------------------------------------------------------------------

function getSplitName() {
  if (typeof window !== 'undefined' && window.Parse) return window.Parse.splitName;
  if (typeof require !== 'undefined') {
    try { return require('./parse.js').splitName; } catch (e) { /* noop */ }
  }
  return (full) => {
    const p = (full || '').trim().split(/\s+/).filter(Boolean);
    if (!p.length) return { given: '', family: '' };
    if (p.length === 1) return { given: p[0], family: '' };
    return { given: p[0], family: p.slice(1).join(' ') };
  };
}

// Only keep contacts the user opted to include and that have a number.
function selectable(contacts) {
  return (contacts || []).filter((c) => c.include && (c.e164 || c.rawNumber));
}

function phoneValue(c) {
  return c.e164 || c.rawNumber;
}

// --- vCard 3.0 -------------------------------------------------------------
function vcardEscape(s) {
  return String(s == null ? '' : s)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function toVCard(contacts) {
  const splitName = getSplitName();
  const cards = selectable(contacts).map((c) => {
    const { given, family } = splitName(c.name);
    const fn = c.name && c.name.trim() ? c.name.trim() : phoneValue(c);
    return [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${vcardEscape(family)};${vcardEscape(given)};;;`,
      `FN:${vcardEscape(fn)}`,
      `TEL;TYPE=CELL:${vcardEscape(phoneValue(c))}`,
      'END:VCARD',
    ].join('\r\n');
  });
  return cards.join('\r\n') + (cards.length ? '\r\n' : '');
}

// --- CSV (Google Contacts compatible) --------------------------------------
function csvField(s) {
  const v = String(s == null ? '' : s);
  return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
}

function toCsv(contacts) {
  const splitName = getSplitName();
  const header = ['Name', 'Given Name', 'Family Name', 'Phone 1 - Type', 'Phone 1 - Value'];
  const rows = selectable(contacts).map((c) => {
    const { given, family } = splitName(c.name);
    return [c.name || phoneValue(c), given, family, 'Mobile', phoneValue(c)].map(csvField).join(',');
  });
  return [header.join(','), ...rows].join('\r\n') + '\r\n';
}

// --- Download helper (browser only) ----------------------------------------
function download(filename, mime, text) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadVCard(contacts) {
  download('contacts.vcf', 'text/vcard;charset=utf-8', toVCard(contacts));
}

function downloadCsv(contacts) {
  download('contacts.csv', 'text/csv;charset=utf-8', toCsv(contacts));
}

const ExportAPI = { toVCard, toCsv, selectable, download, downloadVCard, downloadCsv };

if (typeof module !== 'undefined' && module.exports) module.exports = ExportAPI;
if (typeof window !== 'undefined') window.Exporter = ExportAPI;
