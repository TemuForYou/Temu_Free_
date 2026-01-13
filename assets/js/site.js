/* TFY index renderer (single source of truth: /data/posts.json + /data/coupons.json) */
(async function () {
  const $ = (sel, root=document) => root.querySelector(sel);

  const SLOT_COUNT = 3;
  const PER_CAT = 5;

  async function getJSON(url) {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Fetch failed: ${url} (${res.status})`);
    return await res.json();
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[m]));
  }

  function renderTopNav(categories) {
    const nav = $("#topNav");
    if (!nav) return;
    nav.innerHTML = categories.map(c => `<a class="navlink" href="#cat-${esc(c.id)}">${esc(c.name)}</a>`).join("");
  }

  function renderSlots(coupons) {
    const row = $("#slotRow");
    if (!row) return;

    const picks = shuffle(coupons).slice(0, SLOT_COUNT);
    row.innerHTML = picks.map((c, idx) => {
      const title = c.title || c.badge || "쿠폰";
      const code = c.key || "";
      const sub = c.note || "";
      return `
        <div class="slot">
          <div class="slot__k">쿠폰 슬롯 ${idx+1}</div>
          <div class="slot__code">${esc(code)}</div>
          <div class="slot__sub">${esc(title)}</div>
        </div>
      `;
    }).join("");
  }

  function renderCouponPanel(coupons) {
    const list = $("#couponList");
    if (!list) return;

    list.innerHTML = coupons.map((c) => {
      const badge = c.badge || "모든 사용자";
      const title = c.title || "";
      const code = c.key || "";
      const link = c.link || "#";
      return `
        <div class="coupon">
          <div class="coupon__row">
            <div class="coupon__name">${esc(title)}</div>
            <span class="pill">${esc(badge)}</span>
          </div>
          <div class="coupon__code">CODE <b>${esc(code)}</b></div>
          <div class="coupon__actions">
            <button class="btn btn--ghost" data-copy="${esc(code)}" type="button">복사</button>
            <a class="btn btn--accent" href="${esc(link)}" target="_blank" rel="noopener">이동</a>
          </div>
        </div>
      `;
    }).join("");

    list.addEventListener("click", async (e) => {
      const btn = e.target.closest("button[data-copy]");
      if (!btn) return;
      const code = btn.getAttribute("data-copy") || "";
      try {
        await navigator.clipboard.writeText(code);
        btn.textContent = "복사됨";
        setTimeout(() => (btn.textContent = "복사"), 900);
      } catch {
        // fallback
        const ta = document.createElement("textarea");
        ta.value = code;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        btn.textContent = "복사됨";
        setTimeout(() => (btn.textContent = "복사"), 900);
      }
    });
  }

  function statusBadge(item) {
    // data shape supports either `status: "ready"` or `ready: true`
    const ready = (item.status === "ready") || (item.ready === true);
    return ready ? `<span class="badge badge--ready">완료</span>` : `<span class="badge badge--draft">준비중</span>`;
  }

  function itemLink(item) {
    const ready = (item.status === "ready") || (item.ready === true);
    const href = `./post.html?slug=${encodeURIComponent(item.slug)}`;
    return ready ? `<a class="cat-item__link" href="${href}">${esc(item.title)}</a>` : `<span class="cat-item__link cat-item__link--disabled">${esc(item.title)}</span>`;
  }

  function renderCategories(categories) {
    const grid = $("#categoryGrid");
    if (!grid) return;

    grid.innerHTML = categories.map((cat) => {
      const items = (cat.items || []).slice(0, PER_CAT);
      const more = (cat.items || []).length > PER_CAT;

      return `
        <section class="cat-box" id="cat-${esc(cat.id)}">
          <div class="cat-head">
            <div>
              <div class="cat-title">${esc(cat.name)}</div>
              <div class="cat-meta">${esc(cat.hint || "")}</div>
            </div>
            <a class="chip" href="#cat-${esc(cat.id)}" aria-label="Scroll to category">스크롤</a>
          </div>
          <div class="cat-list">
            ${items.map(it => `
              <div class="cat-item">
                <div class="cat-item__title">${itemLink(it)}</div>
                <div class="cat-item__status">${statusBadge(it)}</div>
              </div>
            `).join("")}
            ${more ? `<div class="cat-more">※ 나머지 항목은 추후 추가됩니다</div>` : ``}
          </div>
        </section>
      `;
    }).join("");
  }

  try {
    const [postsData, coupons] = await Promise.all([
      getJSON("./data/posts.json"),
      getJSON("./data/coupons.json")
    ]);

    renderTopNav(postsData.categories || []);
    renderSlots(coupons || []);
    renderCouponPanel(coupons || []);
    renderCategories(postsData.categories || []);
  } catch (err) {
    console.error(err);
    const grid = $("#categoryGrid");
    if (grid) grid.innerHTML = `<div class="error">데이터를 불러오지 못했습니다. 파일 경로(assets/data)와 GitHub Pages 배포 경로를 확인해주세요.</div>`;
  }
})();
