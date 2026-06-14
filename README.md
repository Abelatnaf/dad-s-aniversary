# 📇 Phone-Help

Turn **screenshots of names + phone numbers** into real contacts.

Feed it screenshots of a contact list, a chat app, or a typed/handwritten list.
It reads the text **on your device**, pairs each name with its number, lets you
fix anything in an editable table, and exports the result as:

- **vCard (`.vcf`)** — imports into iPhone, Android, Google, Outlook
- **CSV** — Google Contacts–compatible spreadsheet
- **Directly into Google Contacts** — one tap (after a one-time setup, below)

It's a single static web app — no server, no build step. OCR runs in your
browser (Tesseract.js as WebAssembly), so your images never leave your phone.

---

## Run it

You need to serve the folder over `http(s)` (the camera and Google sign-in don't
work from a `file://` page).

```bash
# from the project folder
python3 -m http.server 8000      # or:  npx serve
```

Then open <http://localhost:8000>.

**On your phone:** serve over your LAN and browse to your computer's IP, or use an
HTTPS tunnel (e.g. `ngrok http 8000`) and open the tunnel URL.

### How to use
1. **Choose images** or **Take photo** — add one or more screenshots.
2. **Scan** — text is read on-device with a progress bar.
3. **Review** — every detected name/number appears in an editable table. Tap any
   cell to fix it, uncheck rows you don't want, add rows manually. Status badges:
   `Valid` (international), `Local` (interpreted with your country), `Check`
   (couldn't validate — please look), `Dup` (duplicate number).
4. **Save** — download vCard / CSV, or push straight to Google Contacts.

---

## Configuration (`config.js`)

| Setting | What it does |
| --- | --- |
| `DEFAULT_COUNTRY` | Country (e.g. `US`, `ET`, `GB`) used to read **local** numbers written without a `+` code. Set this to your country. |
| `OCR_LANG` | Tesseract language(s), e.g. `eng` or `eng+amh`. |
| `PHONE_MIN_DIGITS` | Shortest digit run treated as a phone number (default `7`). |
| `GOOGLE_CLIENT_ID` | Needed **only** for the "Add to Google Contacts" button (see below). |

vCard and CSV work with **no configuration**.

---

## Optional: enable "Add to Google Contacts"

This pushes contacts into your Google account from the browser. One-time setup:

1. Go to <https://console.cloud.google.com> and **create a project**.
2. **APIs & Services → Library →** enable the **Google People API**.
3. **APIs & Services → OAuth consent screen:** choose **External**, fill in the
   app name + your email, add the scope
   `https://www.googleapis.com/auth/contacts`, and add your own Google account
   under **Test users** (keeps it in "Testing" mode — no Google review needed for
   personal use).
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID →
   Web application.** Under **Authorized JavaScript origins**, add every origin
   you'll open the app from, e.g. `http://localhost:8000` (and your HTTPS tunnel /
   deployed URL). *No redirect URI is required.*
5. Copy the generated **Client ID** into `config.js` → `GOOGLE_CLIENT_ID`.

Notes:
- No client secret is used or stored anywhere — this is a browser-only flow.
- The access token lasts ~1 hour with no refresh token, which is fine because the
  push happens right after you consent.

---

## Tests

Pure logic (parsing + export) has unit tests that run with **zero install**:

```bash
npm test        # or: node parse.test.js && node export.test.js
```

---

## How it works

| File | Responsibility |
| --- | --- |
| `index.html` | App shell + the four screens (Upload → Processing → Review → Export) |
| `styles.css` | Mobile-first, dark-mode-aware styling |
| `config.js` | Your settings (country, OCR language, Google Client ID) |
| `ocr.js` | Tesseract.js wrapper: image → text, with progress |
| `parse.js` | OCR text → `{name, phone}` pairs; pairing heuristic, E.164 normalization, dedupe |
| `export.js` | vCard 3.0 + Google-compatible CSV generators + download |
| `google.js` | Google Identity Services token + People API `batchCreateContacts` |
| `app.js` | State, screen routing, the editable review table |

The pairing heuristic reads OCR output line by line, detects phone-shaped
substrings, and associates each with a name from the same line or the nearest
name-like neighbouring line. Numbers are normalized with
[libphonenumber-js](https://github.com/catamphetamine/libphonenumber-js) (with a
dependency-free fallback used by the tests). Anything questionable is surfaced in
the review table rather than silently dropped.

---

## Not included (yet)

Merging with existing Google contacts, emails/addresses/photos on contacts,
non-Latin OCR out of the box, and persistent login.
