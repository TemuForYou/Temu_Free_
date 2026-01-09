/* app.js (index)
   - Renders: coupon slots (3), categories (scroll lists), and shared coupon panel
   - Data: ./data/posts.json, ./data/coupons.json
*/
(function () {
  "use strict";

  const POSTS_URL = "./data/posts.json";
  const COUPONS_URL = "./data/coupons.json";

  async function fetchJSON(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
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

  function escapeHTML(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function renderCouponSlots(coupons) {
    const root = document.getElementById("couponSlots");
    if (!root) return;

    const pick = shuffle(coupons).slice(0, 3);
    root.innerHTML = "";

    pick.forEach((c, i) => {
      const card = document.createElement("div");
      card.className = "slot";
      card.innerHTML = `
        <div class="slot-dot slot-dot-${i + 1}"></div>
        <div class="slot-kicker">쿠폰 슬롯 ${i + 1}</div>
        <div class="slot-code">${escapeHTML(c.code || "")}</div>
        <div class="slot-sub">${escapeHTML(c.title || "")}</div>
      `;
      root.appendChild(card);
    });
  }

  function postStatusPill(status) {
    if (status === "done") return `<span class="pill pill-done">완료</span>`;
    if (status === "draft") return `<span class="pill pill-draft">작성중</span>`;
    return `<span class="pill pill-planned">준비중</span>`;
  }

  function renderCategories(categories) {
    const grid = document.getElementById("categoryGrid");
    if (!grid) return;

    grid.innerHTML = "";
    categories.forEach((cat) => {
      const box = document.createElement("div");
      box.className = "cat";

      const items = Array.isArray(cat.items) ? cat.items : [];
      const listHtml = items.map((p) => {
        const href = p.href || `./posts/${p.slug}.html`;
        const disabled = p.status === "planned" ? "aria-disabled='true'" : "";
        const linkTag = p.status === "planned"
          ? `<div class="post-item" ${disabled}>
               <div class="post-title">${escapeHTML(p.title)}</div>
               <div class="post-meta">${postStatusPill(p.status)} <span class="post-date">${escapeHTML(p.date || "")}</span></div>
             </div>`
          : `<a class="post-item" href="${href}">
               <div class="post-title">${escapeHTML(p.title)}</div>
               <div class="post-meta">${postStatusPill(p.status)} <span class="post-date">${escapeHTML(p.date || "")}</span></div>
             </a>`;
        return linkTag;
      }).join("");

      box.innerHTML = `
        <div class="cat-head">
          <div class="cat-title">${escapeHTML(cat.name)}</div>
          <button class="pill pill-ghost cat-scroll" type="button">스크롤</button>
        </div>
        <div class="cat-body">
          ${listHtml || `<div class="empty">등록된 글이 없습니다.</div>`}
        </div>
      `;

      const btn = box.querySelector(".cat-scroll");
      const body = box.querySelector(".cat-body");
      if (btn && body) {
        btn.addEventListener("click", () => {
          body.scrollBy({ top: 220, behavior: "smooth" });
        });
      }

      grid.appendChild(box);
    });
  }

  async function init() {
    const [posts, coupons] = await Promise.all([fetchJSON(POSTS_URL), fetchJSON(COUPONS_URL)]);
    renderCategories(posts.categories || []);
    renderCouponSlots((coupons && coupons.coupons) ? coupons.coupons : []);
  }

  document.addEventListener("DOMContentLoaded", () => {
    init().catch((e) => console.error(e));
  });
})();
