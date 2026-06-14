// ----------------------------------------------------------------------------
// google.js — Push contacts straight into Google Contacts from the browser.
//
// Uses Google Identity Services (GIS) token client to get an OAuth access
// token (no backend, no client secret), then calls the People API
// `people:batchCreateContacts`. Requires CONFIG.GOOGLE_CLIENT_ID (see README).
// ----------------------------------------------------------------------------

const GoogleContacts = (() => {
  const SCOPE = 'https://www.googleapis.com/auth/contacts';
  const ENDPOINT = 'https://people.googleapis.com/v1/people:batchCreateContacts';
  const CHUNK = 200; // People API batch limit
  let tokenClient = null;

  function isConfigured() {
    return typeof CONFIG !== 'undefined' && !!CONFIG.GOOGLE_CLIENT_ID;
  }

  function ensureClient() {
    if (tokenClient) return tokenClient;
    if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
      throw new Error('Google Identity Services not loaded.');
    }
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CONFIG.GOOGLE_CLIENT_ID,
      scope: SCOPE,
      callback: () => {}, // set per-request below
    });
    return tokenClient;
  }

  // Must be called from a user gesture (button tap). Resolves with a token.
  function requestAccessToken() {
    return new Promise((resolve, reject) => {
      let client;
      try { client = ensureClient(); } catch (e) { return reject(e); }
      client.callback = (resp) => {
        if (resp && resp.error) return reject(new Error(resp.error));
        resolve(resp.access_token);
      };
      try { client.requestAccessToken({ prompt: '' }); } catch (e) { reject(e); }
    });
  }

  function toPerson(contact) {
    const splitName = window.Parse.splitName;
    const { given, family } = splitName(contact.name);
    const person = { phoneNumbers: [{ value: contact.e164 || contact.rawNumber, type: 'mobile' }] };
    if (contact.name && contact.name.trim()) {
      person.names = [{ givenName: given, familyName: family }];
    }
    return { contactPerson: person };
  }

  async function pushChunk(contacts, token) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ contacts: contacts.map(toPerson), readMask: 'names,phoneNumbers' }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`People API ${res.status}: ${detail}`);
    }
    const data = await res.json();
    return (data.createdPeople || []).length;
  }

  // Push selected contacts. Returns { created, total }.
  async function pushContacts(contacts) {
    const selected = window.Exporter.selectable(contacts);
    if (!selected.length) return { created: 0, total: 0 };
    const token = await requestAccessToken();
    let created = 0;
    for (let i = 0; i < selected.length; i += CHUNK) {
      created += await pushChunk(selected.slice(i, i + CHUNK), token);
    }
    return { created, total: selected.length };
  }

  return { isConfigured, pushContacts };
})();

if (typeof window !== 'undefined') window.GoogleContacts = GoogleContacts;
