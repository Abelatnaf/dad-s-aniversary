// ----------------------------------------------------------------------------
// Phone-Help configuration
//
// vCard and CSV export work with NO changes here.
// Only the Google Contacts "direct push" feature needs GOOGLE_CLIENT_ID set.
// See README.md for the one-time Google Cloud setup steps.
// ----------------------------------------------------------------------------

const CONFIG = {
  // Paste your OAuth Web-application Client ID here to enable "Add to Google
  // Contacts". Leave empty to disable that button (vCard/CSV still work).
  GOOGLE_CLIENT_ID: '',

  // Default country (ISO 3166-1 alpha-2) used to interpret LOCAL numbers that
  // are written without a +country code, e.g. "ET" for Ethiopia, "US" for USA.
  DEFAULT_COUNTRY: 'US',

  // Tesseract OCR language(s). 'eng' = English. Combine like 'eng+amh'.
  OCR_LANG: 'eng',

  // Minimum number of digits for something to be treated as a phone number.
  PHONE_MIN_DIGITS: 7,
};

// Expose for both browser globals and Node (tests).
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
