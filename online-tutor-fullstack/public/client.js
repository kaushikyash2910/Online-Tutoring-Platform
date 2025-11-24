async function fetchMe() {
  try {
    const token = localStorage.getItem('qt_access');
    if (!token) return null;

    const r = await fetch('/api/auth/me', {
      credentials: 'include',
      headers: { Authorization: 'Bearer ' + token }
    });

    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

function getLocalUser(){
  try{ return JSON.parse(localStorage.getItem('qt_user') || 'null'); }
  catch(e){ return null; }
}

(async () => {
  const loginBtn = document.getElementById('loginBtn');
  const userDropdown = document.getElementById('userDropdown'); 
  const userBtn = document.getElementById('userBtn'); 
  const dropdownMenu = document.getElementById('dropdownMenu'); 
  const userName = document.getElementById('userName');
  const logoutBtn = document.getElementById('logoutBtn'); 

  let me = await fetchMe();

  if(!me) me = getLocalUser();

  if (me) {
    if(loginBtn) loginBtn.style.display = 'none';

    let wrapper = document.querySelector('.nav-user');
    if(!wrapper){
      wrapper = document.createElement('div');
      wrapper.className = 'nav-user';
      wrapper.style.position = 'relative';

      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.id = 'userBtn';
      btn.textContent = (me.role === 'admin' ? 'Admin' : (me.name || 'Account')) + ' ▾';

      const menu = document.createElement('div');
      menu.id = 'userMenu';
      menu.style.position = 'absolute';
      menu.style.right = '0';
      menu.style.top = '36px';
      menu.style.display = 'none';
      menu.style.padding = '8px';
      menu.style.borderRadius = '8px';
      menu.style.background = 'var(--card)';
      menu.style.boxShadow = '0 6px 18px rgba(0,0,0,0.08)';

      const info = document.createElement('div');
      info.style.padding = '6px 10px';
      info.style.fontSize = '14px';
      info.textContent = me.name ? (me.name + ' (' + me.role + ')') : (me.email || 'Account');

      const logout = document.createElement('div');
      logout.id = 'logoutBtn';
      logout.style.padding = '6px 10px';
      logout.style.cursor = 'pointer';
      logout.style.marginTop = '6px';
      logout.textContent = 'Logout';

      menu.appendChild(info);
      menu.appendChild(logout);
      wrapper.appendChild(btn);
      wrapper.appendChild(menu);

      const navLinks = document.querySelector('.nav-links');
      if(navLinks) navLinks.appendChild(wrapper);
      else document.body.appendChild(wrapper);

      btn.addEventListener('click', ()=>{ menu.style.display = menu.style.display === 'block' ? 'none' : 'block'; });

      logout.addEventListener('click', async ()=>{
        try{
          await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        }catch(e){  }
        localStorage.removeItem('qt_access');
        localStorage.removeItem('qt_user');
       
        window.location.href = '/public/login.html';
      });
    }
  } else {
  
    if(loginBtn){
      loginBtn.style.display = 'inline-block';
      loginBtn.href = '/public/login.html';
      loginBtn.addEventListener('click', (e)=>{  });
    }
    const existing = document.querySelector('.nav-user');
    if(existing) existing.remove();
  }

  
  if(me && me.name){
    localStorage.setItem('qt_user', JSON.stringify({ name: me.name, email: me.email, role: me.role }));
  }
})();

async function loadCourseDropdown(){
  try{
    const r = await fetch('/api/allCourses');
    if(!r.ok) throw new Error('bad courses');
    const courses = await r.json();

    const courseLink = document.querySelector('a[href="#courses"]');
    if(!courseLink) return;

    
    const old = courseLink.querySelector('.courses-dropdown');
    if(old) old.remove();

    const dropdown = document.createElement('div');
    dropdown.className = 'courses-dropdown';
    dropdown.style.position = 'absolute';
    dropdown.style.top = '32px';
    dropdown.style.left = '0';
    dropdown.style.background = 'var(--card)';
    dropdown.style.padding = '10px';
    dropdown.style.borderRadius = '10px';
    dropdown.style.display = 'none';
    dropdown.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    dropdown.style.zIndex = 90;

    if(Array.isArray(courses) && courses.length){
      courses.forEach(c=>{
        const item = document.createElement('div');
        item.textContent = c.title;
        item.style.padding = '6px 10px';
        item.style.cursor = 'pointer';
        item.style.whiteSpace = 'nowrap';
        item.onclick = ()=>{ window.location.hash = '#courses'; alert('Open course: ' + c.title); };
        dropdown.appendChild(item);
      });
    } else {
      const item = document.createElement('div');
      item.textContent = 'No courses';
      item.style.padding = '6px 10px';
      dropdown.appendChild(item);
    }

    courseLink.style.position = 'relative';
    courseLink.appendChild(dropdown);

    courseLink.addEventListener('mouseenter', ()=> dropdown.style.display = 'block');
    courseLink.addEventListener('mouseleave', ()=> dropdown.style.display = 'none');
  }catch(err){
    console.error('Dropdown load error', err);
  }
}

loadCourseDropdown();

setInterval(loadCourseDropdown, 30_000);
