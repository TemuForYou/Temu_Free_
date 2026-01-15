
function sanitizeJsonText(text){
  // remove /* */ comments and standalone "..." lines, tolerate trailing commas
  let t = text.replace(/\/\*[\s\S]*?\*\//g, '');
  t = t.replace(/^\s*\.\.\.\s*,?\s*$/gm, '');
  t = t.replace(/,\s*([\]\}])/g, '$1');
  return t.trim();
}
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);

  const els = {
    mainSlots: $("#mainSlots"),
    couponPanel: $("#couponPanel"),
    catTabs: $("#catTabs"),
    postsWrap: $("#postsWrap"),
  };

  const paths = {
    posts: "data/posts.json",
    coupons: "data/coupons.json",
    postPage: "post.html",
  };

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function safeText(str) {
    return String(str ?? "").trim();
  }

  function toPostUrl(slug) {
    const s = safeText(slug);
    if (!s) return "index.html";
    const url = new URL(paths.postPage, window.location.href);
    url.searchParams.set("slug", s);
    return url.toString();
  }

  async function fetchJson(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Fetch failed: ${url} (${res.status})`);
    return res.json();
  }

  function copyText(text) {
    const t = safeText(text);
    if (!t) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(t).catch(() => fallbackCopy(t));
    } else {
      fallbackCopy(t);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand("copy"); } catch (_) {}
    document.body.removeChild(ta);
  }

  // ===== Coupons =====
  function renderMainSlots(coupons) {
    if (!els.mainSlots) return;
    const slots = coupons?.mainSlots ?? [];
    els.mainSlots.innerHTML = slots
      .map((c) => {
        const title = escapeHtml(c.title);
        const desc = escapeHtml(c.desc || "");
        const code = escapeHtml(c.code);
        return `
          <div class="slot">
            <div class="slot__top">
              <span class="slot__dot" aria-hidden="true"></span>
              <div class="slot__title">${title}</div>
            </div>
            <div class="slot__desc">${desc}</div>
            <div class="slot__code">CODE <b>${code}</b></div>
          </div>
        `;
      })
      .join("");
  }

  function renderCouponPanel(coupons) {
    if (!els.couponPanel) return;
    const list = coupons?.sidebar ?? [];

    els.couponPanel.innerHTML = `
      <div class="coupon-head">
        <div class="coupon-head__title">🔥 쿠폰 코드 · 링크</div>
        <div class="coupon-head__hint">클릭 → 코드복사 → 이동 순서로 진행하세요.</div>
      </div>
      <div class="coupon-list">
        ${list
          .map((c) => {
            const title = escapeHtml(c.title);
            const tag = escapeHtml(c.tag || "");
            const code = escapeHtml(c.code);
            const link = safeText(c.link);

            const aria = title ? `aria-label="${title} 이동"` : `aria-label="이동"`;
            return `
              <div class="coupon-item">
                <div class="coupon-title-row">
                  <div class="coupon-title">
                    <span class="coupon-icon" aria-hidden="true">🎁</span>
                    <div class="coupon-title-text">
                      <div class="coupon-title-main">${title}</div>
                      ${tag ? `<div class="coupon-title-sub">${tag}</div>` : `<div class="coupon-title-sub">&nbsp;</div>`}
                    </div>
                  </div>
                  <div class="coupon-actions">
                    <button class="btn btn-copy" type="button" data-copy="${code}">복사</button>
                    <a class="btn btn-go" href="${link}" target="_blank" rel="noopener noreferrer" ${aria}>이동</a>
                  </div>
                </div>

                <div class="coupon-code">
                  <span class="coupon-code-pill">CODE <b>${code}</b></span>
                </div>

                <!-- 다운로드는 링크를 노출하지 않고, 길게 클릭 영역만 제공합니다 -->
                <a class="coupon-link-pill" href="${link}" target="_blank" rel="noopener noreferrer" aria-label="${title} 다운로드 링크로 이동">
                  다운로드
                </a>
              </div>
            `;
          })
          .join("")}
      </div>
    `;

    // bind copy buttons
    els.couponPanel.querySelectorAll("[data-copy]").forEach((btn) => {
      btn.addEventListener("click", () => copyText(btn.getAttribute("data-copy")));
    });
  }

  // ===== Posts / Categories =====
  const CATEGORY_ORDER = [
    "실수·문제 해결형 ① 통관·배송",
    "실수·문제 해결형 ② 주문·결제",
    "진위 검증형 ③ 안전·신뢰",
    "진위 검증형 ④ 혜택·추천",
  ];

  function normalizeDone(item) {
    if (typeof item?.done === "boolean") return item.done;
    if (item?.status === "done") return true;
    if (item?.status === "ready") return false;
    return false;
  }

  function buildBuckets(items) {
    const buckets = new Map(CATEGORY_ORDER.map((k) => [k, []]));
    items.forEach((it, idx) => {
      const tab = safeText(it.tab) || CATEGORY_ORDER[Math.floor(idx / 5)] || CATEGORY_ORDER[0];
      if (!buckets.has(tab)) buckets.set(tab, []);
      buckets.get(tab).push(it);
    });
    return buckets;
  }

  function renderCategoryTabs(buckets) {
    if (!els.catTabs) return;
    els.catTabs.innerHTML = CATEGORY_ORDER.map((label, i) => {
      const count = (buckets.get(label) || []).length;
      const active = i === 0 ? "is-active" : "";
      return `<button class="cat-tab ${active}" type="button" data-cat="${escapeHtml(label)}">${escapeHtml(label)} (${count})</button>`;
    }).join("");

    els.catTabs.querySelectorAll(".cat-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        els.catTabs.querySelectorAll(".cat-tab").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        const cat = btn.getAttribute("data-cat");
        renderPostsList(buckets.get(cat) || []);
      });
    });
  }

  function renderPostsList(list) {
    if (!els.postsWrap) return;

    if (!list.length) {
      els.postsWrap.innerHTML = `<div class="posts-empty">표시할 글이 없습니다.</div>`;
      return;
    }

    els.postsWrap.innerHTML = list
      .map((p) => {
        const title = escapeHtml(p.title);
        const date = escapeHtml(p.date || "");
        const hasCoupon = !!p.hasCoupon;
        const summary = escapeHtml(p.summary || "");
        const slug = safeText(p.slug);
        const done = normalizeDone(p);

        const statusText = done ? "완료" : "준비중";
        const subText = done ? summary : (summary ? summary : "업로드 예정");

        const meta = `${date}${hasCoupon ? " · 쿠폰 포함" : ""}`;

        // Entire row clickable (except if slug missing)
        const href = toPostUrl(slug);

        return `
          <a class="post-item" href="${href}">
            <div class="post-left">
              <div class="post-title">${title}</div>
              <div class="post-meta">${escapeHtml(meta)}</div>
              <div class="post-sub">${subText}</div>
            </div>
            <div class="post-right">
              <span class="post-status ${done ? "is-done" : "is-wait"}">${statusText}</span>
            </div>
          </a>
        `;
      })
      .join("");
  }

  async function init() {
    try {
      const [posts, coupons] = await Promise.all([
        fetchJson(paths.posts),
        fetchJson(paths.coupons),
      ]);

      renderMainSlots(coupons);
      renderCouponPanel(coupons);

      const items = Array.isArray(posts?.items) ? posts.items : [];
      const buckets = buildBuckets(items);

      renderCategoryTabs(buckets);
      renderPostsList(buckets.get(CATEGORY_ORDER[0]) || []);
    } catch (err) {
      console.error(err);

      // Keep UI and show minimal errors inside containers (design untouched)
      if (els.couponPanel) {
        els.couponPanel.innerHTML = `<div class="data-error">데이터 로딩 오류가 발생했습니다.<br/>콘솔(Console)에서 에러 메시지를 확인해주세요.</div>`;
      }
      if (els.postsWrap) {
        els.postsWrap.innerHTML = `<div class="data-error">데이터 로딩 오류가 발생했습니다.<br/>콘솔(Console)에서 에러 메시지를 확인해주세요.</div>`;
      }
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
