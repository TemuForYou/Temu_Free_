(function () {
  function $(sel) { return document.querySelector(sel); }

  function initIndex({ posts, coupons }) {
    // Sidebar coupons
    window.tfyCoupons?.renderCouponPanel?.(coupons || []);
    // Main 3 slots
    window.tfyCoupons?.renderMainSlots?.(coupons || []);

    // Categories & posts
    const wrap = $("#catWrap");
    if (wrap && typeof window.tfyRenderCategories === "function") {
      window.tfyRenderCategories(posts || [], {
        wrapId: "catWrap",
        tabsId: "catTabs",
      });
    }

    // FAB -> open best coupon bundle (aak74594)
    const fab = $("#fabCta");
    if (fab) {
      const best = (coupons || []).find(c => c.code === "aak74594") || coupons?.[0];
      fab.addEventListener("click", () => window.tfyCoupons?.openLink?.(best?.url));
    }

    // Smooth follow for coupon panel (if available)
    if (typeof window.tfyInitInertiaFollow === "function") {
      window.tfyInitInertiaFollow("#couponPanel", { top: 90 });
    }
  }

  function init() {
    window.addEventListener("tfy:data-ready", (ev) => {
      const detail = ev.detail || {};
      const posts = detail.posts || window.TFY_POSTS || [];
      const coupons = detail.coupons || window.TFY_COUPONS || [];
      initIndex({ posts, coupons });
    });
  }

  init();
})();
