/**
 * TFY Post Renderer
 * - Renders categories list into index.html
 * - Uses posts.json as source of truth
 * - Auto-detects "done" by checking if post file exists (HEAD request)
 */

async function tfyFileExists(url){
  try{
    const res = await fetch(url, { method:'HEAD', cache:'no-store' });
    return res.ok;
  }catch(_){
    return false;
  }
}

function tfyFmtDate(iso){
  if(!iso) return '';
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}.${m}.${day}`;
}

function tfyBuildPostRow(post){
  const tag = post._done ? `<span class="tag done">완료</span>` : `<span class="tag todo">준비중</span>`;
  const trend = post.trend ? `<span class="tag trend">인기</span>` : '';
  const meta = `<div class="post-meta"><span>${tfyFmtDate(post.date)}</span>${post._done ? `<span>· 업데이트 ${tfyFmtDate(post.updated)}</span>` : `<span>· 곧 업로드 예정</span>`}</div>`;

  const href = post._done ? post.file : 'javascript:void(0)';
  const extra = post._done ? `data-open="${post.file}"` : `data-disabled="1"`;

  return `
    <div class="post-row" ${extra}>
      <div style="min-width:0">
        <div class="post-title">${post.title}</div>
        ${meta}
      </div>
      <div style="display:flex; gap:8px; align-items:center">
        ${trend}
        ${tag}
      </div>
    </div>
  `;
}

async function tfyRenderCategories(containerSel){
  const root = document.querySelector(containerSel);
  if(!root) return;

  const data = await tfyLoadPosts();
  const cats = data.categories || [];

  // Determine done/todo by checking file existence (only if status not forced)
  for(const c of cats){
    for(const p of c.items){
      p._done = await tfyFileExists('./' + p.file);
    }
  }

  root.innerHTML = cats.map(cat => {
    const itemsHtml = cat.items.map(tfyBuildPostRow).join('');
    return `
      <div class="cat-card" id="cat-${cat.id}">
        <div class="cat-head">
          <div class="left">
            <div class="cat-badge">${cat.emoji || '🗂️'}</div>
            <div>
              <div class="cat-name">${cat.title}</div>
              <div class="cat-sub">각 카테고리 5개 표시 · 스크롤로 전체 확인</div>
            </div>
          </div>
          <div class="small">목록은 데이터로 관리됩니다</div>
        </div>
        <div class="scroll-box">
          ${itemsHtml}
        </div>
      </div>
    `;
  }).join('');

  root.addEventListener('click', (e)=>{
    const row = e.target.closest('.post-row');
    if(!row) return;
    if(row.getAttribute('data-disabled') === '1') return;
    const file = row.getAttribute('data-open');
    if(file) window.location.href = './' + file;
  });
}

function tfyInitInertiaFollow(panelSel){
  const panel = document.querySelector(panelSel);
  if(!panel) return;
  let target = 0;
  let current = 0;

  function tick(){
    // ease: the smaller the factor, the more it lags behind
    current += (target - current) * 0.08;
    panel.style.transform = `translate3d(0, ${current}px, 0)`;
    requestAnimationFrame(tick);
  }
  window.addEventListener('mousemove', (e)=>{
    // map cursor position to small translate range (lagging feel)
    const h = window.innerHeight || 800;
    const y = e.clientY / h;  // 0..1
    target = (y - 0.5) * 26;  // -13..13px
  }, { passive:true });

  requestAnimationFrame(tick);
}
