/* post-render.js
   - Used by post.html (template)
   - Route:
     1) ?p=<slug> -> loads ./posts/<slug>.html into iframe-like fetch and extracts #postArticle content if present
     2) If opened as a concrete post file (./posts/<slug>.html), it still works because that file includes its own markup.
*/
(function () {
  "use strict";

  const POSTS_URL = "../data/posts.json"; // when called from /posts/*.html
  const POSTS_URL_FROM_ROOT = "./data/posts.json"; // when called from /post.html

  function escapeHTML(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  async function fetchText(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return res.text();
  }

  async function fetchJSON(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return res.json();
  }

  function getQueryParam(name) {
    const u = new URL(window.location.href);
    return u.searchParams.get(name);
  }

  function setCrumb(categoryName) {
    const crumb = document.getElementById("crumb");
    if (!crumb) return;
    crumb.innerHTML = `<span class="crumb-pill">${escapeHTML(categoryName || "")}</span>`;
  }

  function setDocTitle(title) {
    const t = document.getElementById("docTitle");
    if (t) t.textContent = title ? `${title} | TFY` : "TFY";
    document.title = title ? `${title} | TFY` : "TFY";
  }

  async function renderFromTemplate() {
    const root = document.getElementById("postRoot");
    if (!root) return;

    const slug = getQueryParam("p");
    if (!slug) {
      root.innerHTML = `<div class="post-empty">글 주소가 올바르지 않습니다.</div>`;
      return;
    }

    // Load metadata
    const postsURL = window.location.pathname.endsWith("/post.html") ? POSTS_URL_FROM_ROOT : POSTS_URL;
    const meta = await findPostMeta(postsURL, slug);
    if (meta) {
      setCrumb(meta.category);
      setDocTitle(meta.title);
    }

    // Fetch actual post file (full HTML) and extract the article body (#postArticle)
    const html = await fetchText(`./posts/${slug}.html`);
    const doc = new DOMParser().parseFromString(html, "text/html");
    const article = doc.querySelector("#postArticle");
    if (!article) {
      // fallback: use body text
      root.innerHTML = `<div class="post-empty">글 본문을 찾지 못했습니다. (#postArticle)</div>`;
      return;
    }

    root.innerHTML = "";
    root.appendChild(article);

    // Ensure coupons panel is initialized (if needed)
    if (window.TFYCoupons && window.TFYCoupons.initCouponsPanel) {
      window.TFYCoupons.initCouponsPanel({ followParentSelector: ".post-layout" }).catch(() => {});
    }
  }

  async function findPostMeta(postsUrl, slug) {
    try {
      const data = await fetchJSON(postsUrl);
      const cats = data.categories || [];
      for (const c of cats) {
        const items = c.items || [];
        for (const p of items) {
          if (p.slug === slug) return p;
        }
      }
    } catch {}
    return null;
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Only run on template page (post.html). Individual post files already have their own markup.
    if (window.location.pathname.endsWith("/post.html")) {
      renderFromTemplate().catch((e) => console.error(e));
    }
  });
})();
