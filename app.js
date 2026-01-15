/* app.js */

const $ = (sel) => document.querySelector(sel);

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toYmd(dateStr) {
  // dateStr: "2026.01.05" or "2026-01-05" etc.
  const s = String(dateStr || "").trim();
  if (!s) return "";
  if (s.includes(".")) return s;
  if (s.includes("-")) return s.replaceAll("-", ".");
  return s;
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

async function loadJson(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

/* ===== Coupons (right panel + main 3 slots) ===== */

// ✅ 코드별 "다운로드" 링크 고정 매핑 (URL은 화면에 노출하지 않고 버튼 클릭으로만 이동)
const DOWNLOAD_BY_CODE = {
  alf468043: "https://temu.to/k/gzxbhz73coe",
  frw419209: "https://temu.to/m/u6ndc7zl0v8",
  ack263361: "https://temu.to/k/gzxbhz73coe",
};

function renderCoupons(coupons) {
  const wrap = $("#couponList");
  if (!wrap) return;

  // coupons.json 구조: { items: [...] } 또는 [...] 둘 다 대응
  const items = Array.isArray(coupons) ? coupons : (coupons.items || []);

  // 우측 카드: 요청대로 3개만 유지
  const allowed = new Set(["alf468043", "frw419209", "ack263361"]);
  const filtered = items.filter((c) => allowed.has(String(c.code || "").trim()));

  wrap.innerHTML = filtered
    .map((c) => {
      const title = escapeHtml(c.title || "");
      const desc = escapeHtml(c.desc || "");
      const codeRaw = String(c.code || "").trim();
      const code = escapeHtml(codeRaw);

      // 이동 링크는 기존 데이터(c.link) 유지 (원래 동작 보존)
      const link = escapeHtml(c.link || "#");

      // 다운로드 링크는 코드별 고정
      const dl = escapeHtml(DOWNLOAD_BY_CODE[codeRaw] || "#");

      return `
      <div class="coupon-item">
        <div class="coupon-item-top">
          <div class="coupon-title">${title}</div>
          <div class="coupon-desc">${desc}</div>
        </div>

        <!-- ✅ 1줄: 코드/복사/이동 -->
        <div class="coupon-actions">
          <div class="coupon-code-pill">
            <span class="pill-label">CODE</span>
            <span class="pill-code">${code}</span>
          </div>

          <button class="btn btn-copy" data-copy="${code}">복사</button>

          <a class="btn btn-go" href="${link}" target="_blank" rel="noopener">이동</a>
        </div>

        <!-- ✅ 2줄: 다운로드(길게) / URL은 노출하지 않음 -->
        <a class="coupon-link-pill coupon-download"
           href="${dl}"
           target="_blank"
           rel="noopener"
           aria-label="다운로드 링크로 이동">
          다운로드
        </a>
      </div>
    `;
    })
    .join("");

  // copy handler
  wrap.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const v = btn.getAttribute("data-copy") || "";
      try {
        await navigator.clipboard.writeText(v);
        btn.textContent = "복사됨";
        setTimeout(() => (btn.textContent = "복사"), 900);
      } catch (e) {
        // fallback
        const ta = document.createElement("textarea");
        ta.value = v;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        btn.textContent = "복사됨";
        setTimeout(() => (btn.textContent = "복사"), 900);
      }
    });
  });
}

function renderMainSlots(coupons) {
  const wrap = $("#mainSlots");
  if (!wrap) return;

  const items = Array.isArray(coupons) ? coupons : (coupons.items || []);

  // 메인 3슬롯: ack263361, frw419209, alf468043
  const wanted = ["ack263361", "frw419209", "alf468043"];
  const map = new Map(items.map((x) => [String(x.code || "").trim(), x]));
  const slotItems = wanted.map((code) => map.get(code)).filter(Boolean);

  wrap.innerHTML = slotItems
    .map((c) => {
      const icon = escapeHtml(c.icon || "🎁");
      const title = escapeHtml(c.slotTitle || c.title || "");
      const sub = escapeHtml(c.slotSub || "요청대로 고정 삽입");
      const code = escapeHtml(c.code || "");

      return `
      <div class="slot">
        <div class="slot-top">
          <div class="slot-ic">${icon}</div>
          <div class="slot-txt">
            <div class="slot-title">${title}</div>
            <div class="slot-sub">${sub}</div>
          </div>
        </div>

        <div class="slot-code">CODE ${code}</div>
      </div>
    `;
    })
    .join("");
}

/* ===== Posts + Categories ===== */

function groupByCategory(items) {
  const map = new Map();
  for (const it of items) {
    const cat = it.category || "기타";
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat).push(it);
  }
  return map;
}

function renderCatTabs(categories, activeCat, onClick) {
  const wrap = $("#catTabs");
  if (!wrap) return;

  wrap.innerHTML = categories
    .map((cat) => {
      const isActive = cat === activeCat;
      return `<button class="pill ${isActive ? "is-active" : ""}" data-cat="${escapeHtml(cat)}">${escapeHtml(cat)}</button>`;
    })
    .join("");

  wrap.querySelectorAll("[data-cat]").forEach((btn) => {
    btn.addEventListener("click", () => onClick(btn.getAttribute("data-cat")));
  });
}

function renderPostsList(items, activeCat) {
  const wrapEl = $("#postsWrap");
  if (!wrapEl) return;

  const list = activeCat ? items.filter((x) => x.category === activeCat) : items;

  wrapEl.innerHTML = list
    .map((p) => {
      const title = escapeHtml(p.title || "");
      const date = toYmd(p.date || "");
      const done = Boolean(p.done);
      const hasCoupon = Boolean(p.hasCoupon);
      const slug = escapeHtml(p.slug || "");
      const href = `posts/${slug}.html`;

      const metaPills = [
        `<span class="meta-pill meta-date">${escapeHtml(date)}</span>`,
        hasCoupon ? `<span class="meta-pill meta-coupon">쿠폰 포함</span>` : "",
      ]
        .filter(Boolean)
        .join("");

      const soon = done ? "" : "업로드 예정";

      return `
      <a class="post-row" href="${done ? href : "#"}" ${done ? "" : 'aria-disabled="true"'} data-done="${done ? "1" : "0"}">
        <div class="post-main">
          <div class="post-title">${title}</div>

          <div class="post-meta">
            <div class="meta-line">${metaPills}</div>
            ${soon ? `<div class="meta-line"><span class="meta-pill meta-soon">${soon}</span></div>` : ""}
          </div>

          ${p.summary ? `<div class="post-summary">${escapeHtml(p.summary)}</div>` : ""}
        </div>

        <div class="post-badge ${done ? "is-done" : "is-wait"}">${done ? "완료" : "준비중"}</div>
      </a>
    `;
    })
    .join("");

  // 준비중 클릭 방지(동작 유지)
  wrapEl.querySelectorAll('a.post-row[data-done="0"]').forEach((a) => {
    a.addEventListener("click", (e) => e.preventDefault());
  });
}

/* ===== Boot ===== */

async function boot() {
  try {
    const [postsJson, couponsJson] = await Promise.all([
      loadJson("data/posts.json"),
      loadJson("data/coupons.json"),
    ]);

    const posts = postsJson.items || [];
    const cats = uniq(posts.map((p) => p.category)).filter(Boolean);

    let activeCat = cats[0] || "";

    renderCatTabs(cats, activeCat, (cat) => {
      activeCat = cat;
      renderCatTabs(cats, activeCat, () => {});
      renderPostsList(posts, activeCat);
      // 다시 이벤트 붙이기
      renderCatTabs(cats, activeCat, (next) => {
        activeCat = next;
        renderCatTabs(cats, activeCat, () => {});
        renderPostsList(posts, activeCat);
      });
    });

    renderPostsList(posts, activeCat);

    // coupons
    renderCoupons(couponsJson);
    renderMainSlots(couponsJson);
  } catch (e) {
    console.error(e);
  }
}

document.addEventListener("DOMContentLoaded", boot);
