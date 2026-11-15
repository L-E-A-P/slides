// Audience window. Linear navigation over STOPS; each stop's Markdown is
// fetched at runtime, split by ContentModel.parseStop and rendered with
// marked. Layout is a body class (layout-default / layout-title /
// layout-section / layout-portrait). Position lives in the URL hash so a reload resumes.
const STOPS = window.STOPS;             // stops.js
const { parseStop } = window.ContentModel; // content-model.js
let stepIndex = 0;

// ─── Presenter-window sync ──────────────────────────────────────────
// Originator broadcasts (navigate); receiver applies silently (goToStop).
const channel = ('BroadcastChannel' in window)
  ? new BroadcastChannel('leap-playspace-slides') : null;

function navigate(index) {
  goToStop(index);
  if (channel) channel.postMessage({ stepIndex });
}
if (channel) {
  channel.onmessage = (e) => {
    const msg = e.data || {};
    if (msg.request) { channel.postMessage({ stepIndex }); return; }
    if (typeof msg.stepIndex === 'number') goToStop(msg.stepIndex);
    else if (msg.gallery === 'down') galleryDown();
    else if (msg.gallery === 'up') galleryUp();
  };
}

// ─── Gallery layer ──────────────────────────────────────────────────
// A stop's <!--gallery--> items live on a fullscreen layer, not on the
// stage: ↓ opens and pages forward, ↑ pages back and closes before the
// first item. Audience-window only: never broadcast.
let galleryItems = []; // [{type:'image',src,alt} | {type:'iframe',src}]
let galleryIndex = -1; // -1 = closed

function renderGallery() {
  const g = document.getElementById('gallery');
  const ind = document.getElementById('gallery-indicator');
  if (galleryIndex < 0 || !galleryItems.length) {
    g.classList.remove('visible');
    g.innerHTML = '';
    ind.style.display = 'none';
    return;
  }
  const item = galleryItems[galleryIndex];
  g.innerHTML = '';
  if (item.type === 'iframe') {
    const fr = document.createElement('iframe');
    fr.src = item.src;
    fr.setAttribute('allow', 'autoplay; fullscreen');
    // Same-origin iframes steal keyboard focus on click; mirror the key
    // handler into them. Cross-origin (YouTube) throws — ignored.
    fr.addEventListener('load', () => {
      try { fr.contentWindow.document.addEventListener('keydown', handleKey); }
      catch (err) { /* cross-origin */ }
    });
    g.appendChild(fr);
  } else if (item.type === 'video') {
    const vid = document.createElement('video');
    vid.src = item.src;
    vid.controls = true;
    g.appendChild(vid);
  } else {
    const el = document.createElement('img');
    el.src = item.src;
    g.appendChild(el);
    if (item.alt) {
      // The caption is inline Markdown (*italic* titles); alt gets its text.
      const cap = document.createElement('div');
      cap.className = 'caption'; cap.innerHTML = window.marked.parseInline(item.alt);
      el.alt = cap.textContent;
      g.appendChild(cap);
    }
  }
  g.classList.add('visible');
  ind.textContent = `${galleryIndex + 1} / ${galleryItems.length}`;
  ind.style.display = 'block';
}
function galleryDown() {
  if (!galleryItems.length) return;
  if (galleryIndex < galleryItems.length - 1) { galleryIndex += 1; renderGallery(); }
}
function galleryUp() {
  if (galleryIndex < 0) return;
  galleryIndex -= 1; renderGallery();
}
function closeGallery() {
  if (galleryIndex < 0) return;
  galleryIndex = -1; renderGallery();
}

// ─── Rendering ──────────────────────────────────────────────────────
function setLayout(name) {
  const b = document.body;
  [...b.classList].forEach(c => { if (c.startsWith('layout-')) b.classList.remove(c); });
  b.classList.add(`layout-${name}`);
}

function renderStop(id) {
  const stage = document.getElementById('stage');
  stage.classList.remove('visible');
  galleryItems = []; galleryIndex = -1; renderGallery();
  const hint = document.getElementById('gallery-hint');
  hint.textContent = '';
  fetch(contentPath(id))
    .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(md => {
      if (STOPS[stepIndex] !== id) return; // navigation moved on — stale
      const stop = parseStop(md);
      setLayout(stop.layout);
      stage.innerHTML = window.marked.parse(stop.audience);
      galleryItems = stop.gallery;
      if (galleryItems.length) {
        const arrow = document.createElement('span');
        arrow.className = 'arrow'; arrow.textContent = '↓';
        hint.append(arrow, ` ${galleryItems.length}`);
      }
      stage.classList.add('visible');
    })
    .catch(() => {
      if (STOPS[stepIndex] !== id) return;
      setLayout('default');
      stage.innerHTML = `<p><em>missing: ${contentPath(id)}</em></p>`;
      stage.classList.add('visible');
    });
}

function updateStepIndicator() {
  document.getElementById('step-indicator').textContent =
    `${stepIndex + 1} / ${STOPS.length}`;
}

// ─── Navigation ─────────────────────────────────────────────────────
function goToStop(index) {
  const clamped = Math.max(0, Math.min(STOPS.length - 1, index));
  const stage = document.getElementById('stage');
  // Already on this stop, already rendered, nothing open: skip the
  // re-render (avoids a visible flicker when next()/prev() hit an end).
  if (clamped === stepIndex && stage.classList.contains('visible') && galleryIndex < 0) return;
  closeGallery(); // leaving a stop closes its gallery layer
  stepIndex = clamped;
  // 1-based in the hash to match the on-screen indicator
  history.replaceState(null, '', `#${stepIndex + 1}`);
  updateStepIndicator();
  renderStop(STOPS[stepIndex]);
}
function next() { navigate(stepIndex + 1); }
function prev() { navigate(stepIndex - 1); }

function indexFromHash() {
  const n = parseInt((location.hash || '').replace('#', ''), 10);
  return Number.isFinite(n) ? n - 1 : 0;
}

function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
  else document.exitFullscreen();
}

// ─── Keys ───────────────────────────────────────────────────────────
function handleKey(e) {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); next(); }
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
  else if (e.key === 'ArrowDown') { e.preventDefault(); galleryDown(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); galleryUp(); }
  else if (e.key === 'Home') { e.preventDefault(); navigate(0); }
  else if (e.key === 'End') { e.preventDefault(); navigate(STOPS.length - 1); }
  else if (e.key === 'f' || e.key === 'F') { toggleFullscreen(); }
}
document.addEventListener('keydown', handleKey);

// A click inside a cross-origin gallery iframe (e.g. hitting play on the
// YouTube embed) moves keyboard focus into that frame's browsing context;
// keydown there never reaches our document-level handler above, so →/←/
// ↓/↑/Home/End/F stop working until focus returns. We can't read or
// redirect focus *into* a cross-origin frame, but the window still blurs
// when that happens, so on blur — once the click has had its effect — we
// blur the iframe back out on the next tick, returning focus to the page.
window.addEventListener('blur', () => {
  if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
    setTimeout(() => document.activeElement && document.activeElement.blur(), 0);
  }
});

// ─── Init ───────────────────────────────────────────────────────────
goToStop(indexFromHash());
// Announce where we landed. The presenter window asks for the position
// only once, when it loads, so without this a reload of *this* window
// (the reflex when something wedges mid-talk) would leave it showing the
// previous stop's notes, silently and with no sign of the mismatch.
if (channel) channel.postMessage({ stepIndex });
