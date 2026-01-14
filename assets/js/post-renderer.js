/**
 * post-renderer.js
 * - Renders category sections and post rows from /data/posts.json
 * - Keeps UI stable: only data changes should affect output
 */

(function () {
  "use strict";

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function tfyEscapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function tfyFmtDate(isoOrYmd) {
    if (!isoOrYmd) return "";
    // Accept YYYY-MM-DD or YYYY.MM.DD or ISO
    const s = String(isoOrYmd);
    if (/^\d{4}\.\d{2}\.\d{2}$/.test(s)) return s;
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s.replaceAll("-", ".");
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}.${m}.${day}`;
  }

  function tfyStatusPill(done, label) {
    const text = label || (done ? "완료" : "준비중");
    // Hide only explicit "(대기)" via CSS selector in base.css
    return `<span class="status-pill" data-status="${tfyEscapeHtml(text)}">${tfyEscapeHtml(text)}</span>`;
  }

  function tfyBuildPostRow(post) {
    const title = tfyEscapeHtml(post.title || "");
    const slug = post.slug || "";
    const href = post.href || (slug ? `posts/${slug}.html` : "#");

    const done = !!post.done;
    const date = tfyFmtDate(post.date || post.updated || post.published);
    const metaParts = [];
    if (date) metaParts.push(date);
    metaParts.push("쿠폰 포함");
    const meta = tfyEscapeHtml(metaParts.filter(Boolean).join(" · "));

    const tag = tfyStatusPill(done, post.statusLabel);

    const disabledAttr = done ? "" : 'aria-disabled="true"';
    const hrefAttr = done ? href : "javascript:void(0)";

    return `
      <a class="post-row" href="${tfyEscapeHtml(hrefAttr)}" ${disabledAttr} data-post-row="${tfyEscapeHtml(slug)}">
        <div class="post-left">
          <div class="post-title">${title}</div>
          <div class="post-meta">${meta}</div>
        </div>
        <div class="post-right">
          ${tag}
          <span class="post-cta">${done ? "보기" : "준비중"}</span>
        </div>
      </a>
    `.trim();
  }

  function tfyBuildCategoryCard(cat) {
    const title = tfyEscapeHtml(cat.title || "");
    const emoji = tfyEscapeHtml(cat.emoji || "🔥");
    const items = Array.isArray(cat.items) ? cat.items : [];
    const max = typeof cat.max === "number" ? cat.max : 5;

    const visible = items.slice(0, max);
    const rows = visible.map(tfyBuildPostRow).join("\n");

    return `
      <section class="cat-card">
        <div class="cat-head">
          <div class="cat-title"><span class="cat-emoji">${emoji}</span><span>${title}</span></div>
          <div class="cat-sub">최신 글 기준으로 정리됩니다.</div>
        </div>
        <div class="cat-body category-list">
          ${rows || `<div class="cat-empty">아직 등록된 글이 없습니다.</div>`}
        </div>
      </section>
    `.trim();
  }

  async function tfyFetchJson(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return res.json();
  }

  async function tfyRenderCategories() {
    const host = qs("[data-categories]");
    if (!host) return;

    try {
      const data = await tfyFetchJson("data/posts.json");
      const categories = Array.isArray(data.categories) ? data.categories : [];
      host.innerHTML = categories.map(tfyBuildCategoryCard).join("\n");
    } catch (e) {
      console.error(e);
      host.innerHTML = `<div class="cat-empty">카테고리 데이터를 불러오지 못했습니다.</div>`;
    }
  }

  // prevent navigation for not-done posts
  function bindPostRowGuards() {
    document.addEventListener("click", (ev) => {
      const a = ev.target && ev.target.closest && ev.target.closest("a.post-row");
      if (!a) return;
      if (a.getAttribute("aria-disabled") === "true") {
        ev.preventDefault();
        ev.stopPropagation();
      }
    });
  }

  window.tfyRenderCategories = tfyRenderCategories;

  document.addEventListener("DOMContentLoaded", () => {
    tfyRenderCategories();
    bindPostRowGuards();
  });
})();
