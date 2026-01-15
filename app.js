/* app.js - 카테고리/글목록/쿠폰 렌더 핵심 */
(function () {
  const $ = (sel) => document.querySelector(sel);

  function uniq(arr) {
    return Array.from(new Set(arr));
  }

  function safeText(s) {
    return (s ?? "").toString();
  }

  function byOrder(categories, orderList) {
    // orderList에 있는 순서대로 정렬, 없는 건 뒤로
    const idx = new Map(orderList.map((c, i) => [c, i]));
    return [...categories].sort((a, b) => (idx.get(a) ?? 9999) - (idx.get(b) ?? 9999));
  }

  async function fetchJson(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error(`${path} fetch failed: ${res.status}`);
    return await res.json();
  }

  function renderMainSlots(coupons) {
    const el = $("#mainSlots");
    if (!el) return;

    // ✅ 메인 3개 슬롯 고정: ack263361, frw419209, alf468043
    const want = ["ack263361", "frw419209", "alf468043"];
    const map = new Map(coupons.map((c) => [c.code, c]));
    const picked = want.map((code) => map.get(code)).filter(Boolean);

    el.innerHTML = picked.map((c) => {
      return `
        <div class="slot">
          <div class="slot__top">
            <div class="slot__label">${safeText(c.label)}</div>
          </div>
          <div class="slot__code">CODE <b>${safeText(c.code)}</b></div>
        </div>
      `;
    }).join("");
  }

  function renderCouponPanel(coupons) {
    const el = $("#couponPanel");
    if (!el) return;

    // ✅ 우측 패널에는 3개만 노출 (원하신 3개만)
    const want = ["alf468043", "frw419209", "ack263361"];
    const map = new Map(coupons.map((c) => [c.code, c]));
    const list = want.map((code, i) => ({ c: map.get(code), i })).filter(x => x.c);

    el.innerHTML = list.map(({ c }) => {
      const code = safeText(c.code);
      const link = safeText(c.link);

      return `
        <div class="coupon-card">
          <div class="coupon-card__row">
            <div class="coupon-card__code">
              <span class="pill">CODE</span>
              <span class="code">${code}</span>
            </div>
            <button class="btn copy" data-copy="${code}">복사</button>
            <a class="btn go" href="${link}" target="_blank" rel="noopener">이동</a>
          </div>

          <!-- ✅ 다운로드(링크)는 화면에 글자로 노출시키지 않고, 버튼으로만 이동 -->
          <div class="coupon-card__download">
            <a class="btn download" href="${link}" target="_blank" rel="noopener">
              다운로드
            </a>
          </div>
        </div>
      `;
    }).join("");

    // copy handler
    el.addEventListener("click", async (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      const btn = t.closest("button[data-copy]");
      if (!btn) return;
      const text = btn.getAttribute("data-copy") || "";
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "복사됨";
        setTimeout(() => (btn.textContent = "복사"), 900);
      } catch {
        // fallback
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        btn.textContent = "복사됨";
        setTimeout(() => (btn.textContent = "복사"), 900);
      }
    }, { passive: true });
  }

  function renderCatTabs(categories, active, onPick) {
    const el = $("#catTabs");
    if (!el) return;

    el.innerHTML = categories.map((cat) => {
      const isOn = cat === active;
      return `
        <button class="cat-btn ${isOn ? "is-active" : ""}" data-cat="${cat}">
          ${cat}
        </button>
      `;
    }).join("");

    el.onclick = (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      const btn = t.closest("button[data-cat]");
      if (!btn) return;
      const cat = btn.getAttribute("data-cat");
      if (!cat) return;
      onPick(cat);
    };
  }

  function renderPostsList(allPosts, activeCat) {
    const el = $("#postsWrap");
    if (!el) return;

    const posts = allPosts.filter((p) => p.category === activeCat);

    el.innerHTML = posts.map((p) => {
      const title = safeText(p.title);
      const date = safeText(p.date);
      const hasCoupon = p.hasCoupon ? "쿠폰 포함" : "";
      const statusText = p.done ? "완료" : "준비중";
      const sub = p.done ? safeText(p.summary || "") : "업로드 예정";
      const slug = safeText(p.slug);

      // ✅ done이면 글로 이동, 아니면 이동 없음
      const href = p.done ? `./posts/${slug}.html` : "#";
      const clickable = p.done ? "is-clickable" : "is-disabled";

      return `
        <a class="post-row ${clickable}" href="${href}" ${p.done ? "" : 'onclick="return false;"'}>
          <div class="post-row__left">
            <div class="post-row__title">${title}</div>
            <div class="post-row__meta">${date}${hasCoupon ? " · " + hasCoupon : ""}</div>
            <div class="post-row__sub">${sub}</div>
          </div>
          <div class="post-row__right">
            <span class="badge ${p.done ? "done" : "wait"}">${statusText}</span>
          </div>
        </a>
      `;
    }).join("");
  }

  async function boot() {
    // ✅ 경로 고정: 아래 2개가 반드시 존재해야 합니다
    const [postsJson, couponsJson] = await Promise.all([
      fetchJson("./data/posts.json"),
      fetchJson("./data/coupons.json"),
    ]);

    const posts = postsJson.items || [];
    const coupons = couponsJson.items || [];

    // 1) 쿠폰
    renderMainSlots(coupons);
    renderCouponPanel(coupons);

    // 2) 카테고리/글 목록
    const catsRaw = uniq(posts.map((p) => p.category)).filter(Boolean);

    // ✅ “정해진 순서”를 유지하려면 여기 order 배열을 ‘고정’으로 둡니다.
    // (원하신 4개 카테고리 이름이 정확히 이것과 일치해야 합니다.)
    const catOrder = [
      "실수·문제 해결형 ① 통관·배송",
      "실수·문제 해결형 ② 주문·결제",
      "진위 검증형 ③ 안전·신뢰",
      "진위 검증형 ④ 혜택·추천",
    ];

    const cats = byOrder(catsRaw, catOrder);

    // ✅ 카테고리가 비면 이유를 화면에 보여줌(원인 추적용)
    if (!cats.length) {
      const wrapEl = $("#postsWrap");
      const tabEl = $("#catTabs");
      if (tabEl) tabEl.innerHTML = "";
      if (wrapEl) {
        wrapEl.innerHTML = `
          <div style="padding:14px 16px;color:#6B7280;">
            posts.json에서 category가 없거나 items가 비어 있어 카테고리를 만들 수 없습니다.<br>
            data/posts.json 경로와 JSON 구조(items/category)를 확인해주세요.
          </div>`;
      }
      return;
    }

    let active = cats[0];
    const setActive = (cat) => {
      active = cat;
      renderCatTabs(cats, active, setActive);
      renderPostsList(posts, active);
    };

    setActive(active);
  }

  boot().catch((err) => {
    // 콘솔에서 바로 원인 확인 가능
    console.error(err);
    const wrapEl = document.querySelector("#postsWrap");
    if (wrapEl) {
      wrapEl.innerHTML = `
        <div style="padding:14px 16px;color:#B91C1C;">
          데이터 로딩 오류가 발생했습니다.<br>
          콘솔(Console)에서 에러 메시지를 확인해주세요.
        </div>`;
    }
  });
})();
