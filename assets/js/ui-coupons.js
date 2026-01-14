(function () {
  function $(sel) { return document.querySelector(sel); }

  function copyText(text) {
    if (!text) return;
    navigator.clipboard?.writeText(text).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    });
  }

  function openLink(url) {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function renderCouponPanel(coupons) {
    const list = $("#couponList");
    if (!list) return;

    list.innerHTML = "";
    coupons.forEach((c) => {
      const item = document.createElement("div");
      item.className = "coupon-item";

      const left = document.createElement("div");
      left.className = "coupon-left";

      const name = document.createElement("div");
      name.className = "coupon-name";
      name.textContent = c.label || "쿠폰";

      const sub = document.createElement("div");
      sub.className = "coupon-sub";
      // 2줄까지만 보여주고 ... 없이 잘라냄 (CSS에서 처리)
      sub.textContent = [c.tag, c.audience].filter(Boolean).join(" · ");

      left.appendChild(name);
      left.appendChild(sub);

      const actions = document.createElement("div");
      actions.className = "coupon-actions";

      const code = document.createElement("div");
      code.className = "pill code";
      code.innerHTML = `CODE <b>${c.code || ""}</b>`;

      const copyBtn = document.createElement("button");
      copyBtn.className = "pill";
      copyBtn.type = "button";
      copyBtn.textContent = "복사";
      copyBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        copyText(c.code);
      });

      const goBtn = document.createElement("button");
      goBtn.className = "pill orange";
      goBtn.type = "button";
      goBtn.textContent = "이동";
      goBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openLink(c.url);
      });

      actions.appendChild(code);
      actions.appendChild(copyBtn);
      actions.appendChild(goBtn);

      item.appendChild(left);
      item.appendChild(actions);

      // 클릭시도 이동
      item.addEventListener("click", () => openLink(c.url));

      list.appendChild(item);
    });
  }

  function renderMainSlots(coupons) {
    const mapping = [
      { slotId: "slot1", codeId: "slot1Code", subId: "slot1Sub", iconId: "slot1Icon", pickCode: "ack263361", title: "30% 쿠폰", sub: "요청대로 고정 삽입" },
      { slotId: "slot2", codeId: "slot2Code", subId: "slot2Sub", iconId: "slot2Icon", pickCode: "frw419209", title: "1원 상품", sub: "요청대로 고정 삽입" },
      { slotId: "slot3", codeId: "slot3Code", subId: "slot3Sub", iconId: "slot3Icon", pickCode: "alf468043", title: "99% 할인 코드", sub: "요청대로 고정 삽입" },
    ];

    mapping.forEach((m) => {
      const slot = document.getElementById(m.slotId);
      if (!slot) return;

      const c = coupons.find((x) => x.code === m.pickCode) || {};
      const titleEl = slot.querySelector(".slot-title");
      const subEl = slot.querySelector(".slot-sub");
      const codeEl = document.getElementById(m.codeId);

      if (titleEl) titleEl.textContent = m.title;
      if (subEl) subEl.textContent = m.sub;
      if (codeEl) codeEl.textContent = c.code || m.pickCode;

      slot.addEventListener("click", () => openLink(c.url));
    });
  }

  window.tfyCoupons = { renderCouponPanel, renderMainSlots, copyText, openLink };
})();
