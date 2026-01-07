/* app.js
   - index.html 인라인 스크립트를 대체하는 "단일 진입점"
   - 디자인(HTML/CSS)은 건드리지 않고, DOM 채우기만 수행
*/

const CACHE = new Map();

async function safeFetchJSON(url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// GitHub Pages에서도 보통 HEAD가 됩니다. 안 되면 GET으로 폴백.
async function existsURL(url) {
  if (CACHE.has(url)) return CACHE.get(url);

  let ok = false;
  try {
    const head = await fetch(url, { method: "HEAD", cache: "no-store" });
    ok = head.ok;
  } catch {
    ok = false;
  }

  if (!ok) {
    try {
      const get = await fetch(url, { method: "GET", cache: "no-store" });
      ok = get.ok;
    } catch {
      ok = false;
    }
  }

  CACHE.set(url, ok);
  return ok;
}

// 1) window.TFY_DATA (posts-data.js)
// 2) data/posts.json + data/coupons.json
// 3) fallback minimal
async function loadTFYData() {
  if (window.TFY_DATA && typeof window.TFY_DATA === "object") return window.TFY_DATA;

  const posts = await safeFetchJSON("./data/posts.json");
  const coupons = await safeFetchJSON("./data/coupons.json");
  if (posts && coupons) return { posts, coupons };

  // fallback
  return {
    coupons: [
      { title: "150,000원 쿠폰 묶음", tag: "신규 앱 사용자", code: "aak74594", link: "https://temu.to/m/uotsq20netz" },
      { title: "사은품 0원 이벤트", tag: "신규 앱 사용자", code: "frq027981", link: "https://temu.to/m/u3ia9bomcaw" },
      { title: "30% 할인", tag: "신규 앱 사용자", code: "ack263361", link: "https://temu.to/m/u6ndc7zl0v8" },
      { title: "특별 세일", tag: "신규 앱 사용자", code: "acr804202", link: "https://temu.to/m/u3ckk6z4eku" },
      { title: "SAVE BIG", tag: "모든 사용자", code: "frw419209", link: "https://temu.to/m/u0zwrhwzccf" },
      { title: "추가 혜택", tag: "모든 사용자", code: "alf468043", link: "https://temu.to/k/qgzxbhz73coe" },
    ],
    posts: [],
  };
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else node.setAttribute(k, v);
  });
  (Array.isArray(children) ? children : [children]).forEach((c) => {
    if (c == null) return;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  });
  return node;
}

function getEls() {
  return {
    couponSlots: document.getElementById("couponSlots"),
    cats: document.getElementById("cats"),
    couponList: document.getElementById("couponList"),
  };
}

/* -----------------------------
   쿠폰 렌더
   - 상단 3슬롯(couponSlots): 첫 3개만
   - 우측 패널(couponList): 6개 전부
------------------------------ */
function renderTopCouponSlots(coupons) {
  const { couponSlots } = getEls();
  if (!couponSlots) return;
  couponSlots.innerHTML = "";

  const top3 = coupons.slice(0, 3);
  top3.forEach((c, i) => {
    // 기존 디자인 클래스/구조를 "최대한 덜 건드리기" 위해 단순 DOM만
    const card = el("div", { class: "coupon-slot" }, [
      el("div", { class: "dot dot-" + (i + 1) }),
      el("div", { class: "coupon-slot-title" }, c.title || ""),
      el("div", { class: "coupon-slot-code" }, c.code || ""),
      el("div", { class: "coupon-slot-sub" }, c.tag || ""),
    ]);
    couponSlots.appendChild(card);
  });
}

function renderFloatingCouponPanel(coupons) {
  const { couponList } = getEls();
  if (!couponList) return;
  couponList.innerHTML = "";

  coupons.slice(0, 6).forEach((c) => {
    const code = (c.code || "").trim();
    const link = (c.link || "").trim();

    const copyBtn = el("button", { class: "btn btn-ghost btn-copy", type: "button" }, "복사");
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(code);
        copyBtn.textContent = "복사됨";
        setTimeout(() => (copyBtn.textContent = "복사"), 900);
      } catch {
        copyBtn.textContent = "실패";
        setTimeout(() => (copyBtn.textContent = "복사"), 900);
      }
    });

    const goBtn = el("a", { class: "btn btn-primary btn-go", href: link || "#", target: "_blank", rel: "noopener noreferrer" }, "이동");

    const item = el("div", { class: "coupon-item" }, [
      el("div", { class: "coupon-item-left" }, [
        el("div", { class: "coupon-item-title" }, c.title || ""),
        el("div", { class: "coupon-item-meta" }, c.tag || ""),
        el("div", { class: "coupon-item-code" }, [
          el("span", { class: "label" }, "CODE"),
          el("span", { class: "value" }, code),
        ]),
      ]),
      el("div", { class: "coupon-item-right" }, [copyBtn, goBtn]),
    ]);

    couponList.appendChild(item);
  });
}

/* -----------------------------
   포스트 렌더
   - posts.json / TFY_DATA 구조가 어떤 형태든 최대한 유연하게 처리
   - slug -> ./posts/{slug}.html
   - 파일 존재하면 자동으로 "완료" 배지로 전환
------------------------------ */
function normalizePosts(posts) {
  // 허용 형태:
  // 1) [{...}, {...}]
  // 2) { categories:[{key,title,items:[...]}] }
  // 3) { posts:[...], categories:[...] } 등
  if (Array.isArray(posts)) return { categories: null, flat: posts };

  if (posts && Array.isArray(posts.categories)) return { categories: posts.categories, flat: null };

  if (posts && Array.isArray(posts.posts)) return { categories: null, flat: posts.posts };

  return { categories: null, flat: [] };
}

function ensureCategoriesFromFlat(flat) {
  // flat에 category가 있다면 4개로 묶기
  const map = new Map();
  flat.forEach((p) => {
    const cat = p.category || "정보";
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat).push(p);
  });

  const order = ["혜택·쿠폰", "결제·계정", "배송·통관", "환불·고객센터"];
  const cats = order.map((name) => ({
    key: name,
    title: name,
    items: map.get(name) || [],
  }));

  // 기타 카테고리는 "정보"로 흡수
  map.forEach((items, k) => {
    if (!order.includes(k)) {
      const info = cats.find((c) => c.key === "혜택·쿠폰") || cats[0];
      info.items.push(...items);
    }
  });

  return cats;
}

async function renderCategories(dataPosts) {
  const { cats } = getEls();
  if (!cats) return;
  cats.innerHTML = "";

  const norm = normalizePosts(dataPosts);
  const categories = norm.categories || ensureCategoriesFromFlat(norm.flat || []);

  for (const cat of categories) {
    const col = el("div", { class: "cat-col" }, [
      el("div", { class: "cat-head" }, [
        el("div", { class: "cat-title" }, cat.title || cat.key || ""),
        el("div", { class: "cat-pill" }, "스크롤"),
      ]),
    ]);

    const list = el("div", { class: "cat-list" });
    col.appendChild(list);

    // 최대 5개만 기본 노출 + 스크롤로 더 보기 (CSS가 스크롤 처리)
    for (const p of (cat.items || [])) {
      const slug = (p.slug || "").trim();
      const href = slug ? `./posts/${slug}.html` : "#";

      // “준비중/완료” 자동 판정:
      // - p.ready === true 이면 완료
      // - 아니면 실제 파일 존재 체크로 완료로 승격
      let ready = !!p.ready;
      if (!ready && slug) {
        ready = await existsURL(href);
      }

      const badge = ready ? el("span", { class: "badge badge-done" }, "완료")
                          : el("span", { class: "badge badge-soon" }, "준비중");

      const a = el("a", { class: "post-row", href: ready ? href : "#", "data-slug": slug }, [
        el("div", { class: "post-row-title" }, p.title || ""),
        badge,
      ]);

      if (!ready) {
        a.addEventListener("click", (e) => e.preventDefault());
      }

      list.appendChild(a);
    }

    cats.appendChild(col);
  }
}

/* -----------------------------
   부팅
------------------------------ */
async function boot() {
  const data = await loadTFYData();

  const coupons = Array.isArray(data.coupons) ? data.coupons : [];
  renderTopCouponSlots(coupons);
  renderFloatingCouponPanel(coupons);

  // posts가 TFY_DATA에 {posts:...} 형태일 수도 있으니 안전 처리
  const postsData = data.posts ?? data;
  await renderCategories(postsData);
}

document.addEventListener("DOMContentLoaded", boot);
