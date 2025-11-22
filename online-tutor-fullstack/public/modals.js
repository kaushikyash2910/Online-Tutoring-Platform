// --------- Enroll modal logic ----------
const modalBack = document.getElementById('modalBack');
const joinNow = document.getElementById('joinNow');
const viewSchedule = document.getElementById('viewSchedule');
const closeModal = document.getElementById('closeModal');
const doEnroll = document.getElementById('doEnroll');

let enrollingCourseId = null;
function openEnroll(id){ enrollingCourseId = id; modalBack.classList.add('show'); modalBack.setAttribute('aria-hidden','false'); }
joinNow && joinNow.addEventListener('click', (e)=>{ e.preventDefault(); openEnroll(null); });
viewSchedule && viewSchedule.addEventListener('click', ()=>openEnroll(2));
closeModal && closeModal.addEventListener('click', ()=>{ modalBack.classList.remove('show'); modalBack.setAttribute('aria-hidden','true'); });

doEnroll && doEnroll.addEventListener('click', ()=>{
  const name = document.getElementById('stuName').value.trim();
  const email = document.getElementById('stuEmail').value.trim();
  if(!name || !email){ alert('Please enter name and email'); return; }
  alert('Thanks ' + name + '! Your request has been received. Tutor will contact you.');
  modalBack.classList.remove('show'); modalBack.setAttribute('aria-hidden','true');
  document.getElementById('stuName').value='';document.getElementById('stuEmail').value='';document.getElementById('stuRoll').value='';document.getElementById('stuMsg').value='';
})

modalBack && modalBack.addEventListener('click', (e)=>{ if(e.target===modalBack) { modalBack.classList.remove('show'); modalBack.setAttribute('aria-hidden','true'); } });

// --------- Login button logic (fixed) ----------
const loginBack = document.getElementById('loginBack');
const loginBtn = document.getElementById('loginBtn');
const closeLogin = document.getElementById('closeLogin');
const doLogin = document.getElementById('doLogin');

// Only open modal if the href="#" (in-page modal logic)
if (loginBtn) {
  loginBtn.addEventListener('click', (e) => {
    const href = loginBtn.getAttribute('href') || "";

    // If link is "#" → open modal (old behavior)
    if (href.trim() === "#" || href.trim() === "") {
      e.preventDefault();
      loginBack.classList.add("show");
      loginBack.setAttribute("aria-hidden", "false");
    }
    // Else → allow navigation to login.html normally
  });
}

closeLogin &&
  closeLogin.addEventListener("click", () => {
    loginBack.classList.remove("show");
    loginBack.setAttribute("aria-hidden", "true");
  });

doLogin &&
  doLogin.addEventListener("click", () => {
    const email = document.getElementById("loginEmail").value.trim();
    const pass = document.getElementById("loginPass").value.trim();
    if (!email || !pass) {
      alert("Enter email and password");
      return;
    }
    alert("Logged in (demo): " + email);
    loginBack.classList.remove("show");
    loginBack.setAttribute("aria-hidden", "true");
    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPass").value = "";
  });

loginBack &&
  loginBack.addEventListener("click", (e) => {
    if (e.target === loginBack) {
      loginBack.classList.remove("show");
      loginBack.setAttribute("aria-hidden", "true");
    }
  });


// --------- Video preview ----------
const videoBack = document.getElementById('videoBack');
const previewIframe = document.getElementById('previewIframe');
const playPreview = document.getElementById('playPreview');
const watchPreviewBtn = document.getElementById('watchPreviewBtn');
const closeVideo = document.getElementById('closeVideo');

function openVideoPreview(){
  previewIframe.src = "https://www.youtube.com/embed/ysz5S6PUM-U?rel=0&modestbranding=1";
  videoBack.classList.add('show'); videoBack.setAttribute('aria-hidden','false');
}
playPreview && playPreview.addEventListener('click', openVideoPreview);
watchPreviewBtn && watchPreviewBtn.addEventListener('click', openVideoPreview);
closeVideo && closeVideo.addEventListener('click', ()=>{ previewIframe.src=''; videoBack.classList.remove('show'); videoBack.setAttribute('aria-hidden','true'); });
videoBack && videoBack.addEventListener('click', (e)=>{ if(e.target===videoBack) { previewIframe.src=''; videoBack.classList.remove('show'); videoBack.setAttribute('aria-hidden','true'); } });

// --------- Upcoming sidebar ----------
const upcomingSidebar = document.getElementById('upcomingSidebar');
const closeSidebar = document.getElementById('closeSidebar');
closeSidebar && closeSidebar.addEventListener('click', ()=>{ upcomingSidebar.style.display='none'; });

function handleSidebarVisibility(){
  if(window.innerWidth < 900) upcomingSidebar.style.display='none';
  else upcomingSidebar.style.display='flex';
}
window.addEventListener('resize', handleSidebarVisibility);
handleSidebarVisibility();

// Accessibility: close modals with Esc
window.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape'){
    [modalBack, loginBack, videoBack].forEach(m=>{
      if(m) m.classList.remove('show');
      if(m) m.setAttribute('aria-hidden','true');
    });
    if(previewIframe) previewIframe.src='';
  }
});
