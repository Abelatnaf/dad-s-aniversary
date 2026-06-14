// ----------------------------------------------------------------------------
// ocr.js — Thin wrapper around Tesseract.js. Runs OCR on-device in the browser;
// images never leave the phone. Reuses a single worker across images.
// ----------------------------------------------------------------------------

const OCR = (() => {
  let workerPromise = null;

  async function getWorker(onStatus) {
    if (!workerPromise) {
      const lang = (typeof CONFIG !== 'undefined' && CONFIG.OCR_LANG) || 'eng';
      workerPromise = Tesseract.createWorker(lang, 1, {
        logger: (m) => {
          if (onStatus && m.status === 'recognizing text') onStatus(m.progress);
        },
      });
    }
    return workerPromise;
  }

  // Recognize one image file. onProgress(0..1) reports per-image progress.
  async function recognizeImage(file, onProgress) {
    const worker = await getWorker(onProgress);
    const { data } = await worker.recognize(file);
    return { text: data.text || '' };
  }

  // Recognize many files sequentially (kinder to phone memory).
  // onOverall(done, total, fraction) fires as images complete.
  async function recognizeAll(files, onOverall) {
    const total = files.length;
    const texts = [];
    for (let i = 0; i < total; i++) {
      const file = files[i];
      const { text } = await recognizeImage(file, (p) => {
        if (onOverall) onOverall(i, total, (i + p) / total);
      });
      texts.push({ text, source: file.name || `image ${i + 1}` });
      if (onOverall) onOverall(i + 1, total, (i + 1) / total);
    }
    return texts;
  }

  async function terminate() {
    if (workerPromise) {
      const w = await workerPromise;
      await w.terminate();
      workerPromise = null;
    }
  }

  return { recognizeImage, recognizeAll, terminate };
})();

if (typeof window !== 'undefined') window.OCR = OCR;
