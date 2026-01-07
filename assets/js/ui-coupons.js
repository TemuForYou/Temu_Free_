(function(){
  const COUPON_URL = "./data/coupons.json";

  function shuffle(arr){
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]] = [a[j],a[i]];
    }
    return a;
  }

  function copyText(t){
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(t);
    }
    const ta = document.createElement("textarea");
    ta.value = t;
    ta.style.position="fixed";
    ta.style.left="-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand("copy");
    ta.remove();
    return Promise.resolve();
  }

  function iconFor(title){
    const t = (title||"").toLowerCase();
    if (t.includes("사은품") || t.includes("0원")) return "🎁";
    if (t.includes("세일")) return "⚡";
    if (t.includes("할인")) return "🏷️";
    if (t.includes("save")) return "💎";
    return "🧡";
  }

  function couponCard(c){
    const wrap = document.createElement("div");
    wrap.className = "coupon-card";

    const ico = document.createElement("div");
    ico.className = "coupon-ico";
    ico.textContent = iconFor(c.title);

    const main = document.createElement("div");
    main.className = "coupon-main";

    const h = document.createElement("div");
    h.className = "coupon-title";
    h.textContent = c.title || "쿠폰";

    const sub = document.createElement("div");
    sub.className = "coupon-sub";
    sub.textContent = c.note || " ";

    const code = document.createElement("div");
    code.className = "code-pill";
    const codeLabel = document.createElement("strong");
    codeLabel.textContent = "CODE";
    codeLabel.style.marginRight = "2px";
    const codeVal = document.createElement("span");
    codeVal.textContent = c.key;

    code.appendChild(codeLabel);
    code.appendChild(codeVal);

    const btns = document.createElement("div");
    btns.className = "btns";

    const copyBtn = document.createElement("button");
    copyBtn.className = "btn copy";
    copyBtn.type = "button";
    copyBtn.textContent = "복사";
    copyBtn.addEventListener("click", async () => {
      await copyText(c.key);
      copyBtn.textContent = "완료";
      setTimeout(()=>copyBtn.textContent="복사", 900);
    });

    const goBtn = document.createElement("button");
    goBtn.className = "btn go";
    goBtn.type = "button";
    goBtn.textContent = "이동";
    goBtn.addEventListener("click", () => {
      window.open(c.url, "_blank", "noopener,noreferrer");
    });

    btns.appendChild(copyBtn);
    btns.appendChild(goBtn);

    main.appendChild(h);
    main.appendChild(sub);
    main.appendChild(code);
    main.appendChild(btns);

    wrap.appendChild(ico);
    wrap.appendChild(main);

    // 오른쪽 여백(시각 균형용)
    const spacer = document.createElement("div");
    spacer.style.width = "4px";
    wrap.appendChild(spacer);

    return wrap;
  }

  async function render(){
    const panel = document.getElementById("couponPanel");
    if (!panel) return;

    const res = await fetch(COUPON_URL, { cache:"no-store" });
    const data = await res.json();
    const list = shuffle(data.coupons || []);

    panel.innerHTML = "";
    list.forEach(c => panel.appendChild(couponCard(c)));
  }

  document.addEventListener("DOMContentLoaded", () => {
    render().catch(console.error);
  });
})();
 
