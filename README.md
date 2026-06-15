# 📇 Phone-Help

An **Android app** that reads **screenshots of names + phone numbers** with
**Google Gemini** and saves the contacts **straight to your phone**.

1. Open the app, add screenshots (contact list, chat, a typed/handwritten list).
2. Google Gemini reads each image and pulls out the name + number pairs.
3. You review and fix anything in an editable table.
4. Tap **Save to phone** — the contacts are written directly to your device
   (with your permission). No manual import, no copy-paste.

It's built with [Capacitor](https://capacitorjs.com), so the same code is a plain
web app *and* a native Android app. In a browser it falls back to downloading a
vCard; installed as the app, it writes contacts directly via the device's
contacts store.

---

## What you need

- **Node.js 18+** and **npm**
- **Android Studio** (gives you the Android SDK + a way to build/run the app)
- A free **Google Gemini API key** → <https://aistudio.google.com/apikey>

---

## 1. Add your Gemini key

Edit `www/config.js`:

```js
GEMINI_API_KEY: 'paste-your-key-here',
GEMINI_MODEL:   'gemini-2.0-flash',   // free-tier vision model
DEFAULT_COUNTRY:'US',                 // your country, e.g. 'ET', 'GB', 'NG'
```

`DEFAULT_COUNTRY` is how local numbers written without a `+code` get turned into
full international numbers.

> The key is bundled inside the app. That's fine for personal use; if you share
> the APK, restrict the key in Google AI Studio or revoke it afterwards.

## 2. Build the Android app

```bash
npm install                 # install Capacitor + the contacts plugin
npx cap add android         # generate the native android/ project (one time)
npx cap sync                # copy www/ + plugins into the native project
npx cap open android        # opens Android Studio
```

In Android Studio press **Run ▶** with your phone connected (USB debugging on),
or **Build → Build APK** to get an installable `.apk`.

### One-time permission setup
The contacts plugin needs read/write permission. After `npx cap add android`,
open `android/app/src/main/AndroidManifest.xml` and add these inside `<manifest>`:

```xml
<uses-permission android:name="android.permission.READ_CONTACTS" />
<uses-permission android:name="android.permission.WRITE_CONTACTS" />
```

The app also asks for permission at runtime the first time you tap **Save to
phone**.

### After any code change
```bash
npx cap sync        # re-copy www/ into the native project, then rebuild in Studio
```

---

## Try it as a web app first (no Android needed)

```bash
npm run serve       # serves www/ at http://localhost:8000
```

Open <http://localhost:8000>, add a screenshot, and confirm Gemini extraction +
the review table work. In the browser, **Save to phone** downloads a vCard you
can import; the *direct* save only happens in the installed Android app.

---

## How it works

| File | Responsibility |
| --- | --- |
| `www/index.html` | App shell + the four screens (Upload → Processing → Review → Export) |
| `www/styles.css` | Mobile-first, dark-mode-aware styling |
| `www/config.js` | Your settings (Gemini key, model, country) |
| `www/ai.js` | Sends each image to Google Gemini, returns `{name, phone}` pairs |
| `www/parse.js` | Normalizes numbers to E.164 (libphonenumber-js), dedupes, splits names |
| `www/contacts.js` | Writes contacts to the device (Capacitor contacts plugin); vCard fallback |
| `www/export.js` | vCard 3.0 + CSV generators (fallback / "Other formats") |
| `www/app.js` | State, screen routing, the editable review table |
| `capacitor.config.json` | Capacitor app id / name / `webDir: www` |

---

## Tests

The pure logic (number normalization, dedupe, vCard/CSV) has unit tests that run
with **zero install**:

```bash
npm test        # node parse.test.js && node export.test.js
```

---

## Notes & limits

- A web page (browser) can't write phone contacts directly — that's why the
  direct save lives in the installed app. The browser build downloads a vCard.
- Gemini runs in the cloud, so reading screenshots needs an internet connection.
- iOS is possible later with the same code (`npx cap add ios`) but needs a Mac +
  Xcode; only Android is set up here.

## Not included (yet)

Merging/updating existing contacts, emails/addresses/photos on contacts, and iOS
build config.
