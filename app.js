// =========================================================================
//  PERSONALIZE HERE — edit the letter, memories, and photo captions freely.
// =========================================================================
const CONFIG = {
  letter: `Dear Dad,

From the canals of Venice to the dance floor back home, you've made life feel
like one long, beautiful adventure. You taught us how to carry ourselves —
sharp suit, easy smile, and a heart that always makes room for everyone.

Thank you for the trips, the lessons, the laughter at 30,000 feet, and the
quiet steadiness behind all of it. We're lucky to orbit a man like you.

Happy Father's Day. We love you — to the moon and back.`,

  memories: [
    "Gondolas and green canals — Venice never stood a chance against your panama hat.",
    "First-class shenanigans at 30,000 feet. Best travel buddy, hands down.",
    "That burgundy tux. Absolute legend status.",
    "Dinners that turned into hours of stories we never wanted to end.",
    "Dancing in white, surrounded by family and tradition.",
    "Teaching us, by example, how to move through the world with grace.",
  ],

  // Gallery photos — files live in /photos. Reorder or recaption as you like.
  photos: [
    { src: "photos/venice-church.jpg",     cap: "Venice — Grand Canal mornings" },
    { src: "photos/dad-tux.jpg",           cap: "The burgundy tux" },
    { src: "photos/flight-laugh.jpg",      cap: "Best seat in the house" },
    { src: "photos/venice-goldenhour.jpg", cap: "Golden hour on the water" },
    { src: "photos/dad-grey-suit.jpg",     cap: "Sharp as ever" },
    { src: "photos/venice-point.jpg",      cap: "This way to the next adventure" },
    { src: "photos/airport-son.jpg",       cap: "Travel buddies" },
    { src: "photos/dad-sons-2.jpg",        cap: "The three of us" },
    { src: "photos/venice-selfie.jpg",     cap: "Sunshine and the Grand Canal" },
    { src: "photos/restaurant.jpg",        cap: "Family dinners" },
    { src: "photos/traditional-dance.jpg", cap: "A night of tradition" },
    { src: "photos/venice-bridge.jpg",     cap: "By the Scalzi bridge" },
    { src: "photos/dad-cream-suit.jpg",    cap: "Effortless" },
    { src: "photos/flight-playful.jpg",    cap: "Cheers, from the clouds" },
    { src: "photos/festival.jpg",          cap: "Celebration in the streets" },
    { src: "photos/venice-dining.jpg",     cap: "La dolce vita" },
    { src: "photos/indoor-selfie.jpg",     cap: "Always together" },
    { src: "photos/mall.jpg",              cap: "Partners in everything" },
  ],
};

// ---------- Starfield ----------
const canvas = document.getElementById("sky");
const ctx = canvas.getContext("2d");
let stars = [];
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const count = Math.floor((canvas.width * canvas.height) / 7000);
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.2,
    speed: Math.random() * 0.35 + 0.04,
    phase: Math.random() * Math.PI * 2,
  }));
}
function drawStars(t) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const s of stars) {
    const tw = 0.5 + 0.5 * Math.sin(t / 650 + s.phase);
    ctx.globalAlpha = 0.25 + tw * 0.75;
    ctx.fillStyle = s.r > 1.1 ? "#ffe9b0" : "#f3f1ff";
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    s.y += s.speed;
    if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
  }
  requestAnimationFrame(drawStars);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
requestAnimationFrame(drawStars);

// ---------- Scroll reveals ----------
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); });
}, { threshold: 0.2 });
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// ---------- Typewriter letter ----------
const letterEl = document.getElementById("letterText");
let typed = false;
function typeLetter() {
  if (typed) return;
  typed = true;
  const text = CONFIG.letter;
  let i = 0;
  const timer = setInterval(() => {
    letterEl.textContent = text.slice(0, i++);
    if (i > text.length) {
      clearInterval(timer);
      letterEl.classList.add("done");
    }
  }, 16);
}
new IntersectionObserver((entries, obs) => {
  entries.forEach((e) => { if (e.isIntersecting) { typeLetter(); obs.disconnect(); } });
}, { threshold: 0.35 }).observe(document.getElementById("letter"));

// ---------- Memory constellation ----------
const starField = document.getElementById("stars");
const memoryCard = document.getElementById("memoryCard");
const memoryText = document.getElementById("memoryText");
const seeds = [[14, 30], [32, 65], [48, 22], [63, 58], [78, 35], [88, 72]];
CONFIG.memories.forEach((memory, i) => {
  const [x, y] = seeds[i % seeds.length];
  const btn = document.createElement("button");
  btn.className = "memory-star";
  btn.textContent = "✦";
  btn.style.left = x + "%";
  btn.style.top = y + "%";
  btn.style.animationDelay = (i * 0.35) + "s";
  btn.addEventListener("click", () => {
    memoryText.textContent = memory;
    memoryCard.classList.remove("hidden");
  });
  starField.appendChild(btn);
});
document.getElementById("closeMemory").addEventListener("click", () =>
  memoryCard.classList.add("hidden"));

// ---------- Gallery + Lightbox ----------
const grid = document.getElementById("galleryGrid");
const lightbox = document.getElementById("lightbox");
const lbImage = document.getElementById("lbImage");
const lbCaption = document.getElementById("lbCaption");
let current = 0;

CONFIG.photos.forEach((photo, i) => {
  const item = document.createElement("div");
  item.className = "g-item";
  const img = document.createElement("img");
  img.src = photo.src;
  img.alt = photo.cap;
  img.loading = "lazy";
  const cap = document.createElement("div");
  cap.className = "g-cap";
  cap.textContent = photo.cap;
  item.append(img, cap);
  item.addEventListener("click", () => openLightbox(i));
  grid.appendChild(item);
  attachTilt(item);
});

// Interactive 3D tilt — follows the pointer, resets on leave.
function attachTilt(el) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const MAX = 10; // degrees
  function move(e) {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;   // 0..1
    const py = (e.clientY - r.top) / r.height;   // 0..1
    const ry = (px - 0.5) * 2 * MAX;             // rotateY
    const rx = (0.5 - py) * 2 * MAX;             // rotateX
    el.style.transform =
      `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.04)`;
    el.style.setProperty("--mx", px * 100 + "%");
    el.style.setProperty("--my", py * 100 + "%");
  }
  function enter() { el.classList.add("tilt"); }
  function leave() {
    el.classList.remove("tilt");
    el.style.transform = "";
  }
  el.addEventListener("pointerenter", enter);
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerleave", leave);
}

function openLightbox(i) {
  current = (i + CONFIG.photos.length) % CONFIG.photos.length;
  const p = CONFIG.photos[current];
  lbImage.src = p.src;
  lbImage.alt = p.cap;
  lbCaption.textContent = p.cap;
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

// ---------- Shooting star ----------
document.getElementById("launchBtn").addEventListener("click", () => {
  for (let n = 0; n < 3; n++) {
    setTimeout(() => {
      const star = document.createElement("div");
      star.className = "shooting-star";
      const startX = Math.random() * window.innerWidth * 0.6;
      star.style.left = startX + "px";
      star.style.top = "-10px";
      document.body.appendChild(star);
      const dur = 1100 + Math.random() * 500;
      const start = performance.now();
      (function step(now) {
        const p = Math.min((now - start) / dur, 1);
        star.style.transform = `translate(${p * 340}px, ${p * window.innerHeight * 1.1}px)`;
        star.style.opacity = String(1 - p);
        if (p < 1) requestAnimationFrame(step); else star.remove();
      })(start);
    }, n * 180);
  }
});
