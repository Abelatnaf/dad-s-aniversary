// ----------------------------------------------------------------------------
// contacts.js — Save contacts directly to the phone.
//
// In the native Android app (Capacitor), uses @capacitor-community/contacts to
// write contacts straight to the device with the user's permission. In a plain
// browser it falls back to a vCard download (which the OS imports on open).
// ----------------------------------------------------------------------------

const DeviceContacts = (() => {
  function isNative() {
    return typeof Capacitor !== 'undefined'
      && typeof Capacitor.isNativePlatform === 'function'
      && Capacitor.isNativePlatform();
  }

  function plugin() {
    const p = (typeof Capacitor !== 'undefined' && Capacitor.Plugins && Capacitor.Plugins.Contacts) || null;
    if (!p) throw new Error('Contacts plugin not available. Rebuild the app with `npx cap sync`.');
    return p;
  }

  // Write the selected contacts to the device. Returns { saved, total }.
  async function saveToDevice(contacts) {
    const selected = window.Exporter.selectable(contacts);
    if (!selected.length) return { saved: 0, total: 0 };

    const Contacts = plugin();
    const perm = await Contacts.requestPermissions();
    if (perm && perm.contacts && perm.contacts !== 'granted') {
      throw new Error('Contacts permission was denied.');
    }

    let saved = 0;
    const failures = [];
    for (const c of selected) {
      const { given, family } = window.Parse.splitName(c.name);
      try {
        await Contacts.createContact({
          contact: {
            name: { given: given || c.name || '', family: family || '' },
            phones: [{ type: 'mobile', number: c.e164 || c.rawNumber }],
          },
        });
        saved++;
      } catch (e) {
        failures.push((c.name || c.rawNumber) + ': ' + e.message);
      }
    }
    return { saved, total: selected.length, failures };
  }

  return { isNative, saveToDevice };
})();

if (typeof window !== 'undefined') window.DeviceContacts = DeviceContacts;
