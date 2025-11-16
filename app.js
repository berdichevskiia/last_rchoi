// app.js — логика интерфейса: рендер, skeleton, анимации, off-canvas, локальное хранилище
(()=>{
  // данные
  const books = [
    {id:1,title:'Мастер и Маргарита',author:'М. Булгаков',genre:'Классика',year:1967},
    {id:2,title:'Преступление и наказание',author:'Ф. Достоевский',genre:'Классика',year:1866},
    {id:3,title:'Норвежский лес',author:'Х. Мураками',genre:'Современная проза',year:1987},
    {id:4,title:'Чудный остров',author:'Жюль Верн',genre:'Приключения',year:1874},
    {id:5,title:'Чистый код',author:'Р. Мартин',genre:'Техническая литература',year:2008},
    {id:6,title:'Приключения Тома Сойера',author:'М. Твен',genre:'Классика',year:1876},
    {id:7,title:'Алгоритмы: построение и анализ',author:'Т. Кормен',genre:'Техническая литература',year:2009}
  ];

  // helpers
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  // toast
  let toastEl = document.getElementById('toast');
  if(!toastEl){ toastEl = document.createElement('div'); toastEl.id='toast'; document.body.appendChild(toastEl); }
  function showToast(msg, ms=1800){ toastEl.textContent=msg; toastEl.classList.add('show'); setTimeout(()=>toastEl.classList.remove('show'), ms); }

  // Off-canvas menu
  const mobileMenu = document.getElementById('mobileMenu');
  const openMenu = document.getElementById('openMenu');
  const closeMenu = document.getElementById('closeMenu');
  openMenu && openMenu.addEventListener('click', ()=>{ if(mobileMenu) mobileMenu.classList.remove('hidden'); document.body.style.overflow='hidden'; });
  closeMenu && closeMenu.addEventListener('click', ()=>{ if(mobileMenu) mobileMenu.classList.add('hidden'); document.body.style.overflow=''; });
  // close when clicking backdrop
  if(mobileMenu) mobileMenu.addEventListener('click', (e)=>{ if(e.target===mobileMenu){ mobileMenu.classList.add('hidden'); document.body.style.overflow=''; } });

  // Local storage keys
  const BORROW_KEY = 'demo_borrowed_v2';
  const EVENTS_KEY = 'demo_events_v2';

  function getBorrowed(){ try{ return JSON.parse(localStorage.getItem(BORROW_KEY)||'[]') }catch(e){return []} }
  function setBorrowed(a){ localStorage.setItem(BORROW_KEY, JSON.stringify(a)); }
  function getEvents(){ try{ return JSON.parse(localStorage.getItem(EVENTS_KEY)||'[]') }catch(e){return []} }
  function setEvents(a){ localStorage.setItem(EVENTS_KEY, JSON.stringify(a)); }

  // Render skeleton while "loading"
  const bookListEl = document.getElementById('bookList');
  function showSkeleton(count=4){ if(!bookListEl) return; bookListEl.innerHTML=''; for(let i=0;i<count;i++){ const s=document.createElement('div'); s.className='card skel-card skeleton'; bookListEl.appendChild(s); } }

  // Render books with small staged animation
  function renderBooks(){
    if(!bookListEl) return;
    bookListEl.innerHTML='';
    // simulate network latency to show skeleton
    showSkeleton(4);
    setTimeout(()=>{
      bookListEl.innerHTML='';
      books.forEach((b, idx)=>{
        const el=document.createElement('div'); el.className='book-card animate-fade-up';
        el.innerHTML = `
          <div class='cover' aria-hidden='true'>${b.title.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()}</div>
          <div class='meta'>
            <p class='title'>${escapeHtml(b.title)}</p>
            <p class='sub'>${escapeHtml(b.author)} • ${b.genre} • ${b.year}</p>
          </div>
          <div>
            <button class='btn btn-primary borrow' data-id='${b.id}'>Выдать</button>
          </div>`;
        bookListEl.appendChild(el);
        // staggered reveal
        requestAnimationFrame(()=>{ setTimeout(()=>el.classList.add('in-view'), 80*idx); });
      });
      attachBookHandlers();
    }, 700);
  }

  function attachBookHandlers(){ $$('.borrow').forEach(btn=>{ btn.onclick = async ()=>{
      const id = +btn.dataset.id; btn.disabled = true; const old = btn.textContent; btn.textContent = '...';
      await delay(400); // simulate action
      toggleBorrow(id);
      btn.disabled = false; btn.textContent = old;
    }; }); }

  function toggleBorrow(id){ const arr=getBorrowed(); const idx=arr.indexOf(id); if(idx===-1){ arr.push(id); setBorrowed(arr); showToast('Книга выдана'); } else { arr.splice(idx,1); setBorrowed(arr); showToast('Книга возвращена'); } renderBorrowed(); }

  const borrowedBox = document.getElementById('actionMessage');
  function renderBorrowed(){ if(!borrowedBox) return; const arr=getBorrowed(); if(!arr.length){ borrowedBox.classList.add('hidden'); borrowedBox.textContent=''; return; } borrowedBox.classList.remove('hidden'); const names = arr.map(id=>books.find(b=>b.id===id)?.title||'').join(', '); borrowedBox.textContent = 'У вас: '+names; }

  // --- Modal: create if absent ---
  function ensureModal(){
    let modal = document.getElementById('eventModal');
    if(modal) return modal;
    modal = document.createElement('div'); modal.id='eventModal'; modal.className='fixed inset-0 bg-black bg-opacity-40 hidden flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class='bg-white p-6 rounded-2xl shadow-xl w-80 animate-fade-up' role='dialog' aria-modal='true' aria-labelledby='eventModalTitle'>
        <h3 id='eventModalTitle' class='text-lg font-semibold mb-3'>Запись на событие</h3>
        <form id='eventFormModal' class='flex flex-col gap-3'>
          <input type='text' id='eventName' placeholder='Ваше имя' class='border p-2 rounded' required />
          <input type='text' id='eventTitle' placeholder='Название события' class='border p-2 rounded' required />
          <div class='flex justify-end gap-2 mt-2'>
            <button type='button' id='cancelEvent' class='btn btn-ghost'>Отмена</button>
            <button type='submit' class='btn btn-primary'>Записаться</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(modal);
    return modal;
  }

  // open modal
  function openEventModal(prefillTitle=''){
    const modal = ensureModal();
    modal.classList.remove('hidden');
    document.body.style.overflow='hidden';
    const nameInput = modal.querySelector('#eventName');
    const titleInput = modal.querySelector('#eventTitle');
    nameInput.value = '';
    titleInput.value = prefillTitle;
    nameInput.focus();
  }

  function closeEventModal(){ const modal = document.getElementById('eventModal'); if(!modal) return; modal.classList.add('hidden'); document.body.style.overflow=''; }

  // wire modal events
  function wireModal(){ const modal = ensureModal();
    modal.addEventListener('click', (e)=>{ if(e.target === modal) closeEventModal(); });
    const cancel = modal.querySelector('#cancelEvent'); cancel && cancel.addEventListener('click', ()=>closeEventModal());
    const form = modal.querySelector('#eventFormModal');
    form && form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const name = form.querySelector('#eventName').value.trim();
      const title = form.querySelector('#eventTitle').value.trim();
      if(!name || !title){ showToast('Заполните поля'); return; }
      // simulate processing
      const submitBtn = form.querySelector("button[type='submit']");
      submitBtn.disabled = true; const prev = submitBtn.textContent; submitBtn.textContent = '...';
      setTimeout(()=>{
        const arr = getEvents(); arr.push({name, event:title, time: new Date().toLocaleString()}); setEvents(arr);
        submitBtn.disabled = false; submitBtn.textContent = prev;
        closeEventModal();
        const message = document.getElementById('eventMessage'); if(message){ message.classList.remove('hidden'); message.textContent = `Записано: ${name} — ${title}`; }
        showToast('Вы успешно записаны');
      }, 500);
    });
  }

  // replace earlier prompt-based flow: show modal when register button clicked
  const registerBtn = document.getElementById('registerEvent');
  if(registerBtn){ registerBtn.addEventListener('click', ()=>{
    // optionally prefill with suggested event
    openEventModal('Авторская встреча — 2025-12-01');
    wireModal();
  }); }

  // util
  function delay(ms){ return new Promise(res=>setTimeout(res, ms)); }
  function escapeHtml(s){ return String(s).replace(/[&<>\"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]); }

  // initial
  document.addEventListener('DOMContentLoaded', ()=>{
    renderBooks(); renderBorrowed();
  });

})();
