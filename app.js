(() => {
  // ====== helpers ======
  const $ = (sel) => document.querySelector(sel);

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  async function fetchJSON(path) {
    // GitHub Pages 캐시가 남아 "변하지 않는" 느낌을 줄 때가 있어 버전쿼리 추가
    const bust = `v=${Date.now()}`;
    const url = path.includes("?") ? `${path}&${bust}` : `${path}?${bust}`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load: ${path} (${res.status})`);
    return res.json();
  }

  function getBaseUrl() {
    // .../index.html or .../ 어떤 형태든 마지막 세그먼트 제거
    return location.origin + location.pathname.replace(/\/[^/]*$/, "/");
  }

  async function checkFileExists(url) {
    try {
      // HEAD가 막히는 케이스가 있어, 아주 가벼운 GET(Range)로 존재 확인
      const res = await fetch(url, {
        method: "GET",
        headers: { Range: "bytes=0-0" },
        cache: "no-store",
      });

      // 200/206이면 존재, 404면 없음
      // (간혹 416이 오면 서버가 Range 미지원인데 파일은 존재할 수 있으니 true로 처리)
      if (res.status === 200 || res.status === 206) return true;
      if (res.status === 416) return true;
      return false;
    } catch {
      return false;
    }
  }

  // ====== render coupons ======
  function couponCardHTML(c, variant = "main") {
    const badge = c.badge ? `<span class="tfx-badge">${c.badge}</span>` : "";
    return `
      <div class="tfx-coupon-card ${variant}">
        <div class="tfx-coupon-left">
          <div class="tfx-coupon-icon">🎁</div>
          <div class="tfx-coupon-meta">
            <div class="tfx-coupon-title">${c.title} ${badge}</div>
            <div class="tfx-coupon-desc">${c.desc}</div>
          </div>
        </div>

        <div class="tfx-coupon-right">
          <a class="tfx-btn tfx-btn-ghost" href="${c.link}" target="_blank" rel="noopener">링크</a>
          <button class="tfx-btn tfx-btn-solid" data-copy="${c.code}">코드 복사</button>
        </div>

        <div class="tfx-coupon-codechip" title="클릭하면 복사됩니다" data-copy="${c.code}">
          ${c.code}
        </div>
      </div>
    `;
  }

  function attachCopyHandlers(rootEl) {
    rootEl.addEventListener("click", async (e) => {
      const target = e.target.closest("[data-copy]");
      if (!target) return;

      const code = target.getAttribute("data-copy");
      try {
        await navigator.clipboard.writeText(code);
        target.classList.add("copied");
        setTimeout(() => target.classList.remove("copied"), 650);
      } catch {
        alert(`복사 실패: ${code}`);
      }
    });
  }

  async function renderCoupons() {
    const data = await fetchJSON("./data/coupons.json");
    const items = shuffle(data.items);

    // 메인: 랜덤 3개
    const mainTarget = $("#couponCardsMain");
    if (mainTarget) {
      mainTarget.innerHTML = items.slice(0, 3).map((c) => couponCardHTML(c, "main")).join("");
      attachCopyHandlers(mainTarget);
    }

    // 사이드바: 6개 전부(순서 랜덤)
    const sideTarget = $("#couponSidebarList");
    if (sideTarget) {
      sideTarget.innerHTML = items.map((c) => couponCardHTML(c, "sidebar")).join("");
      attachCopyHandlers(sideTarget);
    }
  }

  // ====== render posts ======
  function postRowHTML(item, exists) {
    const trend = item.trend ? `<span class="tfx-trend">📈</span>` : "";
    const status = exists ? "" : `<span class="tfx-soon">곧 업로드 예정입니다!</span>`;

    const href = exists ? `./posts/${item.file}` : "javascript:void(0)";
    const clickableClass = exists ? "ready" : "soon";

    return `
      <a class="tfx-post-row ${clickableClass}" href="${href}">
        <span class="tfx-post-title">${item.title}</span>
        ${trend}
        ${status}
      </a>
    `;
  }

  async function renderPosts() {
    const data = await fetchJSON("./data/posts.json");
    const container = $("#categoryLists");
    if (!container) return;

    const base = getBaseUrl();

    // 1) 스켈레톤 박아두고
    container.innerHTML = data.categories
      .map((cat) => {
        return `
        <section class="tfx-cat">
          <div class="tfx-cat-head">
            <div class="tfx-cat-title">${cat.title}</div>
            <div class="tfx-cat-sub">목록은 일부만 먼저 보이며, 스크롤로 더 확인할 수 있습니다.</div>
          </div>
          <div class="tfx-cat-list" data-cat="${cat.id}">
            ${cat.items
              .map(
                (it) => `
              <div class="tfx-post-skeleton"
                data-file="${it.file}"
                data-title="${encodeURIComponent(it.title)}"
                data-trend="${it.trend ? "1" : "0"}"></div>
            `
              )
              .join("")}
          </div>
        </section>
      `;
      })
      .join("");

    // 2) 존재 확인을 병렬로 처리해서 빠르게 교체
    const skeletons = [...container.querySelectorAll(".tfx-post-skeleton")];

    await Promise.all(
      skeletons.map(async (sk) => {
        const file = sk.getAttribute("data-file");
        const title = decodeURIComponent(sk.getAttribute("data-title") || "");
        const trend = sk.getAttribute("data-trend") === "1";

        const url = `${base}posts/${file}`;
        const exists = await checkFileExists(url);

        sk.outerHTML = postRowHTML({ title, file, trend }, exists);
      })
    );
  }

  // ====== init ======
  async function init() {
    try {
      await Promise.all([renderCoupons(), renderPosts()]);
    } catch (err) {
      console.error("[TFY] init error:", err);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
