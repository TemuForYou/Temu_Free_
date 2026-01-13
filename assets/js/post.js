/* TFY post renderer (loads posts.json + posts/<slug>.html + coupons.json) */
(async function () {
  const $ = (sel, root=document) => root.querySelector(sel);

  async function getJSON(url) {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Fetch failed: ${url} (${res.status})`);
    return await res.json();
  }

  async function getText(url) {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Fetch failed: ${url} (${res.status})`);
    return await res.text();
  }

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[m]));
  }

  function getSlug() {
    const u = new URL(location.href);
    return u.searchParams.get("slug") || "";
  }

  function flattenPosts(categories) {
    const out = [];
    for (const c of (categories || [])) for (const it of (c.items || [])) out.push({ ...it, categoryId: c.id, categoryName: c.name });
    return out;
  }

  function renderNav(catName) {
    const nav = $("#postNav");
    if (!nav) return;
    nav.innerHTML = `<a class="navlink" href="./index.html">홈</a><span class="navsep">·</span><span class="navcurrent">${esc(catName || "")}</span>`;
  }

  function renderCoupons(coupons) {
    const list = $("#postCouponList");
    if (!list) return;

    list.innerHTML = (coupons || []).map((c) => {
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

  try {
    const slug = getSlug();
    if (!slug) throw new Error("Missing slug");

    const postsData = await getJSON("./data/posts.json");
    const all = flattenPosts(postsData.categories || []);
    const post = all.find(p => p.slug === slug);
    if (!post) throw new Error("Post not found: " + slug);

    renderNav(post.categoryName);

    // meta / title / desc
    const meta = $("#postMeta");
    const title = $("#postTitle");
    const desc = $("#postDesc");
    if (meta) meta.textContent = `TFY 편집팀 · ${post.updated || ""} · 업데이트: ${post.updateNote || "상시"}`;
    if (title) title.textContent = post.title || "";
    if (desc) desc.textContent = post.desc || "";

    document.title = `TFY · ${post.title || "Post"}`;

    // body
    const body = $("#postBody");
    const html = await getText(`./posts/${encodeURIComponent(slug)}.html`);
    if (body) body.innerHTML = html;

    // coupons
    const coupons = await getJSON("./data/coupons.json");
    renderCoupons(coupons);

  } catch (err) {
    console.error(err);
    const root = $("#postRoot");
    if (root) {
      root.innerHTML = `
        <div class="post__error">
          <h1>글을 불러오지 못했습니다</h1>
          <p>slug 또는 파일 경로를 확인해주세요. (예: posts/&lt;slug&gt;.html)</p>
          <p style="opacity:.8">${esc(err.message || String(err))}</p>
          <p><a href="./index.html">메인으로 돌아가기</a></p>
        </div>
      `;
    }
  }
})();
