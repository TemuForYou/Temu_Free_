// app.js (Index)
// ✅ 디자인(CSS/HTML)은 그대로 두고, posts.json 구조 차이/표기 차이로 인해
//    "포스팅 카테고리"가 사라지거나 로딩 오류가 나는 문제만 안정적으로 해결합니다.

(function () {
  "use strict";

  const $ = (sel) => document.querySelector(sel);

  const elTabs = $("#categoryTabs");
  const elWrap = $("#categoryWrap");
  const elErr = $("#categoryError");

  if (!elTabs || !elWrap) return;

  // 고정 카테고리(순서 고정)
  const GROUP_ORDER = [
    "실수·문제 해결형 ① 통관·배송",
    "실수·문제 해결형 ② 주문·결제",
    "진위 검증형 ③ 안전·신뢰",
    "진위 검증형 ④ 혜택·추천",
  ];

  const state = {
    items: [],
    activeGroup: GROUP_ORDER[0],
  };

  function safeText(v) {
    return (v ?? "").toString();
  }

  function normalizeBool(v) {
    if (v === true) return true;
    if (v === false) return false;
    if (typeof v === "string") {
      const s = v.trim().toLowerCase();
      return s === "true" || s === "done" || s === "y" || s === "yes";
    }
    return false;
  }

  function buildUrl(path) {
    // GitHub Pages 하위 경로/로컬 모두 대응
    return new URL(path, window.location.href).toString();
  }

  function renderTabs() {
    elTabs.innerHTML = "";

    GROUP_ORDER.forEach((label) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tab" + (label === state.activeGroup ? " active" : "");
      btn.textContent = label;

      btn.addEventListener("click", () => {
        state.activeGroup = label;
        renderList();
        renderTabs(); // active 갱신
      });

      elTabs.appendChild(btn);
    });
  }

  function renderList() {
    elWrap.innerHTML = "";

    const filtered = state.items.filter((it) => it.group === state.activeGroup);

    filtered.forEach((post) => {
      const done = normalizeBool(post.done) || safeText(post.status) === "done";
      const hasCoupon = normalizeBool(post.hasCoupon);

      const row = document.createElement("div");
      row.className = "post-row";

      const left = document.createElement("div");
      left.className = "left";

      const title = document.createElement("div");
      title.className = "post-title";
      title.textContent = safeText(post.title);

      const meta1 = document.createElement("div");
      meta1.className = "post-meta";
      meta1.textContent = `${safeText(post.date)} · ${hasCoupon ? "쿠폰 포함" : "쿠폰 없음"}`;

      const meta2 = document.createElement("div");
      meta2.className = "post-meta";
      meta2.textContent = done ? safeText(post.summary) : "업로드 예정";

      left.appendChild(title);
      left.appendChild(meta1);
      left.appendChild(meta2);

      const badge = document.createElement("div");
      badge.className = "badge " + (done ? "done" : "pending");
      badge.textContent = done ? "완료" : "준비중";

      row.appendChild(left);
      row.appendChild(badge);

      // 완료된 글만 이동 가능
      if (done && post.slug) {
        row.style.cursor = "pointer";
        const href = buildUrl(`posts/${post.slug}.html`);
        row.addEventListener("click", () => (window.location.href = href));
      }

      elWrap.appendChild(row);
    });
  }

  async function loadPosts() {
    const url = buildUrl("data/posts.json");
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`posts.json fetch 실패 (${res.status})`);

    const json = await res.json();

    // 호환: [ ... ] 또는 { items: [ ... ] }
    const items = Array.isArray(json) ? json : Array.isArray(json.items) ? json.items : null;
    if (!items) throw new Error("posts.json 형식 오류: items 배열이 없습니다.");

    // group이 없으면 5개씩 자동 분배(파일 순서 유지)
    return items.map((it, idx) => {
      const out = { ...it };
      if (!out.group) out.group = GROUP_ORDER[Math.floor(idx / 5)] || GROUP_ORDER[0];

      // status가 'true'로 들어간 경우 방어(완료 처리)
      if (
        out.done === undefined &&
        typeof out.status === "string" &&
        out.status.trim().toLowerCase() === "true"
      ) {
        out.done = true;
      }
      return out;
    });
  }

  (async function boot() {
    try {
      if (elErr) elErr.style.display = "none";
      state.items = await loadPosts();

      // 초기 탭은 ①로 고정
      state.activeGroup = GROUP_ORDER[0];

      renderTabs();
      renderList();
    } catch (e) {
      console.error(e);
      if (elErr) elErr.style.display = "block";
    }
  })();
})();
