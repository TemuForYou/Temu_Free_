(() => {
  function tfyShuffle(arr) {
    return arr
      .map(v => ({ v, r: Math.random() }))
      .sort((a, b) => a.r - b.r)
      .map(o => o.v);
  }

  function tfyWeightedPick(arr, n) {
    const pool = [];
    arr.forEach(c => {
      const w = Math.max(1, Number(c.weight || 1));
      for (let i = 0; i < w; i++) pool.push(c);
    });
    return tfyShuffle(pool).slice(0, n);
  }

  function tfyNormalizeCoupons(raw) {
    const arr = Array.isArray(raw) ? raw : [];
    const norm = arr.map(c => ({
      title: c.title ?? c.label ?? '',
      link: c.link ?? c.url ?? '',
      code: c.code ?? '',
      tag: c.tag ?? '',
      emoji: c.emoji ?? '🎁',
      type: c.type ?? c.audience ?? 'all',
      weight: c.weight ?? 1
    }));
    return norm.filter(c => c.title && c.code);
  }

  function tfyCopy(text) {
    if (!text) return;
    navigator.clipboard?.writeText(text).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    });
  }

  function tfyRenderCouponCard(c) {
    const el = document.createElement('div');
    el.className = 'coupon-card';

    const audienceLabel = (c.type === 'new')
      ? '신규 앱 사용자'
      : (c.type === 'all' ? '모든 사용자' : c.type);

    el.innerHTML = `
      <div class="coupon-left">
        <div class="coupon-icon" aria-hidden="true">${c.emoji || '🎁'}</div>
        <div class="coupon-meta">
          <div class="coupon-title">${c.title}</div>
          <div class="coupon-sub">
            <span class="code-pill">CODE&nbsp;${c.code}</span>
            ${c.tag ? `<span class="tag ${c.tag.includes('신규') ? 'todo' : ''}">${c.tag}</span>` : ''}
            ${audienceLabel ? `<span class="tag">${audienceLabel}</span>` : ''}
          </div>
        </div>
      </div>

      <div class="coupon-actions">
        <button class="btn" data-copy>복사</button>
        <button class="btn primary" data-go>이동</button>
      </div>
    `;

    el.querySelector('[data-copy]').addEventListener('click', () => tfyCopy(c.code));
    el.querySelector('[data-go]').addEventListener('click', () => {
      if (!c.link) return;
      window.open(c.link, '_blank', 'noopener,noreferrer');
    });

    return el;
  }

  async function tfyLoadCouponsJson(path) {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load coupons json');
    return res.json();
  }

  async function tfyMountCouponPanel(listSel = '[data-coupon-list]', jsonPath = './data/coupons.json') {
    const list = document.querySelector(listSel);
    if (!list) return;

    const raw = await tfyLoadCouponsJson(jsonPath);
    const coupons = tfyNormalizeCoupons(raw);

    // 우측 패널: 6개 고정 노출 (가중치 섞기)
    const picked = tfyWeightedPick(coupons, 6);

    list.innerHTML = '';
    picked.forEach(c => list.appendChild(tfyRenderCouponCard(c)));
  }

  // 전역
  window.tfyMountCouponPanel = tfyMountCouponPanel;
})();
