/* TFY - app.js
   - index.html: 쿠폰 패널 + 포스팅 카테고리 렌더링
   - 주의: "..." 같은 요약표현을 파일 안에 절대 넣지 마세요(스크립트 즉시 깨짐).
*/
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ====== Utils ======
  const withCacheBust = (url) => {
    const u = new URL(url, window.location.href);
    u.searchParams.set("v", String(Date.now()));
    return u.toString();
  };

  async function fetchJSON(url) {
    const res = await fetch(withCacheBust(url), { cache: "no-store" });
    if (!res.ok) throw new Error(`Fetch failed: ${url} (${res.status})`);
    return await res.json();
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {}

    // fallback
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (_) {
      return false;
    }
  }

  function safeText(v) {
    return (v ?? "").toString();
  }

  function formatDateYYYYMMDD(d) {
    // input: "2026-01-03" -> "2026.01.03"
    const s = safeText(d).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    return s.replaceAll("-", ".");
  }

  // ====== Coupons ======
  function renderCoupons(listEl, coupons) {
    if (!listEl) return;

    const items = Array.isArray(coupons?.items) ? coupons.items : [];
    if (!items.length) {
      listEl.innerHTML = `<div class="muted">쿠폰 데이터가 없습니다.</div>`;
      return;
    }

    // 안정적으로 6개만(원하면 늘리면 됨)
    const display = items.slice(0, 6);

    listEl.innerHTML = display
      .map((c, idx) => {
        const title = safeText(c.title);
        const desc = safeText(c.desc);
        const badge = safeText(c.badge);
        const code = safeText(c.code);
        const link = safeText(c.link);
        const icon = safeText(c.icon || "🎁");

        return `
          <div class="coupon-item" data-idx="${idx}">
            <div class="coupon-left">
              <div class="coupon-ico" aria-hidden="true">${icon}</div>
            </div>

            <div class="coupon-main">
              <div class="coupon-title-row">
                <div class="coupon-title">${title}</div>
                ${badge ? `<span class="coupon-badge">${badge}</span>` : ``}
              </div>
              ${desc ? `<div class="coupon-desc">${desc}</div>` : ``}

              <div class="coupon-actions">
                <span class="coupon-code-pill">CODE <b>${code}</b></span>
                <button class="btn btn-ghost js-copy" type="button" data-code="${code}">복사</button>
                <button class="btn btn-primary js-go" type="button" data-link="${link}">이동</button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    // 이벤트 위임
    listEl.addEventListener("click", async (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;

      const copyBtn = t.closest(".js-copy");
      if (copyBtn) {
        const code = safeText(copyBtn.getAttribute("data-code"));
        if (!code) return;
        const ok = await copyText(code);
        copyBtn.classList.add("is-copied");
        copyBtn.textContent = ok ? "복사됨" : "복사 실패";
        setTimeout(() => {
          copyBtn.classList.remove("is-copied");
          copyBtn.textContent = "복사";
        }, 1000);
        return;
      }

      const goBtn = t.closest(".js-go");
      if (goBtn) {
        const link = safeText(goBtn.getAttribute("data-link"));
        if (!link) return;
        window.open(link, "_blank", "noopener,noreferrer");
      }
    });
  }

  // ====== Posts / Categories ======
  function groupByCategory(posts) {
    const map = new Map();
    for (const p of posts) {
      const cat = safeText(p.category || "기타");
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(p);
    }
    return map;
  }

  function renderCategoryTabs(tabsEl, categories, activeCat) {
    if (!tabsEl) return;

    tabsEl.innerHTML = categories
      .map((cat) => {
        const isActive = cat === activeCat;
        return `<button type="button" class="cat-tab ${isActive ? "is-active" : ""}" data-cat="${cat}">${cat}</button>`;
      })
      .join("");

    tabsEl.addEventListener("click", (e) => {
      const btn = e.target instanceof HTMLElement ? e.target.closest(".cat-tab") : null;
      if (!btn) return;
      const cat = safeText(btn.getAttribute("data-cat"));
      if (!cat) return;
      window.dispatchEvent(new CustomEvent("tfy:category", { detail: { cat } }));
    });
  }

  function renderPosts(wrapEl, posts, activeCat) {
    if (!wrapEl) return;

    const filtered = activeCat ? posts.filter((p) => safeText(p.category) === activeCat) : posts;

    wrapEl.innerHTML = filtered
      .map((p) => {
        const title = safeText(p.title);
        const summary = safeText(p.summary);
        const date = formatDateYYYYMMDD(p.updated || p.date);
        const hasCoupon = !!p.hasCoupon;
        const done = !!p.done;
        const href = safeText(p.file || (p.slug ? `posts/${p.slug}.html` : ""));

        const meta = `${date}${hasCoupon ? " · 쿠폰 포함" : ""}`;
        const statusText = done ? "완료" : "준비중";

        return `
          <a class="post-row ${done ? "" : "is-disabled"}" href="${done ? href : "#"}" data-done="${done ? "1" : "0"}" data-href="${href}">
            <div class="post-main">
              <div class="post-title">${title}</div>
              <div class="post-meta">${meta}</div>
              ${summary ? `<div class="post-summary">${summary}</div>` : ``}
            </div>
            <div class="post-right">
              <span class="post-badge ${done ? "is-done" : "is-wait"}">${statusText}</span>
            </div>
          </a>
        `;
      })
      .join("");

    // 준비중 글 클릭 방지
    wrapEl.addEventListener("click", (e) => {
      const a = e.target instanceof HTMLElement ? e.target.closest(".post-row") : null;
      if (!a) return;
      const done = a.getAttribute("data-done") === "1";
      if (!done) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }

  // ====== Init ======
  async function initIndex() {
    const couponList = $("#couponList");
    const catTabs = $("#catTabs");
    const catWrap = $("#catWrap");
    const onIndex = !!catTabs && !!catWrap;

    try {
      const [coupons, posts] = await Promise.all([
        fetchJSON("data/coupons.json"),
        fetchJSON("data/posts.json"),
      ]);

      renderCoupons(couponList, coupons);

      if (onIndex) {
        const items = Array.isArray(posts?.items) ? posts.items : [];
        items.sort((a, b) => safeText(b.updated || b.date).localeCompare(safeText(a.updated || a.date)));

        const grouped = groupByCategory(items);
        const categories = Array.from(grouped.keys());
        let activeCat = categories[0] || "";

        renderCategoryTabs(catTabs, categories, activeCat);
        renderPosts(catWrap, items, activeCat);

        window.addEventListener("tfy:category", (ev) => {
          const cat = ev?.detail?.cat;
          if (!cat) return;
          activeCat = cat;

          $$(".cat-tab", catTabs).forEach((b) =>
            b.classList.toggle("is-active", b.getAttribute("data-cat") === activeCat)
          );

          renderPosts(catWrap, items, activeCat);
        });
      }
    } catch (err) {
      console.error(err);

      if (couponList) {
        couponList.innerHTML = `<div class="muted">쿠폰을 불러오지 못했습니다. (data/coupons.json)</div>`;
      }
      if (catWrap) {
        catWrap.innerHTML = `<div class="muted">카테고리를 불러오지 못했습니다. (data/posts.json)</div>`;
      }
    }
  }

  document.addEventListener("DOMContentLoaded", initIndex);
})();
