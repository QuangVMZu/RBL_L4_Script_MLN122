(() => {
  'use strict';
  const data=window.RBL;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let current=0, elapsed=0, started=0, interval=null, font=21;
  try{const stored=Number(localStorage.getItem('rbl-note-font'));if(stored>=17&&stored<=30)font=stored;}catch(_){}
  function hashIndex(){const m=location.hash.match(/^#(?:trang-)?(\d+)$/);return m?Math.min(19,Math.max(0,Number(m[1])-1)):0;}
  function clock(){const sec=Math.floor(elapsed+(interval?(performance.now()-started)/1000:0));$('elapsed').textContent=`${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;}
  function pause(){if(interval){elapsed+=(performance.now()-started)/1000;clearInterval(interval);interval=null;}$('timer-toggle').textContent='Tiếp tục';$('timer-toggle').classList.remove('running');clock();}
  function reset(){if(interval)clearInterval(interval);interval=null;elapsed=0;started=0;$('timer-toggle').textContent='Bắt đầu';$('timer-toggle').classList.remove('running');clock();}
  function toggleTimer(){if(interval){pause();return;}started=performance.now();interval=setInterval(clock,200);$('timer-toggle').textContent='Tạm dừng';$('timer-toggle').classList.add('running');clock();}
  function setFont(v){font=Math.min(30,Math.max(17,v));document.documentElement.style.setProperty('--speech-size',`${font}px`);try{localStorage.setItem('rbl-note-font',String(font));}catch(_){}$('font-down').disabled=font===17;$('font-up').disabled=font===30;}
  function show(index,write=true,scroll=true){
    current=Math.min(19,Math.max(0,index));const s=data.slides[current],g=data.groups[s.part];reset();
    $('current-speaker').innerHTML=`${esc(g.name)}<small>${esc(g.id)} · Phần ${s.part+1}/5</small>`;
    $('page-meta').textContent=`TRANG ${String(s.n).padStart(2,'0')} / 20 · ${g.title.toUpperCase()} · GỢI Ý ${s.seconds} GIÂY`;
    $('page-title').textContent=s.title;$('page-summary').textContent=s.summary;
    $('speech').innerHTML=s.speech.map(p=>`<p>${esc(p)}</p>`).join('');
    $('transition').textContent=s.transition;
    const handoff=s.n%4===0&&s.n<20;
    $('transition-label').textContent=handoff?`Chuyển sang ${data.groups[s.part+1].name}`:s.n===20?'Kết thúc':'Câu chuyển trang';
    document.querySelector('.handoff').classList.toggle('person-change',handoff);
    $('cue').textContent=s.cue;$('question').textContent=s.question;$('answer').textContent=s.answer;
    $('references').innerHTML=s.refs.length?s.refs.map(n=>{const r=data.sources[n-1];return `<a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" title="${esc(r.title)}">[${r.n}] ${esc(r.short)} ↗</a>`;}).join(''):'<small>Báo cáo nhóm trong ZIP, các thẻ làm việc MLN2 và hướng dẫn học phần.</small>';
    const link=`../RBL_L4_Thuyet_Trinh_MLN122/index.html#trang-${s.n}`;$('open-deck').href=link;$('preview-link').href=link;
    $('slide-preview').src=`assets/trang-${String(s.n).padStart(2,'0')}.png`;$('slide-preview').alt=`Trang ${s.n}: ${s.title}`;
    $('page-counter').textContent=`${String(s.n).padStart(2,'0')} / 20`;$('prev').disabled=current===0;$('next').disabled=current===19;
    document.querySelectorAll('.group-button').forEach((b,i)=>{b.classList.toggle('active',i===s.part);b.setAttribute('aria-current',i===s.part?'step':'false');});
    $('page-list').innerHTML=data.slides.filter(v=>v.part===s.part).map(v=>`<button class="page-link ${v.n===s.n?'active':''}" data-page="${v.n}" ${v.n===s.n?'aria-current="page"':''}><span>${String(v.n).padStart(2,'0')}</span>${esc(v.title)}</button>`).join('');
    document.title=`Lời nói ${String(s.n).padStart(2,'0')} · ${g.short} · RBL L4`;
    if(write){try{history.replaceState(null,'',`#trang-${s.n}`);}catch(_){location.hash=`trang-${s.n}`;}}
    document.body.classList.remove('menu-open');if(scroll)window.scrollTo({top:0,behavior:'instant'});
  }
  $('group-list').innerHTML=data.groups.map((g,i)=>`<button class="group-button" data-group="${i}"><span class="num">${String(i+1).padStart(2,'0')}</span><div><strong>${esc(g.name)}</strong><small>${esc(g.title)}<br>Trang ${g.start}–${g.end} · khoảng 4 phút</small></div></button>`).join('');
  $('group-list').addEventListener('click',e=>{const b=e.target.closest('[data-group]');if(b)show(Number(b.dataset.group)*4);});
  $('page-list').addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(b)show(Number(b.dataset.page)-1);});
  $('prev').addEventListener('click',()=>show(current-1));$('next').addEventListener('click',()=>show(current+1));
  $('timer-toggle').addEventListener('click',toggleTimer);$('timer-reset').addEventListener('click',reset);
  $('font-up').addEventListener('click',()=>setFont(font+1));$('font-down').addEventListener('click',()=>setFont(font-1));
  $('focus-button').addEventListener('click',()=>{const on=document.body.classList.toggle('focus-mode');$('focus-button').setAttribute('aria-pressed',String(on));$('focus-button').textContent=on?'Hiện đầy đủ':'Tập trung';});
  $('mobile-menu').addEventListener('click',()=>{const on=document.body.classList.toggle('menu-open');$('mobile-menu').setAttribute('aria-expanded',String(on));});
  $('print-button').addEventListener('click',()=>window.print());
  document.addEventListener('keydown',e=>{if(e.ctrlKey||e.altKey||e.metaKey||e.target.closest('input,textarea,select,[contenteditable="true"]'))return;if(e.key==='ArrowRight'){e.preventDefault();show(current+1);}else if(e.key==='ArrowLeft'){e.preventDefault();show(current-1);}else if(/^[1-5]$/.test(e.key)){show((Number(e.key)-1)*4);}else if(e.key==='Escape'){document.body.classList.remove('menu-open');}});
  window.addEventListener('hashchange',()=>show(hashIndex(),false));
  $('print-all').innerHTML='<div class="print-warning">Lời nói tham khảo cho 20 trang, 5 người, mỗi người 4 trang. Mốc thời gian là gợi ý tập luyện, không phải thời lượng đã đo. Có AI hỗ trợ; không tính là phần tự viết không AI.</div>'+data.slides.map(s=>{const g=data.groups[s.part];return `<article class="print-note"><p class="meta">${esc(g.name)} · ${g.id} · Phần ${s.part+1}/5 · Trang ${s.n}/20 · ${s.seconds} giây gợi ý</p><h2>${esc(s.title)}</h2>${s.speech.map(p=>`<p>${esc(p)}</p>`).join('')}<p class="print-transition">${esc(s.transition)}</p><h3>Điểm cần nhớ</h3><p class="print-extra">${esc(s.cue)}</p><h3>Khi được hỏi: ${esc(s.question)}</h3><p class="print-extra">${esc(s.answer)}</p><p class="print-ref">Nguồn: ${s.refs.map(n=>{const r=data.sources[n-1];return `<a href="${esc(r.url)}">[${n}] ${esc(r.short)}</a>`;}).join(' · ')||'Báo cáo và các tài liệu làm việc của nhóm.'}</p></article>`;}).join('');
  setFont(font);show(hashIndex(),false,false);
})();
