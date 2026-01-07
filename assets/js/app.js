/* TFY single app.js
 * - index.html / post.html 공용
 * - 데이터: ./data/posts.json, ./data/coupons.json
 */

const PATHS = {
  posts: "./data/posts.json",
  coupons: "./data/coupons.json",
};

const CATEGORY_EMOJI = {
  "benefit-coupon": "🎁",
  "payment-account": "💳",
  "shipping-customs": "🚚",
  "temu-info": "🧠",
};

function qs(sel, el = document) { return el.querySelector(sel); }
function qsa(sel, el = document) { return [...el.querySelectorAll(sel)]; }

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

async function fetchJSON(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
  return await res.json();
}

function getSlugFromURL() {
  const params = new URLSearchParams(location.search);
  return params.get("slug");
}

/** 로고 “간지럼” */
function bindBrandWiggle() {
  const btn = qs("#brandWiggle");
  if (!btn) return;

  let locked = false;
  const wiggle = () => {
    if (locked) return;
    locked = true;
    btn.classList.remove("wiggle");
    void btn.offsetWidth; // reflow
    btn.classList.add("wiggle");
    setTimeout(() => { locked = false; }, 650);
  };

  btn.addEventListener("mouseenter", wiggle);
  btn.addEventListener("click", wiggle);
}

/** 우측 패널: 커서를 즉시 따라오지 않고 “부드럽게” 추적 */
function bindInertiaFollow(panelEl) {
  if (!panelEl) return;

  let targetY = 0;
  let currentY = 0;

  const onMove = (e) => {
    const vh = window.innerHeight;
    const y = e.clientY - vh / 2;
    targetY = clamp(y * 0.25, -120, 120);
  };

  const tick = () => {
    currentY += (targetY - currentY) * 0.08;
    panelEl.style.transform = `translate3d(0, ${currentY}px, 0)`;
    requestAnimationFrame(tick);
  };

  window.addEventListener("mousemove", onMove, { passive: true });
  requestAnimationFrame(tick);
}

/** 쿠폰 UI */
function renderCouponSlots(slotsRoot, coupons) {
  if (!slotsRoot) return;
  const slots = qsa(".slot", slotsRoot);
  const picked = shuffle([...coupons]).slice(0, 3);

  slots.forEach((slot, i) => {
    const codeEl = qs("[data-slot-code]", slot);
    const subEl = qs("[data-slot-sub]", slot);
    const c = picked[i];

    if (!c) return;
    // “공백 유지” 요청이 있었지만, 현재는 코드/링크를 채우길 원하셨으므로 값 주입
    codeEl.textContent = c.code;
    subEl.textContent = c.title;
  });
}

function renderSideCoupons(listRoot, coupons) {
  if (!listRoot) return;
  listRoot.innerHTML = "";

  // 6개 전부 노출(순서 랜덤)
  const items = shuffle([...coupons]);

  items.forEach((c) => {
    const row = document.createElement("div");
    row.className = "coupon-row";

    row.innerHTML = `
      <div class="coupon-left">
        <div class="coupon-name">${escapeHTML(c.title)}</div>
        <div class="coupon-meta">
          <span class="coupon-code">CODE <b>${escapeHTML(c.code)}</b></span>
        </div>
      </div>
      <div class="coupon-actions">
        <button class="btn small ghost" data-copy="${escapeHTML(c.code)}" type="button">복사</button>
        <a class="btn small primary" href="${escapeHTML(c.link)}" target="_blank" rel="noopener">이동</a>
      </div>
    `;
    listRoot.appendChild(row);
  });

  // copy handler
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

function bindFloatingCTA(btn, sideEl) {
  if (!btn || !sideEl) return;
  btn.addEventListener("click", () => {
    sideEl.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

/** 카테고리/포스트 UI */
function renderCategories(gridRoot, postsData) {
  if (!gridRoot) return;
  gridRoot.innerHTML = "";

  postsData.categories.forEach((cat) => {
    const card = document.createElement("section");
    card.className = "cat-card";

    const emoji = CATEGORY_EMOJI[cat.id] || "📌";

    card.innerHTML = `
      <div class="cat-head">
        <div class="cat-title"><span class="cat-emoji">${emoji}</span>${escapeHTML(cat.name)}</div>
        <div class="cat-right">
          <span class="cat-chip">스크롤</span>
        </div>
      </div>
      <div class="cat-list" data-cat-list></div>
    `;

    const list = qs("[data-cat-list]", card);

    // 기본 5개만 “상단 노출”, 나머지는 스크롤로 확인
    cat.items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "post-row";

      const isPublished = item.published === true;

      // 쿠폰 카테고리: 미발행이면 “곧 업로드 예정입니다!”
      const badgeText = isPublished
        ? "완료"
        : (cat.id === "benefit-coupon" ? "곧 업로드 예정" : "준비중");

      const badgeClass = isPublished ? "badge done" : "badge wait";

      const href = isPublished ? `./posts/${item.slug}.html` : "#";

      row.innerHTML = `
        <a class="post-link ${isPublished ? "" : "disabled"}" href="${href}">
          <div class="post-title">${escapeHTML(item.title)}</div>
          <div class="post-sub">${escapeHTML(item.excerpt || "")}</div>
        </a>
        <div class="${badgeClass}">${badgeText}</div>
      `;

      list.appendChild(row);
    });

    gridRoot.appendChild(card);
  });
}

/** post.html 렌더 */
function renderPost(postRoot, postsData, slug) {
  if (!postRoot) return;

  // slug로 매칭
  const all = postsData.categories.flatMap(c => c.items.map(i => ({...i, categoryId: c.id, categoryName: c.name})));
  const item = all.find(p => p.slug === slug);

  if (!item) {
    postRoot.innerHTML = `
      <div class="post-header">
        <h1 class="post-title">게시글을 찾을 수 없습니다</h1>
        <p class="post-desc">slug가 posts.json과 일치하는지 확인해주세요.</p>
        <a class="btn primary" href="./index.html">메인으로</a>
      </div>
    `;
    return;
  }

  // 상단 pill
  const pill = qs("#postPill");
  if (pill) pill.textContent = item.categoryName;

  // 실제 본문은 “posts/slug.html”에 이미 존재하므로 iframe처럼 다시 불러오는 방식은 피하고,
  // post.html은 템플릿 역할만 하도록 구성했습니다.
  // → 운영 방식: posts/xxx.html로 직접 진입(권장)
  postRoot.innerHTML = `
    <div class="post-header">
      <div class="post-kicker">TFY 편집팀 · 업데이트: 상시</div>
      <h1 class="post-title">${escapeHTML(item.title)}</h1>
      <p class="post-desc">${escapeHTML(item.excerpt || "")}</p>

      <div class="post-actions">
        <a class="btn ghost" href="./index.html">메인</a>
        <a class="btn primary" href="./posts/${escapeHTML(item.slug)}.html">글 열기</a>
      </div>
    </div>

    <div class="post-note">
      이 페이지는 디자인/레이아웃을 고정하기 위한 템플릿입니다. 실제 글은 오른쪽 버튼으로 열립니다.
    </div>
  `;
}

/** utils */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function escapeHTML(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/** init */
async function init() {
  bindBrandWiggle();

  const [postsData, couponsData] = await Promise.all([
    fetchJSON(PATHS.posts),
    fetchJSON(PATHS.coupons),
  ]);

  // index
  const categoryGrid = qs("#categoryGrid");
  if (categoryGrid) {
    renderCategories(categoryGrid, postsData);

    // 쿠폰 슬롯/사이드
    renderCouponSlots(qs("#couponSlots"), couponsData.coupons);
    renderSideCoupons(qs("#sideCoupons"), couponsData.coupons);

    const sidePanel = qs("#sidePanel");
    bindInertiaFollow(sidePanel);

    bindFloatingCTA(qs("#floatingCta"), sidePanel);
  }

  // post template
  const postRoot = qs("#postRoot");
  if (postRoot) {
    const slug = getSlugFromURL();
    renderPost(postRoot, postsData, slug || "");
    renderSideCoupons(qs("#postSideCoupons"), couponsData.coupons);

    const postSide = qs("#postSide");
    bindInertiaFollow(postSide);
    bindFloatingCTA(qs("#postFloatingCta"), postSide);
  }
}

init().catch((err) => {
  console.error(err);
});
