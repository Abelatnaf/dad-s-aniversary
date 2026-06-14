// ----------------------------------------------------------------------------
// app.js — Orchestrator: holds state, routes between screens, wires the
// editable review table and export buttons.
// ----------------------------------------------------------------------------

(() => {
  const state = {
    files: [],      // selected File objects (upload screen)
    contacts: [],   // current working set (review/export)
  };

  const $ = (id) => document.getElementById(id);

  function showScreen(name) {
    document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
    $(`screen-${name}`).classList.add('active');
    window.scrollTo(0, 0);
  }

  // --- Upload screen --------------------------------------------------------
  function addFiles(fileList) {
    for (const f of fileList) {
      if (f.type.startsWith('image/')) state.files.push(f);
    }
    renderThumbs();
  }

  function renderThumbs() {
    const wrap = $('thumbs');
    wrap.innerHTML = '';
    state.files.forEach((file, idx) => {
      const div = document.createElement('div');
      div.className = 'thumb';
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.onload = () => URL.revokeObjectURL(img.src);
      const rm = document.createElement('button');
      rm.className = 'thumb-remove';
      rm.textContent = '×';
      rm.setAttribute('aria-label', 'Remove image');
      rm.onclick = () => { state.files.splice(idx, 1); renderThumbs(); };
      div.appendChild(img);
      div.appendChild(rm);
      wrap.appendChild(div);
    });
    $('scan-btn').disabled = state.files.length === 0;
    $('scan-btn').textContent = state.files.length
      ? `Scan ${state.files.length} image${state.files.length > 1 ? 's' : ''}`
      : 'Scan images';
  }

  // --- Processing -----------------------------------------------------------
  async function runScan() {
    showScreen('processing');
    setProgress(0, 'Starting…');
    try {
      const texts = await OCR.recognizeAll(state.files, (done, total, frac) => {
        setProgress(frac, `Reading image ${Math.min(done + 1, total)} of ${total}…`);
      });
      state.contacts = window.Parse.extractAll(texts, {});
      OCR.terminate();
      renderReview();
      showScreen('review');
    } catch (err) {
      setProgress(0, `Something went wrong: ${err.message}. Tap to go back.`);
      $('screen-processing').onclick = () => showScreen('upload');
    }
  }

  function setProgress(frac, msg) {
    $('progress-bar').style.width = `${Math.round(frac * 100)}%`;
    if (msg) $('processing-status').textContent = msg;
  }

  // --- Review table ---------------------------------------------------------
  function badge(status) {
    const map = { Valid: 'valid', Local: 'local', Check: 'check', Dup: 'dup' };
    return `<span class="badge badge-${map[status] || 'check'}">${status}</span>`;
  }

  function recompute(contact) {
    const norm = window.Parse.normalizePhone(contact.rawNumber, CONFIG.DEFAULT_COUNTRY);
    contact.e164 = norm.e164;
    contact.national = norm.national;
    contact.status = !norm.valid ? 'Check' : (norm.intl ? 'Valid' : 'Local');
  }

  function renderReview() {
    const body = $('review-body');
    body.innerHTML = '';
    state.contacts.forEach((c, idx) => body.appendChild(buildRow(c, idx)));
  }

  function buildRow(contact, idx) {
    const tr = document.createElement('tr');

    const tdCheck = document.createElement('td');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = !!contact.include;
    cb.onchange = () => { contact.include = cb.checked; };
    tdCheck.appendChild(cb);

    const tdName = document.createElement('td');
    const nameIn = document.createElement('input');
    nameIn.type = 'text';
    nameIn.value = contact.name || '';
    nameIn.placeholder = 'Name';
    nameIn.oninput = () => { contact.name = nameIn.value; };
    tdName.appendChild(nameIn);

    const tdPhone = document.createElement('td');
    const phoneIn = document.createElement('input');
    phoneIn.type = 'tel';
    phoneIn.inputMode = 'tel';
    phoneIn.value = contact.rawNumber || '';
    phoneIn.placeholder = 'Phone';
    phoneIn.oninput = () => {
      contact.rawNumber = phoneIn.value;
      recompute(contact);
      tdStatus.innerHTML = badge(contact.status);
    };
    tdPhone.appendChild(phoneIn);

    const tdStatus = document.createElement('td');
    tdStatus.innerHTML = badge(contact.status);

    const tdDel = document.createElement('td');
    const del = document.createElement('button');
    del.className = 'row-del';
    del.textContent = '🗑';
    del.setAttribute('aria-label', 'Delete row');
    del.onclick = () => {
      state.contacts = state.contacts.filter((x) => x !== contact);
      renderReview();
    };
    tdDel.appendChild(del);

    tr.append(tdCheck, tdName, tdPhone, tdStatus, tdDel);
    return tr;
  }

  function addBlankRow() {
    state.contacts.push({ name: '', rawNumber: '', e164: '', national: '', status: 'Check', include: true });
    renderReview();
    const inputs = $('review-body').querySelectorAll('tr:last-child input[type="text"]');
    if (inputs[0]) inputs[0].focus();
  }

  // --- Export ---------------------------------------------------------------
  function goToExport() {
    const n = window.Exporter.selectable(state.contacts).length;
    $('export-summary').textContent = `${n} contact${n === 1 ? '' : 's'} selected.`;
    const gbtn = $('google-btn');
    if (!window.GoogleContacts.isConfigured()) {
      gbtn.disabled = true;
      gbtn.title = 'Set GOOGLE_CLIENT_ID in config.js to enable (see README)';
    }
    showScreen('export');
  }

  async function pushToGoogle() {
    const out = $('google-result');
    out.textContent = 'Opening Google sign-in…';
    try {
      const { created, total } = await window.GoogleContacts.pushContacts(state.contacts);
      out.textContent = `✅ Added ${created} of ${total} contacts to Google Contacts.`;
    } catch (err) {
      out.textContent = `⚠️ ${err.message}`;
    }
  }

  function restart() {
    state.files = [];
    state.contacts = [];
    renderThumbs();
    $('google-result').textContent = '';
    showScreen('upload');
  }

  // --- Wire up --------------------------------------------------------------
  function init() {
    $('file-input').addEventListener('change', (e) => { addFiles(e.target.files); e.target.value = ''; });
    $('camera-input').addEventListener('change', (e) => { addFiles(e.target.files); e.target.value = ''; });
    $('scan-btn').addEventListener('click', runScan);
    $('add-row-btn').addEventListener('click', addBlankRow);
    $('to-export-btn').addEventListener('click', goToExport);
    $('dl-vcf-btn').addEventListener('click', () => window.Exporter.downloadVCard(state.contacts));
    $('dl-csv-btn').addEventListener('click', () => window.Exporter.downloadCsv(state.contacts));
    $('google-btn').addEventListener('click', pushToGoogle);
    $('restart-btn').addEventListener('click', restart);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
