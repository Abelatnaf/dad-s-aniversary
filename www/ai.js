// ----------------------------------------------------------------------------
// ai.js — Read screenshots with Google Gemini (free tier) and return raw
// { name, phone } pairs. Replaces local OCR with a vision model that handles
// messy, varied screenshots far better.
// ----------------------------------------------------------------------------

const AI = (() => {
  const PROMPT =
    'You are extracting contacts from a phone screenshot. Find every person and ' +
    'their phone number shown in the image. Return a JSON array of objects with ' +
    '"name" and "phone". Copy the phone number EXACTLY as shown, including +, ' +
    'spaces, parentheses, dashes and any leading zero. If a name is not shown, ' +
    'use an empty string. Ignore UI labels like Mobile, Home, Work, Favorites, ' +
    'Recents. Do not invent data. If no contacts are visible, return [].';

  const SCHEMA = {
    type: 'ARRAY',
    items: {
      type: 'OBJECT',
      properties: { name: { type: 'STRING' }, phone: { type: 'STRING' } },
      required: ['phone'],
    },
  };

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1]); // strip data: prefix
      reader.onerror = () => reject(new Error('Could not read image file.'));
      reader.readAsDataURL(file);
    });
  }

  async function extractFromImage(file) {
    if (!CONFIG.GEMINI_API_KEY) {
      throw new Error('No Gemini API key set. Add GEMINI_API_KEY in config.js.');
    }
    const base64 = await fileToBase64(file);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODEL}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;
    const body = {
      contents: [{
        parts: [
          { text: PROMPT },
          { inline_data: { mime_type: file.type || 'image/jpeg', data: base64 } },
        ],
      }],
      generationConfig: { responseMimeType: 'application/json', responseSchema: SCHEMA },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Gemini ${res.status}: ${detail.slice(0, 200)}`);
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    let pairs;
    try { pairs = JSON.parse(text); } catch (e) { pairs = []; }
    return Array.isArray(pairs) ? pairs : [];
  }

  // Extract from many files sequentially. onProgress(done, total) reports progress.
  async function extractFromImages(files, onProgress) {
    const total = files.length;
    let all = [];
    for (let i = 0; i < total; i++) {
      if (onProgress) onProgress(i, total);
      const pairs = await extractFromImage(files[i]);
      all = all.concat(pairs.map((p) => ({ name: p.name || '', phone: p.phone || '' })));
    }
    if (onProgress) onProgress(total, total);
    return all;
  }

  return { extractFromImage, extractFromImages };
})();

if (typeof window !== 'undefined') window.AI = AI;
