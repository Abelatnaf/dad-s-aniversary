// =========================================================================
//  FOR DAD — a cinematic Father's Day film.
//  Everything you might want to change lives in CONFIG below: the scene
//  order, each photo, the words on screen, the letter, and the gallery.
//  Captions are written in a single, personal voice ("from just me to you").
// =========================================================================
const CONFIG = {
  // Optional background music. Drop an mp3 at this path (e.g. "audio/theme.mp3")
  // and the ♪ button appears automatically. Leave "" to hide it.
  musicSrc: "",

  // The typed letter at the heart of the film.
  letter: `From the canals of Venice to the dance floor back home, you made the
whole world feel like somewhere we belonged. You showed me how to carry
myself — sharp suit, easy smile, and a heart that always made room for
one more.

Thank you for the trips, the long lunches, the laughter at 30,000 feet,
and the quiet steadiness behind all of it.`,
  signOff: "— with all my love,",
  signature: "your kid",

  // The film, scene by scene. Types:
  //   'hero'    — opening title over a photo
  //   'caption' — a full-screen photo with a line (and optional kicker/chapter)
  //   'letter'  — the typed letter over a blurred photo
  //   'gallery' — the contact-sheet of every photo (uses `photos` below)
  //   'finale'  — the closing scene
  scenes: [
    { type: "hero", photo: "photos/traditional-dance.jpg", focus: "center 38%",
      eyebrow: "a little something for you",
      line: "Happy\nFather's Day",
      sub: "To the man who never stopped dancing." },

    { type: "caption", photo: "photos/dad-grey-suit.jpg", focus: "center 32%",
      line: "Before I knew\nanything at all,\nI knew you." },

    { type: "caption", photo: "photos/venice-church.jpg", focus: "center 62%",
      chapter: "Chapter One — Away",
      line: "We went looking\nfor the world," },

    { type: "caption", photo: "photos/venice-goldenhour.jpg", focus: "center 72%",
      line: "and found it glowing\non the water." },

    { type: "caption", photo: "photos/venice-point.jpg", focus: "center 55%",
      kicker: "you always knew",
      line: "which way the\nadventure was." },

    { type: "caption", photo: "photos/venice-dining.jpg", focus: "center 28%",
      kicker: "la dolce vita",
      line: "Long lunches.\nLonger stories." },

    { type: "caption", photo: "photos/flight-laugh.jpg", focus: "center 55%",
      chapter: "Chapter Two — The Sky",
      line: "The best part was\nnever the destination." },

    { type: "caption", photo: "photos/flight-playful.jpg", focus: "center 35%",
      line: "Thirty-thousand feet —\nstill the funniest\nperson I know." },

    { type: "letter", photo: "photos/dad-tux.jpg", focus: "center 35%" },

    { type: "caption", photo: "photos/dad-cream-suit.jpg", focus: "center 32%",
      chapter: "Chapter Three — Home",
      line: "Style, I learned,\nis just kindness —\nwell dressed." },

    { type: "caption", photo: "photos/hero-tux.jpg", focus: "center 36%",
      kicker: "and somehow,",
      line: "you always knew\nhow to walk into a room." },

    { type: "caption", photo: "photos/festival.jpg", focus: "center 32%",
      line: "You taught me\nwhere I'm from." },

    { type: "caption", photo: "photos/dad-sons-1.jpg", focus: "center 40%",
      chapter: "Chapter Four — Us",
      line: "Everything I know\nabout being a good man,\nI learned watching you." },

    { type: "gallery",
      title: "Every Frame",
      sub: "a place I'd go again — tap to linger" },

    { type: "finale", photo: "photos/dad-sons-2.jpg", focus: "center 35%",
      script: "to the moon and back",
      line: "Happy Father's Day, Dad.",
      sub: "I love you.",
      button: "Send some love",
      foot: "made with ♥ · Father's Day 2026" },
  ],

  // Contact-sheet gallery — every photo, captioned.
  photos: [
    { src: "photos/venice-church.jpg",     cap: "Grand Canal mornings" },
    { src: "photos/dad-tux.jpg",           cap: "The burgundy tux" },
    { src: "photos/flight-laugh.jpg",      cap: "Best seat in the house" },
    { src: "photos/venice-goldenhour.jpg", cap: "Golden hour on the water" },
    { src: "photos/dad-grey-suit.jpg",     cap: "Sharp as ever" },
    { src: "photos/venice-point.jpg",      cap: "This way to the adventure" },
    { src: "photos/airport-son.jpg",       cap: "Wheels up" },
    { src: "photos/dad-sons-2.jpg",        cap: "Family" },
    { src: "photos/venice-selfie.jpg",     cap: "Sunshine and the canal" },
    { src: "photos/restaurant.jpg",        cap: "Family dinners" },
    { src: "photos/traditional-dance.jpg", cap: "A night of tradition" },
    { src: "photos/venice-bridge.jpg",     cap: "By the Scalzi bridge" },
    { src: "photos/dad-cream-suit.jpg",    cap: "Effortless" },
    { src: "photos/flight-playful.jpg",    cap: "Cheers, from the clouds" },
    { src: "photos/festival.jpg",          cap: "Celebration in the streets" },
    { src: "photos/venice-dining.jpg",     cap: "La dolce vita" },
    { src: "photos/indoor-selfie.jpg",     cap: "Always together" },
    { src: "photos/mall.jpg",              cap: "Partners in everything" },
    { src: "photos/dad-sons-1.jpg",        cap: "Like father" },
    { src: "photos/hero-tux.jpg",          cap: "The one and only" },
  ],
};

const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const film = document.getElementById("film");

// ----------------------------------------------------------------------
//  Scene builders
// ----------------------------------------------------------------------
function bgFor(photo, focus) {
  const bg = document.createElement("div");
  bg.className = "scene-bg";
  const img = document.createElement("img");
  img.src = photo;
  img.alt = "";
  if (focus) img.style.objectPosition = focus;
  bg.appendChild(img);
  return bg;
}
function scrim() {
  const s = document.createElement("div");
  s.className = "scene-scrim";
  return s;
}

function buildHero(s) {
  const sec = document.createElement("section");
  sec.className = "scene scene-hero";
  sec.append(bgFor(s.photo, s.focus), scrim());
  const c = document.createElement("div");
  c.className = "scene-content";
  c.innerHTML =
    (s.eyebrow ? `<p class="sc-eyebrow">${s.eyebrow}</p>` : "") +
    `<h1 class="sc-line">${s.line}</h1>` +
    (s.sub ? `<p class="sc-sub">${s.sub}</p>` : "");
  sec.appendChild(c);
  const cue = document.createElement("div");
  cue.className = "scroll-cue";
  cue.innerHTML = `<span>scroll</span><span class="arrow">↓</span>`;
  sec.appendChild(cue);
  return sec;
}

function buildCaption(s) {
  const sec = document.createElement("section");
  sec.className = "scene scene-caption";
  sec.append(bgFor(s.photo, s.focus), scrim());
  const c = document.createElement("div");
  c.className = "scene-content";
  c.innerHTML =
    (s.chapter ? `<span class="chapter-pill">${s.chapter}</span>` : "") +
    (s.kicker ? `<p class="sc-kicker">${s.kicker}</p>` : "") +
    `<p class="sc-line">${s.line}</p>` +
    (s.sub ? `<p class="sc-sub">${s.sub}</p>` : "");
  sec.appendChild(c);
  return sec;
}

function buildLetter(s) {
  const sec = document.createElement("section");
  sec.className = "scene scene-letter";
  sec.append(bgFor(s.photo, s.focus), scrim());
  const paper = document.createElement("div");
  paper.className = "letter-paper scene-content";
  paper.innerHTML = `
    <span class="letter-tape"></span>
    <p class="letter-dear">Dear Dad,</p>
    <p class="letter-body" id="letterBody"></p>
    <p class="letter-signoff">${CONFIG.signOff}</p>
    <p class="letter-sign">${CONFIG.signature}</p>`;
  sec.appendChild(paper);
  return sec;
}

function buildGallery(s) {
  const sec = document.createElement("section");
  sec.className = "scene scene-gallery";
  const head = document.createElement("div");
  head.className = "gallery-head";
  head.innerHTML =
    `<h2 class="gallery-title">${s.title}</h2>` +
    (s.sub ? `<p class="gallery-sub">${s.sub}</p>` : "");
  const grid = document.createElement("div");
  grid.className = "gallery-grid";
  grid.id = "galleryGrid";
  sec.append(head, grid);
  return sec;
}

function buildFinale(s) {
  const sec = document.createElement("section");
  sec.className = "scene scene-finale";
  sec.append(bgFor(s.photo, s.focus), scrim());
  const c = document.createElement("div");
  c.className = "scene-content";
  c.innerHTML =
    `<div class="finale-heart">♥</div>` +
    `<h2 class="sc-line">${s.line}</h2>` +
    (s.script ? `<p class="finale-script">${s.script}</p>` : "") +
    (s.sub ? `<p class="sc-sub">${s.sub}</p>` : "") +
    `<div><button id="launchBtn" class="launch-btn">${s.button}</button></div>` +
    `<p class="finale-foot">${s.foot}</p>`;
  sec.appendChild(c);
  return sec;
}

const BUILDERS = { hero: buildHero, caption: buildCaption, letter: buildLetter, gallery: buildGallery, finale: buildFinale };
const sceneEls = [];
CONFIG.scenes.forEach((s, i) => {
  const el = (BUILDERS[s.type] || buildCaption)(s);
  el.dataset.index = i;
  // first photo loads eagerly, rest lazily
  const img = el.querySelector(".scene-bg img");
  if (img) img.loading = i <= 1 ? "eager" : "lazy";
  film.appendChild(el);
  sceneEls.push(el);
});

// ----------------------------------------------------------------------
//  Scroll progress
// ----------------------------------------------------------------------
const progressFill = document.getElementById("progressFill");
function updateProgress() {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  progressFill.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
}

// ----------------------------------------------------------------------
//  Parallax (rAF-throttled) + active/seen toggling
// ----------------------------------------------------------------------
let ticking = false;
function onScroll() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(() => {
      updateProgress();
      if (!REDUCED_MOTION) {
        const vh = window.innerHeight;
        for (const el of sceneEls) {
          const bg = el.querySelector(".scene-bg");
          if (!bg) continue;
          const r = el.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) continue;
          const prog = (r.top + r.height / 2 - vh / 2) / vh; // -1..1-ish
          bg.style.transform = `translateY(${(-prog * 6).toFixed(2)}%)`;
        }
      }
      ticking = false;
    });
  }
}
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);

const sceneObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add("active", "seen");
      if (e.target.classList.contains("scene-letter")) typeLetter();
    } else {
      e.target.classList.remove("active");
    }
  });
}, { threshold: 0.5 });
sceneEls.forEach((el) => sceneObserver.observe(el));

// ----------------------------------------------------------------------
//  Typewriter letter
// ----------------------------------------------------------------------
let typed = false;
function typeLetter() {
  if (typed) return;
  const body = document.getElementById("letterBody");
  if (!body) return;
  typed = true;
  if (REDUCED_MOTION) { body.textContent = CONFIG.letter; body.classList.add("done"); return; }
  const text = CONFIG.letter;
  let i = 0;
  const timer = setInterval(() => {
    body.textContent = text.slice(0, i++);
    if (i > text.length) { clearInterval(timer); body.classList.add("done"); }
  }, 18);
}

// ----------------------------------------------------------------------
//  Gallery + lightbox
// ----------------------------------------------------------------------
const grid = document.getElementById("galleryGrid");
const lightbox = document.getElementById("lightbox");
const lbImage = document.getElementById("lbImage");
const lbCaption = document.getElementById("lbCaption");
let current = 0;

function attachTilt(el) {
  if (REDUCED_MOTION) return;
  const MAX = 8;
  el.addEventListener("pointerenter", () => el.classList.add("tilt"));
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const ry = (px - 0.5) * 2 * MAX;
    const rx = (0.5 - py) * 2 * MAX;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.04)`;
    el.style.setProperty("--mx", px * 100 + "%");
    el.style.setProperty("--my", py * 100 + "%");
  });
  el.addEventListener("pointerleave", () => { el.classList.remove("tilt"); el.style.transform = ""; });
}

if (grid) {
  CONFIG.photos.forEach((photo, i) => {
    const item = document.createElement("div");
    item.className = "g-item";
    const frame = document.createElement("div");
    frame.className = "g-frame";
    const img = document.createElement("img");
    img.src = photo.src; img.alt = photo.cap; img.loading = "lazy";
    frame.appendChild(img);
    const cap = document.createElement("div");
    cap.className = "g-cap";
    cap.textContent = photo.cap;
    item.append(frame, cap);
    item.addEventListener("click", () => openLightbox(i));
    grid.appendChild(item);
    attachTilt(item);
  });
}

function openLightbox(i) {
  current = (i + CONFIG.photos.length) % CONFIG.photos.length;
  const p = CONFIG.photos[current];
  lbImage.src = p.src; lbImage.alt = p.cap; lbCaption.textContent = p.cap;
  lightbox.classList.remove("hidden");
}
function closeLightbox() { lightbox.classList.add("hidden"); }
lightbox.querySelector(".lb-close").addEventListener("click", closeLightbox);
lightbox.querySelector(".lb-prev").addEventListener("click", (e) => { e.stopPropagation(); openLightbox(current - 1); });
lightbox.querySelector(".lb-next").addEventListener("click", (e) => { e.stopPropagation(); openLightbox(current + 1); });
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", (e) => {
  if (lightbox.classList.contains("hidden")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") openLightbox(current - 1);
  if (e.key === "ArrowRight") openLightbox(current + 1);
});

// ----------------------------------------------------------------------
//  Heart burst + finale button
// ----------------------------------------------------------------------
function burstHearts(anchorEl, count = 18) {
  if (REDUCED_MOTION || !anchorEl) return;
  const burst = document.createElement("div");
  burst.className = "heart-burst";
  const cols = ["#c4622d", "#e0a96d", "#46695b", "#a84a1f", "#f0d2a0"];
  for (let i = 0; i < count; i++) {
    const span = document.createElement("span");
    span.textContent = "♥";
    span.style.left = (Math.random() * 240 - 120) + "px";
    span.style.fontSize = (10 + Math.random() * 13) + "px";
    span.style.color = cols[i % cols.length];
    span.style.setProperty("--r", (Math.random() * 80 - 40) + "deg");
    span.style.animation = `burstUp ${(1 + Math.random() * 0.6).toFixed(2)}s cubic-bezier(.2,.6,.4,1) ${(Math.random() * 0.15).toFixed(2)}s forwards`;
    burst.appendChild(span);
  }
  anchorEl.appendChild(burst);
  setTimeout(() => burst.remove(), 2000);
}
const launchBtn = document.getElementById("launchBtn");
if (launchBtn) {
  launchBtn.addEventListener("click", (e) => burstHearts(e.currentTarget.parentElement, 24));
  if (!REDUCED_MOTION) {
    launchBtn.addEventListener("pointermove", (e) => {
      const r = launchBtn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.25;
      const dy = (e.clientY - (r.top + r.height / 2)) * 0.35;
      launchBtn.style.transform = `translate(${dx}px, ${dy}px) scale(1.04)`;
    });
    launchBtn.addEventListener("pointerleave", () => { launchBtn.style.transform = ""; });
  }
}

// ----------------------------------------------------------------------
//  Ambient particles (warm dust drifting up)
// ----------------------------------------------------------------------
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
let motes = [];
function resizeParticles() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const count = Math.min(70, Math.floor((canvas.width * canvas.height) / 26000));
  motes = Array.from({ length: count }, () => spawnMote(true));
}
function spawnMote(initial) {
  return {
    x: Math.random() * canvas.width,
    y: initial ? Math.random() * canvas.height : canvas.height + 10,
    r: Math.random() * 1.8 + 0.5,
    vy: -(Math.random() * 0.25 + 0.06),
    vx: (Math.random() - 0.5) * 0.18,
    a: Math.random() * 0.4 + 0.15,
    phase: Math.random() * Math.PI * 2,
  };
}
function drawParticles(t) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const m of motes) {
    const tw = 0.6 + 0.4 * Math.sin(t / 900 + m.phase);
    ctx.globalAlpha = m.a * tw;
    ctx.fillStyle = m.r > 1.4 ? "#f0d2a0" : "#e9d9bd";
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    ctx.fill();
    m.y += m.vy; m.x += m.vx + Math.sin(t / 1400 + m.phase) * 0.15;
    if (m.y < -10 || m.x < -10 || m.x > canvas.width + 10) Object.assign(m, spawnMote(false));
  }
  requestAnimationFrame(drawParticles);
}
let particlesStarted = false;
function startParticles() {
  if (particlesStarted || REDUCED_MOTION) return;
  particlesStarted = true;
  resizeParticles();
  canvas.classList.add("on");
  window.addEventListener("resize", resizeParticles);
  requestAnimationFrame(drawParticles);
}

// ----------------------------------------------------------------------
//  Optional music
// ----------------------------------------------------------------------
let audio = null, playing = false;
const soundToggle = document.getElementById("soundToggle");
if (CONFIG.musicSrc) {
  audio = new Audio(CONFIG.musicSrc);
  audio.loop = true; audio.volume = 0;
  soundToggle.classList.add("show");
  soundToggle.addEventListener("click", () => {
    if (playing) { fadeAudio(0); soundToggle.textContent = "♪"; }
    else { audio.play().then(() => fadeAudio(0.5)).catch(() => {}); soundToggle.textContent = "✕"; }
    playing = !playing;
  });
}
function fadeAudio(target) {
  if (!audio) return;
  const step = target > audio.volume ? 0.02 : -0.02;
  const id = setInterval(() => {
    audio.volume = Math.min(1, Math.max(0, audio.volume + step));
    if ((step > 0 && audio.volume >= target) || (step < 0 && audio.volume <= target)) {
      audio.volume = target; clearInterval(id);
      if (target === 0) audio.pause();
    }
  }, 30);
}

// ----------------------------------------------------------------------
//  Title card → begin
// ----------------------------------------------------------------------
const titleCard = document.getElementById("titleCard");
const beginBtn = document.getElementById("beginBtn");
// keep the title-card line honest about whether there's sound
const tcSub = titleCard.querySelector(".tc-sub");
if (tcSub) tcSub.textContent = CONFIG.musicSrc ? "turn your sound on ♪" : "a little film, just for you";
function begin() {
  titleCard.classList.add("gone");
  document.body.classList.remove("locked");
  window.scrollTo(0, 0);
  startParticles();
  // mark the hero seen/active immediately so it animates in
  if (sceneEls[0]) sceneEls[0].classList.add("active", "seen");
  onScroll();
  if (audio) { audio.play().then(() => { fadeAudio(0.5); playing = true; soundToggle.textContent = "✕"; }).catch(() => {}); }
}
beginBtn.addEventListener("click", begin);
titleCard.addEventListener("click", (e) => { if (e.target === titleCard) begin(); });
