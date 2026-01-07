/* TFY app.js (index/post 공용)
 * - 쿠폰 패널: 스크롤 따라오는 sticky 방식
 * - 데이터 키 차이/누락에 강하게(undefined 방지)
 */

const PATHS = {
  posts: "./data/posts.json",
  coupons: "./data/coupons.json",
};

function qs(sel, el = document) { return el.querySelector(sel); }
function qsa(sel, el = document) { return [...el.querySelectorAll(sel)]; }

async function fetchJSON(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
  return await res.json();
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function escapeHTML(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/** 데이터 정규화: undefined 방지 */
function normalizeCoupons(raw) {
  const list = raw?.coupons ?? raw?.items ?? raw ?? [];
  return (Array.isArray(list) ? list : []).map(c => ({
    title: c.title ?? c.name ?? c.label ?? "",
    code: c.code ?? c.coupon ?? c.couponCode ?? c.coupon_code ?? "",
    link: c.link ?? c.url ?? c.href ?? c.to ?? ""
  })).filter(c => c.title || c.code || c.link);
}

function normalizePosts(raw) {
  const cats = raw?.categories ?? raw?.cats ?? raw?.data ?? [];
  const categories = (Array.isArray(cats) ? cats : []).map(cat => {
    const items = cat.items ?? cat.posts ?? cat.list ?? [];
    const normItems = (Array.isArray(items) ? items : []).map(item => {
      const published =
        item.published === true ||
        item.published === "true" ||
        item.status === "published" ||
        item.state === "done";

      return {
        title: item.title ?? item.name ?? "",
        slug: item.slug ?? item.file ?? item.filename ?? "",
        excerpt: item.excerpt ?? item.desc ?? item.summary ?? "",
        published
      };
    });

    return {
      id: cat.id ?? cat.key ?? "",
      name: cat.name ?? cat.title ?? cat.label ?? "",
      items: normItems
    };
  });

  return { categories };
}

/** 로고 흔들림 */
function bindBrandWiggle() {
  const btn = qs("#brandWiggle");
  if (!btn) return;

  let locked = false;
  const wiggle = () => {
    if (locked) return;
    locked = true;
    btn.classList.remove("wiggle");
    void btn.offsetWidth;
    btn.classList.add("wiggle");
    setTimeout(() => { locked = false; }, 650);
  };

  btn.addEventListener("mouseenter", wiggle);
  btn.addEventListener("click", wiggle);
}

/** 쿠폰 슬롯(상단 3개) */
function renderCouponSlots(slotsRoot, coupons) {
  if (!slotsRoot) return;

  const slots = qsa(".slot", slotsRoot);
  const picked = shuffle([...coupons]).slice(0, 3);

  slots.forEach((slot, i) => {
    const codeEl = qs("[data-slot-code]", slot);
    const subEl = qs("[data-slot-sub]", slot);
    const c = picked[i];

    if (!c) return;
    codeEl.textContent = c.title || c.code || "";
    subEl.textContent = c.code ? `CODE ${c.code}` : "";
  });
}

/** 사이드 쿠폰 리스트(6개 전부) */
function renderSideCoupons(listRoot, coupons) {
  if (!listRoot) return;
  listRoot.innerHTML = "";

  const items = shuffle([...coupons]);

  items.forEach((c) => {
    const code = c.code || "";
    const link = c.link || "#";

    const row = document.createElement("div");
    row.className = "coupon-row";
    row.innerHTML = `
      <div class="coupon-left">
        <div class="coupon-name">${escapeHTML(c.title)}</div>
        <div class="coupon-meta">
          <span class="coupon-code">CODE <b>${escapeHTML(code)}</b></span>
        </div>
      </div>
      <div class="coupon-actions">
        <button class="btn small ghost" data-copy="${escapeHTML(code)}" type="button">복사</button>
        <a class="btn small primary" href="${escapeHTML(link)}" target="_blank" rel="noopener">이동</a>
      </div>
    `;
    listRoot.appendChild(row);
  });

  qsa("[data-copy]", listRoot).forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.getAttribute("data-copy") || "";
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "복사됨";
        setTimeout(() => (btn.textContent = "복사"), 900);
      } catch {
        btn.textContent = "실패";
        setTimeout(() => (btn.textContent = "복사"), 900);
      }
    });
  });
}

/** 카테고리 렌더 */
function renderCategories(gridRoot, postsData) {
  if (!gridRoot) return;
  gridRoot.innerHTML = "";

  postsData.categories.forEach((cat) => {
    const card = document.createElement("section");
    card.className = "cat-card";

    const catName = cat.name || "카테고리";
    card.innerHTML = `
      <div class="cat-head">
        <div class="cat-title">${escapeHTML(catName)}</div>
        <div class="cat-right"><span class="cat-chip">스크롤</span></div>
      </div>
      <div class="cat-list" data-cat-list></div>
    `;

    const list = qs("[data-cat-list]", card);

    cat.items.forEach((item) => {
      const isPublished = item.published === true;
      const href = isPublished ? `./posts/${item.slug}.html` : "#";

      // “쿠폰 카테고리 미발행 문구”는 원하시면 여기서만 바꾸면 됩니다.
      const badgeText = isPublished ? "완료" : "준비중";

      const row = document.createElement("div");
      row.className = "post-row";
      row.innerHTML = `
        <a class="post-link ${isPublished ? "" : "disabled"}" href="${href}">
          <div class="post-title">${escapeHTML(item.title)}</div>
          <div class="post-sub">${escapeHTML(item.excerpt)}</div>
        </a>
        <div class="badge ${isPublished ? "done" : "wait"}">${badgeText}</div>
      `;
      list.appendChild(row);
    });

    gridRoot.appendChild(card);
  });
}

/** post.html 템플릿이 query slug로 열릴 때 */
function getSlugFromURL() {
  const params = new URLSearchParams(location.search);
  return params.get("slug");
}

function renderPostTemplate(postRoot, postsData, slug) {
  if (!postRoot) return;

  const all = postsData.categories.flatMap(c =>
    c.items.map(i => ({ ...i, categoryName: c.name }))
  );
  const item = all.find(p => p.slug === slug);

  if (!item) {
    postRoot.innerHTML = `
      <div class="post-header">
        <h1 class="post-title">게시글을 찾을 수 없습니다</h1>
        <p class="post-desc">posts.json의 slug와 posts 폴더 파일명이 같은지 확인해주세요.</p>
        <a class="btn primary" href="./index.html">메인으로</a>
      </div>
    `;
    return;
  }

  const pill = qs("#postPill");
  if (pill) pill.textContent = item.categoryName || "포스트";

  postRoot.innerHTML = `
    <div class="post-header">
      <div class="post-kicker">TFY 편집팀 · 업데이트: 상시</div>
      <h1 class="post-title">${escapeHTML(item.title)}</h1>
      <p class="post-desc">${escapeHTML(item.excerpt)}</p>

      <div class="post-actions">
        <a class="btn ghost" href="./index.html">메인</a>
        <a class="btn primary" href="./posts/${escapeHTML(item.slug)}.html">글 열기</a>
      </div>
    </div>
  `;
}

async function init() {
  bindBrandWiggle();

  const rawPosts = await fetchJSON(PATHS.posts);
  const rawCoupons = await fetchJSON(PATHS.coupons);

  const postsData = normalizePosts(rawPosts);
  const coupons = normalizeCoupons(rawCoupons);

  // index
  const categoryGrid = qs("#categoryGrid");
  if (categoryGrid) {
    renderCategories(categoryGrid, postsData);
    renderCouponSlots(qs("#couponSlots"), coupons);
    renderSideCoupons(qs("#sideCoupons"), coupons);

    const sidePanel = qs("#sidePanel");
    const cta = qs("#floatingCta");
    if (cta && sidePanel) {
      cta.addEventListener("click", () => sidePanel.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }

  // post template
  const postRoot = qs("#postRoot");
  if (postRoot) {
    const slug = getSlugFromURL() || "";
    renderPostTemplate(postRoot, postsData, slug);
    renderSideCoupons(qs("#postSideCoupons"), coupons);

    const postSide = qs("#postSide");
    const postCta = qs("#postFloatingCta");
    if (postCta && postSide) {
      postCta.addEventListener("click", () => postSide.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }
}

init().catch(console.error);
