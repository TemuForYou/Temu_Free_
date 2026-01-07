(() => {
  // ====== helpers ======
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const escapeHtml = (s) =>
    String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  async function fetchJSON(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    return res.json();
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ====== IMPORTANT FIX ======
  async function checkFileExists(url) {
    // GitHub Pages / 일부 정적 호스팅은 HEAD 요청을 405로 막는 경우가 있어,
    // HEAD → (실패/405 등) → GET Range(0-0) 순으로 "존재 여부"만 빠르게 확인합니다.
    const bust = (u) => {
      const sep = u.includes("?") ? "&" : "?";
      return `${u}${sep}v=${Date.now()}`;
    };

    // 1) HEAD (가능하면 가장 빠름)
    try {
      const res = await fetch(bust(url), { method: "HEAD", cache: "no-store" });
      if (res.ok) return true;
      // 405/403 등은 서버 정책일 수 있으니 GET으로 한 번 더 확인
      if (![403, 405].includes(res.status)) return false;
    } catch {
      // ignore and fallthrough
    }

    // 2) GET + Range (파일을 전부 받지 않도록 1바이트만 요청)
    try {
      const res = await fetch(bust(url), {
        method: "GET",
        cache: "no-store",
        headers: { Range: "bytes=0-0" },
      });
      // 200(전체) 또는 206(부분)면 존재
      return res.status === 200 || res.status === 206;
    } catch {
      return false;
    }
  }

  // ====== UI render (Index) ======
  function renderCouponSlots(coupons) {
    const wrap = $("#couponSlots");
    if (!wrap) return;

    const slots = $$("#couponSlots .slot");
    if (!slots.length) return;

    // 3개 슬롯은 "섞은 뒤 상위 3개"로 노출
    const picked = shuffle(coupons).slice(0, 3);

    slots.forEach((slotEl, idx) => {
      const c = picked[idx];
      if (!c) return;

      const label = slotEl.querySelector(".label");
      const value = slotEl.querySelector(".value");
      const sub = slotEl.querySelector(".sub");

      if (label) label.textContent = c.title || `쿠폰 슬롯 ${idx + 1}`;
      if (value) value.textContent = c.code || "";
      if (sub) sub.textContent = c.subtitle || "";
      slotEl.dataset.code = c.code || "";
      slotEl.dataset.link = c.link || "";
    });
  }

  function renderCouponSidebar(coupons) {
    const list = $("#couponList");
    if (!list) return;

    const items = shuffle(coupons).slice(0, 6);

    list.innerHTML = items
      .map((c) => {
        const title = escapeHtml(c.title || "혜택");
        const badge = escapeHtml(c.badge || "");
        const code = escapeHtml(c.code || "");
        const link = escapeHtml(c.link || "");

        return `
          <div class="coupon-card" data-code="${code}" data-link="${link}">
            <div class="coupon-left">
              <div class="coupon-title">${title}</div>
              ${badge ? `<div class="coupon-badge">${badge}</div>` : ""}
              <div class="coupon-code">CODE <b>${code}</b></div>
            </div>
            <div class="coupon-actions">
              <button class="btn-copy" type="button">복사</button>
              <button class="btn-go" type="button">이동</button>
            </div>
          </div>
        `;
      })
      .join("");

    // actions
    list.addEventListener("click", async (e) => {
      const card = e.target.closest(".coupon-card");
      if (!card) return;

      const code = card.dataset.code || "";
      const link = card.dataset.link || "";

      if (e.target.classList.contains("btn-copy")) {
        try {
          await navigator.clipboard.writeText(code);
          e.target.textContent = "완료";
          setTimeout(() => (e.target.textContent = "복사"), 900);
        } catch {
          // fallback
          const ta = document.createElement("textarea");
          ta.value = code;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          ta.remove();
          e.target.textContent = "완료";
          setTimeout(() => (e.target.textContent = "복사"), 900);
        }
      }

      if (e.target.classList.contains("btn-go")) {
        if (link) window.open(link, "_blank", "noopener,noreferrer");
      }
    });
  }

  async function renderCategories(data) {
    const cats = $("#cats");
    if (!cats) return;

    // data.categories: [{ id, title, items: [{ title, file, status }] }]
    const categories = Array.isArray(data.categories) ? data.categories : [];

    // 각 아이템이 실제로 존재하는지 확인(업로드 완료 표시/링크 활성)
    // - posts.json의 status가 ready여도 실제 파일이 없다면 준비중 처리
    // - 반대로 파일이 있는데 HEAD 막힘으로 false 되던 문제는 checkFileExists 개선으로 해결
    const checks = [];
    const itemMeta = []; // (catIdx, itemIdx, url)

    categories.forEach((cat, ci) => {
      (cat.items || []).forEach((it, ii) => {
        const file = it.file || "";
        const url = `./posts/${file}`;
        itemMeta.push({ ci, ii, url });
        checks.push(checkFileExists(url));
      });
    });

    const existsArr = await Promise.all(checks);
    let k = 0;

    const catHtml = categories
      .map((cat, ci) => {
        const items = (cat.items || []).map((it, ii) => {
          const exists = existsArr[k++];
          const file = it.file || "";
          const href = `./posts/${file}`;

          // status 기준 + 파일 존재 여부 기준을 함께 사용
          const isReady = (it.status || "").toLowerCase() === "ready" && exists;

          // 화면 문구는 "준비중" 대신 요청하신 톤으로 통일
          const badgeHtml = isReady
            ? `<span class="chip done">완료</span>`
            : `<span class="chip soon">곧 업로드 예정입니다!</span>`;

          const title = escapeHtml(it.title || "");
          const sub = escapeHtml(it.sub || "");

          // 준비중이면 링크 막고, 완료면 링크 활성
          const titleHtml = isReady
            ? `<a class="post-link" href="${href}">${title}</a>`
            : `<span class="post-link disabled">${title}</span>`;

          return `
            <div class="post-row">
              <div class="post-title">
                ${titleHtml}
                ${sub ? `<div class="post-sub">${sub}</div>` : ""}
              </div>
              <div class="post-badge">${badgeHtml}</div>
            </div>
          `;
        });

        const catTitle = escapeHtml(cat.title || "");
        const catEmoji = escapeHtml(cat.emoji || "");
        const catHeader = catEmoji ? `${catEmoji} ${catTitle}` : catTitle;

        return `
          <section class="cat-card" data-cat="${escapeHtml(cat.id || String(ci))}">
            <header class="cat-head">
              <h3 class="cat-title">${catHeader}</h3>
              <button class="cat-scroll" type="button">스크롤</button>
            </header>
            <div class="cat-body">
              ${items.join("")}
            </div>
          </section>
        `;
      })
      .join("");

    cats.innerHTML = catHtml;

    // 각 카테고리 스크롤 버튼
    cats.addEventListener("click", (e) => {
      const btn = e.target.closest(".cat-scroll");
      if (!btn) return;
      const card = btn.closest(".cat-card");
      const body = card?.querySelector(".cat-body");
      if (!body) return;
      body.scrollTo({ top: body.scrollTop + 260, behavior: "smooth" });
    });
  }

  // ====== init ======
  async function init() {
    try {
      const [postsData, couponsData] = await Promise.all([
        fetchJSON("./data/posts.json"),
        fetchJSON("./data/coupons.json"),
      ]);

      const coupons = Array.isArray(couponsData?.coupons)
        ? couponsData.coupons
        : Array.isArray(couponsData)
        ? couponsData
        : [];

      renderCouponSlots(coupons);
      renderCouponSidebar(coupons);
      await renderCategories(postsData);
    } catch (err) {
      console.error(err);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
