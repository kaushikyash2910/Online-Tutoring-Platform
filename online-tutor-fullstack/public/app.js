// app.js — unified client logic (drop-in replacement)

// ---------- demo data (extended) ----------

const demoCourses = [
  { id: 1, title: 'Fundamentals of Mechanics', tag: 'jee', duration: '30 hrs', price: '₹1,299', tutor: 'Dr. Aryan', desc: 'Concept-first approach with solved problems.' },
  { id: 2, title: 'Electrostatics Mastery', tag: 'jee', duration: '22 hrs', price: '₹999', tutor: 'Dr. Aryan', desc: 'Live sessions + topic videos.' },
  { id: 3, title: 'Organic Chemistry Basics', tag: 'neet', duration: '28 hrs', price: '₹1,099', tutor: "Ritu Ma'am", desc: 'Mechanisms & reaction maps.' },
  { id: 4, title: 'Coordinate Geometry', tag: 'class12', duration: '18 hrs', price: '₹699', tutor: 'Sandeep Sir', desc: 'Tricks and shortcuts for scoring.' },
  { id: 5, title: 'Biology — Genetics', tag: 'neet', duration: '24 hrs', price: '₹899', tutor: 'Anita', desc: 'Illustrated notes and tests.' },
  { id: 6, title: 'Physics: Waves & Oscillations', tag: 'class12', duration: '20 hrs', price: '₹749', tutor: 'Dr. Aryan', desc: 'Wave equations, demos and MCQs.' },
  { id: 7, title: 'Thermodynamics Concepts', tag: 'jee', duration: '26 hrs', price: '₹1,149', tutor: 'Manav Sir', desc: 'Laws, cycles and problems.' },
  { id: 8, title: 'Human Physiology Overview', tag: 'neet', duration: '16 hrs', price: '₹599', tutor: "Priya Ma'am", desc: 'Important systems & diagrams.' },
  { id: 9, title: 'Probability & Combinatorics', tag: 'class12', duration: '20 hrs', price: '₹799', tutor: 'Sandeep Sir', desc: 'Examples and shortcut methods.' },
];

// Global state
let currentCourses = demoCourses.slice(); // start with demo data so page is instant
const COURSES_EL_ID = 'courses';
const POLL_INTERVAL_MS = 30000; // 30s polling fallback

// small HTML-escape helper
function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
}

// Create DOM node for one course (works for both demo and server objects)
// server objects may have `_id`; demo objects use `id`.
function createCourseCard(c) {
  const title = c.title || c.name || 'Untitled';
  const tag = c.tag || '';
  const tutor = c.tutor || '';
  const price = c.price || (c.price === 0 ? 'Free' : 'Free');
  const duration = c.duration || '';
  const desc = c.desc || c.description || '';

  const card = document.createElement('div');
  card.className = 'card';
  card.style.marginBottom = '10px';
  card.dataset.id = c._id || c.id || '';
  card.innerHTML = `
    <div class="meta">
      <div class="title">${escapeHtml(title)}</div>
      <div class="small">${escapeHtml(price)}</div>
    </div>
    <div class="desc">${escapeHtml(desc)}</div>
    <div class="tags" style="margin-top:8px">
      ${duration ? `<span class="tag">${escapeHtml(duration)}</span>` : ''}
      ${tutor ? `<span class="tag">${escapeHtml(tutor)}</span>` : ''}
      ${tag ? `<span class="tag">${escapeHtml(String(tag).toUpperCase())}</span>` : ''}
    </div>
    <div class="course-actions" style="margin-top:10px">
      <button class="btn details-btn" data-id="${c._id || c.id || ''}">Details</button>
      <button class="btn primary enroll-btn" data-id="${c._id || c.id || ''}">Enroll</button>
    </div>
  `;
  return card;
}

// Render a list of courses (clears and re-renders)
function renderCoursesFromList(list) {
  const wrap = document.getElementById(COURSES_EL_ID);
  if (!wrap) return;
  wrap.innerHTML = '';
  if (!Array.isArray(list) || list.length === 0) {
    wrap.innerHTML = '<div style="color:var(--muted);padding:20px">No courses found — try a different search or filter.</div>';
    return;
  }
  for (const c of list) {
    wrap.appendChild(createCourseCard(c));
  }
}

// Prepend new course (SSE)
function prependCourseToDOM(course) {
  const wrap = document.getElementById(COURSES_EL_ID);
  if (!wrap) return;
  const node = createCourseCard(course);
  wrap.insertBefore(node, wrap.firstChild);
  // Also update currentCourses so filters and search include it
  currentCourses.unshift(course);
}

// Fetch courses from server. Handles both array responses and paginated {data: [...]}.
async function fetchCoursesFromServer() {
  try {
    const res = await fetch('/api/courses');
    if (!res.ok) return null;
    const payload = await res.json().catch(() => null);
    if (!payload) return null;
    return Array.isArray(payload) ? payload : (payload.data || payload);
  } catch (err) {
    console.warn('fetchCourses error', err);
    return null;
  }
}

// Filtering & searching
function applyFilterAndSearch(tag = 'all', query = '') {
  const q = (query || '').trim().toLowerCase();
  const filtered = currentCourses.filter(c => {
    const matchesTag = (tag === 'all') || (String(c.tag || '').toLowerCase() === String(tag || '').toLowerCase());
    const inTitle = (c.title || '').toLowerCase().includes(q);
    const inDesc = (c.desc || '').toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q);
    const inTutor = (c.tutor || '').toLowerCase().includes(q);
    return matchesTag && (q === '' || inTitle || inDesc || inTutor);
  });
  renderCoursesFromList(filtered);
}

// Setup chips and search handlers (single source of truth)
function setupFiltersAndSearch() {
  const chips = Array.from(document.querySelectorAll('.chip'));
  chips.forEach(ch => {
    ch.addEventListener('click', () => {
      chips.forEach(x => x.classList.remove('active'));
      ch.classList.add('active');
      const tag = ch.getAttribute('data-tag') || 'all';
      const q = document.getElementById('searchInput').value || '';
      applyFilterAndSearch(tag, q);
    });
  });

  document.getElementById('searchBtn').addEventListener('click', () => {
    const q = document.getElementById('searchInput').value || '';
    const active = document.querySelector('.chip.active')?.getAttribute('data-tag') || 'all';
    applyFilterAndSearch(active, q);
  });

  document.getElementById('searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('searchBtn').click();
  });

  // Delegated click handlers for Details / Enroll buttons
  document.getElementById(COURSES_EL_ID).addEventListener('click', (ev) => {
    const btn = ev.target.closest('button');
    if (!btn) return;
    if (btn.classList.contains('details-btn')) {
      const id = btn.dataset.id;
      const c = currentCourses.find(x => (x._id || x.id || '') === id);
      if (c) alert(`${c.title}\n\n${c.desc}\nTutor: ${c.tutor}\nDuration: ${c.duration}\nPrice: ${c.price}`);
    } else if (btn.classList.contains('enroll-btn')) {
      const id = btn.dataset.id;
      openEnroll && openEnroll(id); // call existing openEnroll if present
    }
  });
}

// Initial render from demo data (fast)
function initialRender() {
  currentCourses = demoCourses.slice();
  renderCoursesFromList(currentCourses);
  // set the default active chip if not set
  if (!document.querySelector('.chip.active')) {
    const firstChip = document.querySelector('.chip');
    if (firstChip) firstChip.classList.add('active');
  }
}

// Polling fallback & SSE init
async function initCourseSync() {
  // Attempt to fetch from server once and replace demo data if available
  const serverList = await fetchCoursesFromServer();
  if (Array.isArray(serverList) && serverList.length) {
    // normalize server items to behave like demo (no change needed usually)
    currentCourses = serverList;
    const active = document.querySelector('.chip.active')?.getAttribute('data-tag') || 'all';
    const q = document.getElementById('searchInput')?.value || '';
    applyFilterAndSearch(active, q);
  }

  // Start polling fallback
  setInterval(async () => {
    const fresh = await fetchCoursesFromServer();
    if (Array.isArray(fresh)) {
      currentCourses = fresh;
      const active = document.querySelector('.chip.active')?.getAttribute('data-tag') || 'all';
      const q = document.getElementById('searchInput')?.value || '';
      applyFilterAndSearch(active, q);
    }
  }, POLL_INTERVAL_MS);

  // Try SSE for real-time updates
  initSSEFallback();
}

// SSE listener with graceful fallback if it fails
function initSSEFallback() {
  if (!window.EventSource) {
    console.log('EventSource not supported — using poll fallback.');
    return;
  }
  try {
    const es = new EventSource('/api/stream');
    es.onopen = () => console.log('SSE connected');
    es.onerror = (e) => {
      console.warn('SSE error — falling back to polling', e);
    };
    es.addEventListener('course_added', (ev) => {
      try {
        const course = JSON.parse(ev.data);
        // ensure our currentCourses uses server object shape
        currentCourses.unshift(course);
        prependCourseToDOM(course);
      } catch (err) {
        console.error('Failed to parse SSE course event', err);
      }
    });
  } catch (err) {
    console.warn('SSE init failed', err);
  }
}

// ---------- Animated counters, testimonials, theme toggle (kept from your file) ----------
function animateCounter(el, start, end, duration) {
  const range = end - start;
  let startTime = null;
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const value = Math.floor(start + (range * progress));
    el.textContent = value.toLocaleString('en-IN');
    if (progress < 1) window.requestAnimationFrame(step);
  }
  window.requestAnimationFrame(step);
}
let countersSeen = false;
function checkCounters() {
  if (countersSeen) return;
  const rect = document.querySelector('.stats')?.getBoundingClientRect();
  if (!rect) return;
  if (rect.top < window.innerHeight) {
    countersSeen = true;
    animateCounter(document.getElementById('studentsCounter'), 0, 120000, 1200);
    animateCounter(document.getElementById('liveCounter'), 0, 840, 1000);
    animateCounter(document.getElementById('tutorsCounter'), 0, 50, 900);
  }
}
window.addEventListener('scroll', checkCounters);
window.addEventListener('load', checkCounters);

const testimonials = [
  '“I improved my JEE rank from 12k → 3.1k thanks to QuickTutor!” — Ankit',
  '“Excellent doubt-solving sessions — helped me clear concepts fast.” — Meera',
  '“Short topic videos saved me hours of study time.” — Saurav',
  '“The practice tests are similar to real exams; very helpful.” — Deepa'
];
let testiIndex = 0;
const testiText = document.getElementById('testiText');
function advanceTesti() {
  testiIndex = (testiIndex + 1) % testimonials.length;
  if (testiText) {
    testiText.style.opacity = 0;
    setTimeout(() => { testiText.textContent = testimonials[testiIndex]; testiText.style.opacity = 1; }, 230);
  }
}
setInterval(advanceTesti, 3600);

// theme toggle
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const html = document.documentElement;
    if (html.classList.contains('light')) {
      html.classList.remove('light');
      themeToggle.textContent = '🌙';
    } else {
      html.classList.add('light');
      themeToggle.textContent = '☀️';
    }
  });
}

// ---------- Init everything ----------
(function initAll() {
  setupFiltersAndSearch();
  initialRender();      // render demo courses fast
  initCourseSync();     // replace with server data when available + start sync (polling + SSE)
})();
