(async () => {
  // 1) 우측 쿠폰 패널 로드
  if (window.tfyMountCouponPanel) {
    try {
      await window.tfyMountCouponPanel('[data-coupon-list]', './data/coupons.json');
    } catch (e) {
      // 조용히 실패 처리
    }
  }

  // 2) 카테고리 렌더
  if (window.tfyRenderCategories && document.querySelector('[data-categories]')) {
    try {
      await window.tfyRenderCategories('[data-categories]', './data/posts.json');
    } catch (e) {
      // 조용히 실패 처리
    }
  }

  // 3) 메인 3슬롯(고정 코드 3개) 렌더
  const slotWrap = document.querySelector('[data-main-slots]');
  if (slotWrap) {
    try {
      const res = await fetch('./data/coupons.json', { cache: 'no-store' });
      const raw = await res.json();

      const map = new Map(raw.map(c => [String(c.code), c]));
      const fixedCodes = ['ack263361', 'frw419209', 'alf468043']; // 30% / 1원 / 99%

      const titles = {
        ack263361: '30% 쿠폰',
        frw419209: '1원 상품',
        alf468043: '99% 할인 코드'
      };

      const dots = ['#3b82f6', '#10b981', '#8b5cf6'];

      slotWrap.innerHTML = fixedCodes.map((code, i) => {
        const c = map.get(code) || {};
        const title = titles[code] || (c.title || '쿠폰');
        const sub = '요청대로 고정 삽입';

        return `
          <article class="slotCard">
            <div class="slotTop">
              <span class="slotDot" style="background:${dots[i] || '#3b82f6'}"></span>
              <span class="slotLabel">쿠폰 슬롯 ${i + 1}</span>
            </div>
            <h3 class="slotTitle">${title}</h3>
            <div class="slotCode">${code}</div>
            <p class="slotSub">${sub}</p>
          </article>
        `;
      }).join('');
    } catch (e) {
      // 조용히 실패 처리
    }
  }
})();
