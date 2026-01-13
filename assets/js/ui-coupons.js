(async function () {
  const listEl = document.getElementById("floatingCouponList");
  const ctaBtn = document.getElementById("couponCtaBtn");
  const toggleBtn = document.getElementById("toggleInertia");

  if (!listEl) return;

  // 관성(부드럽게 뒤따라오는) 기본 ON
  let inertiaOn = true;

  // 쿠폰 데이터 로드
  async function loadCoupons() {
    const res = await fetch("./data/coupons.json", { cache: "no-store" });
    if (!res.ok) throw new Error("coupons.json load failed");
    return await res.json();
  }

  // 간단한 셔플
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // 복사
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      return true;
    }
  }

  function renderCard(item) {
    const wrap = document.createElement("div");
    wrap.className = "coupon-card";

    wrap.innerHTML = `
      <div class="coupon-row">
        <div class="coupon-left">
          <div class="coupon-ico">${item.icon || "🎁"}</div>
          <div class="coupon-text">
            <div class="coupon-title">${item.title}</div>
            <div class="coupon-sub">${item.note || ""}</div>
          </div>
        </div>
        <div class="coupon-right">
          <span class="code-badge">CODE ${item.code}</span>
          <button class="btn btn-ghost" type="button" data-act="copy">복사</button>
          <button class="btn btn-primary" type="button" data-act="go">이동</button>
        </div>
      </div>
    `;

    wrap.querySelector('[data-act="copy"]').addEventListener("click", async () => {
      const ok = await copyText(item.code);
      if (ok) {
        // 가벼운 피드백 (텍스트는 UI에 넣지 않음)
        wrap.style.transform = "translateY(-1px)";
        setTimeout(() => (wrap.style.transform = "translateY(0)"), 140);
      }
    });

    wrap.querySelector('[data-act="go"]').addEventListener("click", () => {
      if (item.url) window.open(item.url, "_blank", "noopener,noreferrer");
    });

    return wrap;
  }

  function mountCoupons(items) {
    listEl.innerHTML = "";
    items.forEach((it) => listEl.appendChild(renderCard(it)));
  }

  // 패널이 커서를 “즉시” 따라오지 않고 부드럽게 뒤따라오는 느낌
  let targetY = 0;
  let currentY = 0;

  function onMove(e) {
    const y = e.clientY;
    // 화면 중앙 기준으로 약간만 반응
    targetY = Math.max(-140, Math.min(140, (y - window.innerHeight / 2) * 0.25));
  }

  function tick() {
    if (inertiaOn) {
      currentY += (targetY - currentY) * 0.08; // 관성
    } else {
      currentY = targetY; // 즉시
    }

    const panel = document.getElementById("sidePanel");
    if (panel) panel.style.transform = `translateY(${currentY}px)`;

    requestAnimationFrame(tick);
  }

  toggleBtn?.addEventListener("click", () => {
    inertiaOn = !inertiaOn;
    toggleBtn.classList.toggle("on", inertiaOn);
  });

  ctaBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("mousemove", onMove, { passive: true });

  // 초기 렌더
  try {
    const all = await loadCoupons();
    // 6개 랜덤 노출
    const picks = shuffle(all).slice(0, 6);
    mountCoupons(picks);
  } catch (e) {
    // fail-safe: 아무것도 안 보여도 레이아웃 깨지지 않게
    listEl.innerHTML = "";
  }

  tick();
})();
