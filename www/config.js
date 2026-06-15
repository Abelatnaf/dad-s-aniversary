// ----------------------------------------------------------------------------
// Phone-Help configuration
//
// Set GEMINI_API_KEY to read screenshots with Google Gemini (free tier).
// Get a free key at https://aistudio.google.com/apikey
// ----------------------------------------------------------------------------

const CONFIG = {
  // Free Google Gemini API key (https://aistudio.google.com/apikey).
  // Required to read screenshots. Bundled on-device in the app build.
  GEMINI_API_KEY: '',

  // Gemini model used for vision. gemini-2.0-flash is fast and free-tier eligible.
  GEMINI_MODEL: 'gemini-2.0-flash',

  // Default country (ISO 3166-1 alpha-2) used to interpret LOCAL numbers written
  // without a +country code, e.g. "ET" for Ethiopia, "US" for USA.
  DEFAULT_COUNTRY: 'US',

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
