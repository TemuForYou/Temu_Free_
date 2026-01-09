/* ui-coupons.js
   - Shared coupon UI for index + post pages
   - Data source: ./data/coupons.json  (fields: title, badge, code, link)
*/
(function () {
  "use strict";

  const DATA_URL = "./data/coupons.json";

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

  function buildCouponItem(c) {
    const el = document.createElement("div");
    el.className = "coupon-item";

    el.innerHTML = `
      <div class="coupon-left">
        <div class="coupon-title">${escapeHTML(c.title || "쿠폰")}</div>
        <div class="coupon-meta">
          <span class="badge">${escapeHTML(c.badge || "")}</span>
          <span class="code">CODE <b>${escapeHTML(c.code || "")}</b></span>
        </div>
      </div>
      <div class="coupon-actions">
        <button class="btn btn-ghost" type="button" data-copy="${escapeAttr(c.code || "")}">복사</button>
        <a class="btn btn-primary" href="${escapeAttr(c.link || "#")}" target="_blank" rel="noopener">이동</a>
      </div>
    `;
    return el;
  }

  function escapeHTML(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
  function escapeAttr(s) {
    return escapeHTML(s).replaceAll("`", "&#96;");
  }

  async function initCouponsPanel(opts = {}) {
    const panel = document.getElementById("couponPanel");
    const body = document.getElementById("couponPanelBody");
    if (!panel || !body) return;

    // Optional: panel toggle
    const toggle = document.getElementById("couponPanelToggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        panel.classList.toggle("is-collapsed");
        toggle.textContent = panel.classList.contains("is-collapsed") ? "열기" : "닫기";
      });
    }

    // Render
    const data = await fetchJSON(DATA_URL);
    const list = shuffle((data && data.coupons) ? data.coupons : []);
    body.innerHTML = "";
    list.forEach((c) => body.appendChild(buildCouponItem(c)));

    // Copy
    body.addEventListener("click", async (e) => {
      const btn = e.target && e.target.closest ? e.target.closest("[data-copy]") : null;
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

    // Smooth follow (inertia) – works for both index aside and post aside
    enableInertiaFollow(panel, opts.followParentSelector || null);
  }

  function enableInertiaFollow(panelEl, parentSelector) {
    // If panel is positioned as sticky in CSS, we still add subtle inertial translate.
    const parent = parentSelector ? document.querySelector(parentSelector) : null;

    let currentY = 0;
    let targetY = 0;
    const maxShift = 28; // subtle

    function tick() {
      currentY += (targetY - currentY) * 0.12;
      panelEl.style.transform = `translate3d(0, ${currentY}px, 0)`;
      requestAnimationFrame(tick);
    }

    function onScroll() {
      // Optional clamp if a parent container exists
      if (parent) {
        const pr = parent.getBoundingClientRect();
        const vTop = 16;
        // aim to keep top within viewport, but clamp inside parent
        const desired = Math.max(0, vTop - pr.top);
        const max = Math.max(0, pr.height - panelEl.offsetHeight - 24);
        targetY = Math.min(max, desired);
      } else {
        // general: small follow based on scroll velocity feel
        const y = window.scrollY || document.documentElement.scrollTop || 0;
        targetY = Math.max(-maxShift, Math.min(maxShift, (y % 200) - 100) / 8);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    requestAnimationFrame(tick);
  }

  // Expose
  window.TFYCoupons = { initCouponsPanel };

  // Auto-init if elements exist
  document.addEventListener("DOMContentLoaded", () => {
    initCouponsPanel({ followParentSelector: null }).catch(() => {});
  });
})();
