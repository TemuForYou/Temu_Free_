(async function () {
  async function safeFetchJson(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    return res.json();
  }

  async function loadAll() {
    const [posts, coupons] = await Promise.all([
      safeFetchJson("data/posts.json"),
      safeFetchJson("data/coupons.json"),
    ]);

    window.TFY_POSTS = Array.isArray(posts?.items) ? posts.items : [];
    window.TFY_COUPONS = Array.isArray(coupons?.items) ? coupons.items : [];

    window.dispatchEvent(new CustomEvent("tfy:data-ready", {
      detail: { posts: window.TFY_POSTS, coupons: window.TFY_COUPONS }
    }));
  }

  try {
    await loadAll();
  } catch (e) {
    console.error(e);
    window.TFY_POSTS = window.TFY_POSTS || [];
    window.TFY_COUPONS = window.TFY_COUPONS || [];
    window.dispatchEvent(new CustomEvent("tfy:data-ready", {
      detail: { posts: window.TFY_POSTS, coupons: window.TFY_COUPONS, error: String(e) }
    }));
  }
})();
