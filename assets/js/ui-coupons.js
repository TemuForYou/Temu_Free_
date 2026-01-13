/**
 * TFY Coupons UI
 * - Loads /data/coupons.json
 * - Randomizes (rotation) for sidebar and modal
 */

async function tfyLoadCoupons(){
  const res = await fetch('./data/coupons.json', { cache: 'no-store' });
  if(!res.ok) throw new Error('coupons.json load failed');
  return await res.json();
}

function tfyShuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function tfyCopy(text){
  if(navigator.clipboard && window.isSecureContext){
    return navigator.clipboard.writeText(text);
  }
  // fallback
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position='fixed';
  ta.style.left='-9999px';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  document.execCommand('copy');
  ta.remove();
  return Promise.resolve();
}

function tfyCouponIcon(label){
  // small deterministic icon by label
  const l = label.toLowerCase();
  if(l.includes('사은품')) return '🎁';
  if(l.includes('세일')) return '⚡';
  if(l.includes('30')) return '🏷️';
  if(l.includes('save')) return '💎';
  return '🧾';
}

function tfyRenderCouponCard(c, withMove=true){
  const icon = tfyCouponIcon(c.label);
  const moveBtn = withMove ? `<button class="btn btn-accent" data-act="move" data-url="${c.url}">이동</button>` : '';
  return `
    <div class="coupon-card">
      <div class="coupon-left">
        <div class="ico">${icon}</div>
        <div style="min-width:0">
          <div class="coupon-title">${c.label}</div>
          <div class="coupon-sub">${c.audience} · ${c.tag}</div>
        </div>
      </div>
      <div class="coupon-actions">
        <span class="coupon-code">${c.code}</span>
        <button class="btn btn-ghost" data-act="copy" data-code="${c.code}">복사</button>
        ${moveBtn}
      </div>
    </div>
  `;
}

async function tfyMountCouponsSidebar(selector, {slots=6}={}){
  const root = document.querySelector(selector);
  if(!root) return;
  const data = await tfyLoadCoupons();
  const picks = tfyShuffle(data).slice(0, slots);

  root.innerHTML = picks.map(c => tfyRenderCouponCard(c, true)).join('');

  root.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if(!btn) return;
    const act = btn.getAttribute('data-act');
    if(act === 'copy'){
      const code = btn.getAttribute('data-code');
      await tfyCopy(code);
      btn.textContent = '복사됨';
      setTimeout(()=> btn.textContent='복사', 900);
    }
    if(act === 'move'){
      const url = btn.getAttribute('data-url');
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  });
}

async function tfyMountCouponsModal(modalSel){
  const modal = document.querySelector(modalSel);
  if(!modal) return;
  const list = modal.querySelector('[data-coupon-list]');
  const data = await tfyLoadCoupons();
  const picks = tfyShuffle(data);

  list.innerHTML = picks.map(c => tfyRenderCouponCard(c, true)).join('');

  list.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if(!btn) return;
    const act = btn.getAttribute('data-act');
    if(act === 'copy'){
      const code = btn.getAttribute('data-code');
      await tfyCopy(code);
      btn.textContent = '복사됨';
      setTimeout(()=> btn.textContent='복사', 900);
    }
    if(act === 'move'){
      const url = btn.getAttribute('data-url');
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  });
}
