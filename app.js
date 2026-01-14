/* TFY - Main app (index) */
(async function () {
  const $ = (sel, root=document) => root.querySelector(sel);

  // ---------- helpers ----------
  function esc(s){ return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function fmtDate(iso){
    if(!iso) return '';
    // accept YYYY-MM-DD or YYYY.MM.DD
    const t = String(iso).replace(/\./g,'-');
    const d = new Date(t + (t.length===10 ? 'T00:00:00' : ''));
    if(Number.isNaN(d.getTime())) return esc(iso);
    const yy = d.getFullYear();
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    return `${yy}.${mm}.${dd}`;
  }
  async function fetchJSON(url){
    const res = await fetch(url, {cache:'no-store'});
    if(!res.ok) throw new Error(`${url} ${res.status}`);
    return await res.json();
  }

  // ---------- coupons (right panel) ----------
  async function renderCoupons(){
    const root = $('#couponList');
    if(!root) return;

    let data;
    try{
      data = await fetchJSON('data/coupons.json');
    }catch(e){
      root.innerHTML = `<div class="small">쿠폰 데이터를 불러오지 못했습니다.</div>`;
      return;
    }

    const items = Array.isArray(data?.items) ? data.items : [];

    // stable order for UI (you can change later)
    const ordered = items.slice();

    root.innerHTML = ordered.map(c => {
      const title = esc(c.title || '혜택');
      const desc  = esc(c.desc || '');
      const code  = esc(c.code || '');
      const link  = esc(c.link || '#');
      const tag   = esc(c.tag || '');

      return `
        <div class="coupon-item" data-code="${code}" data-link="${link}">
          <div class="coupon-main">
            <div class="coupon-title-row">
              <div class="coupon-title">${title}</div>
              ${tag ? `<span class="coupon-tag">${tag}</span>` : ``}
            </div>
            ${desc ? `<div class="coupon-desc">${desc}</div>` : ``}
          </div>

          <div class="coupon-actions">
            <div class="coupon-code-pill"><span class="pill-label">CODE</span><span class="pill-code">${code}</span></div>
            <button class="btn-chip btn-copy" type="button">복사</button>
            <button class="btn-chip btn-move" type="button">이동</button>
          </div>
        </div>
      `;
    }).join('');

    // event delegation
    root.addEventListener('click', async (e) => {
      const item = e.target.closest('.coupon-item');
      if(!item) return;
      const code = item.dataset.code || '';
      const link = item.dataset.link || '#';

      if(e.target.closest('.btn-copy')){
        try{
          await navigator.clipboard.writeText(code);
          const btn = item.querySelector('.btn-copy');
          if(btn){
            const prev = btn.textContent;
            btn.textContent = '완료';
            setTimeout(()=>btn.textContent = prev, 900);
          }
        }catch(_){
          // fallback
          const ta = document.createElement('textarea');
          ta.value = code;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
        }
      }

      if(e.target.closest('.btn-move')){
        // open in new tab for safety
        window.open(link, '_blank', 'noopener,noreferrer');
      }
    }, {passive:true});
  }

  // ---------- posts / categories ----------
  function groupByCategory(items){
    const map = new Map();
    for(const it of items){
      const cat = it.category || '기타';
      if(!map.has(cat)) map.set(cat, []);
      map.get(cat).push(it);
    }
    return [...map.entries()].map(([title, posts]) => ({title, posts}));
  }

  function postRowHTML(p){
    const done = !!p.done;
    const dateText = done ? fmtDate(p.date) : '· 곧 업로드 예정';
    const couponText = p.hasCoupon ? '· 쿠폰 포함' : '';
    const sub = `<div class="post-sub">${esc(dateText)}${couponText ? ` <span class="muted">${esc(couponText)}</span>` : ''}</div>`;

    const disabledAttr = done ? '' : 'data-disabled="1"';
    const href = done ? `posts/${encodeURIComponent(p.slug)}.html` : 'javascript:void(0)';

    return `
      <div class="post-row" data-href="${href}" ${disabledAttr}>
        <div style="min-width:0">
          <div class="post-title">${esc(p.title)}</div>
          ${sub}
        </div>
        <div class="post-right">
          ${done ? `<span class="tag done">완료</span>` : `<span class="tag todo">준비중</span>`}
        </div>
      </div>
    `;
  }

  async function renderCategories(){
    const wrap = $('#catWrap');
    if(!wrap) return;

    let db;
    try{
      db = await fetchJSON('data/posts.json');
    }catch(e){
      wrap.innerHTML = `<div class="small">포스팅 데이터를 불러오지 못했습니다.</div>`;
      return;
    }

    const items = Array.isArray(db?.items) ? db.items : [];
    const groups = groupByCategory(items);

    wrap.innerHTML = groups.map(g => {
      const rows = g.posts.map(postRowHTML).join('');
      return `
        <section class="cat-block">
          <div class="cat-head">
            <div class="cat-title">${esc(g.title)}</div>
            <div class="cat-sub">클릭하면 글로 이동합니다</div>
          </div>
          <div class="cat-body">
            ${rows || `<div class="small">등록된 글이 없습니다.</div>`}
          </div>
        </section>
      `;
    }).join('');

    wrap.addEventListener('click', (e) => {
      const row = e.target.closest('.post-row');
      if(!row) return;
      if(row.dataset.disabled === '1') return;
      const href = row.dataset.href;
      if(href) window.location.href = href;
    }, {passive:true});
  }

  // run
  await Promise.all([renderCoupons(), renderCategories()]);
})();
