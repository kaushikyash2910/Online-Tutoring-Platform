// ---------- demo data (extended) ----------
const demoCourses = [
    {id:1,title:'Fundamentals of Mechanics',tag:'jee',duration:'30 hrs',price:'₹1,299',tutor:'Dr. Aryan',desc:'Concept-first approach with solved problems.'},
    {id:2,title:'Electrostatics Mastery',tag:'jee',duration:'22 hrs',price:'₹999',tutor:'Dr. Aryan',desc:'Live sessions + topic videos.'},
    {id:3,title:'Organic Chemistry Basics',tag:'neet',duration:'28 hrs',price:'₹1,099',tutor:"Ritu Ma'am",desc:'Mechanisms & reaction maps.'},
    {id:4,title:'Coordinate Geometry',tag:'class12',duration:'18 hrs',price:'₹699',tutor:'Sandeep Sir',desc:'Tricks and shortcuts for scoring.'},
    {id:5,title:'Biology — Genetics',tag:'neet',duration:'24 hrs',price:'₹899',tutor:'Anita',desc:'Illustrated notes and tests.'},
    {id:6,title:'Physics: Waves & Oscillations',tag:'class12',duration:'20 hrs',price:'₹749',tutor:'Dr. Aryan',desc:'Wave equations, demos and MCQs.'},
    {id:7,title:'Thermodynamics Concepts',tag:'jee',duration:'26 hrs',price:'₹1,149',tutor:'Manav Sir',desc:'Laws, cycles and problems.'},
    {id:8,title:'Human Physiology Overview',tag:'neet',duration:'16 hrs',price:'₹599',tutor:"Priya Ma'am",desc:'Important systems & diagrams.'},
    {id:9,title:'Probability & Combinatorics',tag:'class12',duration:'20 hrs',price:'₹799',tutor:'Sandeep Sir',desc:'Examples and shortcut methods.'},
  ];
  
  const coursesEl = document.getElementById('courses');
  const chips = Array.from(document.querySelectorAll('.chip'));
  
  // render courses
  function renderCourses(filter='all',query=''){
    coursesEl.innerHTML='';
    const q = (query||'').trim().toLowerCase();
    const list = demoCourses.filter(c=> (filter==='all' || c.tag===filter) && (c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q) || c.tutor.toLowerCase().includes(q)));
    if(list.length===0){
      coursesEl.innerHTML = '<div style="color:var(--muted);padding:20px">No courses found — try a different search or filter.</div>';
      return;
    }
    list.forEach(c=>{
      const card = document.createElement('div');card.className='card';
      card.innerHTML = `
        <div class="meta">
          <div class="title">${c.title}</div>
          <div class="small">${c.price}</div>
        </div>
        <div class="desc">${c.desc}</div>
        <div class="tags"><span class="tag">${c.duration}</span><span class="tag">${c.tutor}</span><span class="tag">${c.tag.toUpperCase()}</span></div>
        <div class="course-actions">
          <button class="btn" data-id="${c.id}" onclick="viewDetails(${c.id})">Details</button>
          <button class="btn primary" onclick="openEnroll(${c.id})">Enroll</button>
        </div>
      `;
      coursesEl.appendChild(card);
    })
  }
  
  window.viewDetails = function(id){
    const c = demoCourses.find(x=>x.id===id);
    alert(c.title + "\n\n" + c.desc + "\nTutor: " + c.tutor + "\nDuration: " + c.duration + "\nPrice: " + c.price);
  }
  
  // filters
  chips.forEach(ch=>{
    ch.addEventListener('click', ()=>{
      chips.forEach(x=>x.classList.remove('active'));
      ch.classList.add('active');
      const tag = ch.getAttribute('data-tag');
      renderCourses(tag, document.getElementById('searchInput').value);
    })
  })
  
  // search
  document.getElementById('searchBtn').addEventListener('click', ()=>{
    const q = document.getElementById('searchInput').value;
    const active = document.querySelector('.chip.active').getAttribute('data-tag');
    renderCourses(active, q);
  });
  document.getElementById('searchInput').addEventListener('keydown', (e)=>{ if(e.key==='Enter') document.getElementById('searchBtn').click(); });
  
  // initial render
  renderCourses();
  
  // --------- Animated counters ----------
  function animateCounter(el, start, end, duration){
    const range = end - start;
    let startTime = null;
    function step(timestamp){
      if(!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const value = Math.floor(start + (range * progress));
      el.textContent = value.toLocaleString('en-IN');
      if(progress < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }
  let countersSeen = false;
  function checkCounters(){
    if(countersSeen) return;
    const rect = document.querySelector('.stats').getBoundingClientRect();
    if(rect.top < window.innerHeight){
      countersSeen = true;
      animateCounter(document.getElementById('studentsCounter'), 0, 120000, 1200);
      animateCounter(document.getElementById('liveCounter'), 0, 840, 1000);
      animateCounter(document.getElementById('tutorsCounter'), 0, 50, 900);
    }
  }
  window.addEventListener('scroll', checkCounters);
  window.addEventListener('load', checkCounters);
  
  // --------- Testimonials slider ----------
  const testimonials = [
    '“I improved my JEE rank from 12k → 3.1k thanks to QuickTutor!” — Ankit',
    '“Excellent doubt-solving sessions — helped me clear concepts fast.” — Meera',
    '“Short topic videos saved me hours of study time.” — Saurav',
    '“The practice tests are similar to real exams; very helpful.” — Deepa'
  ];
  let testiIndex = 0;
  const testiText = document.getElementById('testiText');
  function advanceTesti(){
    testiIndex = (testiIndex + 1) % testimonials.length;
    testiText.style.opacity = 0;
    setTimeout(()=>{ testiText.textContent = testimonials[testiIndex]; testiText.style.opacity = 1; }, 230);
  }
  setInterval(advanceTesti, 3600);
  
  // --------- Theme toggle (class-based) ----------
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.addEventListener('click', ()=>{
    const html = document.documentElement;
    if(html.classList.contains('light')){
      html.classList.remove('light');
      themeToggle.textContent = '🌙';
    } else {
      html.classList.add('light');
      themeToggle.textContent = '☀️';
    }
  });
  