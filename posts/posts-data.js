<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>TFY | (여기에 글 제목)</title>

  <style>
    :root{--bg:#f6f7f9;--card:#fff;--line:#e9e9ee;--text:#111827;--muted:#6b7280;--brand:#ff7a18;--brand2:#ff9b4d;--shadow:0 14px 34px rgba(17,24,39,.10);--shadow2:0 10px 24px rgba(17,24,39,.08);}
    *{box-sizing:border-box}
    body{margin:0;font-family:"Apple SD Gothic Neo",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Noto Sans KR",Arial,sans-serif;background:var(--bg);color:var(--text);}
    .topbar{position:sticky;top:0;z-index:50;background:linear-gradient(90deg,var(--brand),#ff8a2e);height:56px;display:flex;align-items:center;padding:0 18px;box-shadow:0 10px 20px rgba(0,0,0,.10);}
    .logo{display:inline-flex;align-items:center;cursor:pointer;user-select:none}
    .logo-mark{font-weight:900;font-size:22px;letter-spacing:.5px;color:#fff;font-style:italic;text-shadow:0 8px 18px rgba(0,0,0,.25);transform-origin:center;}
    .logo:hover .logo-mark{animation:tickle 650ms ease-in-out both;}
    @keyframes tickle{0%{transform:translateX(0) rotate(0deg)}15%{transform:translateX(-3px) rotate(-2deg)}30%{transform:translateX(3px) rotate(2deg)}45%{transform:translateX(-2px) rotate(-1deg)}60%{transform:translateX(2px) rotate(1deg)}100%{transform:translateX(0) rotate(0deg)}}

    .wrap{max-width:1160px;margin:0 auto;padding:26px 18px 60px;display:grid;grid-template-columns:1fr 360px;gap:18px;align-items:start;}
    @media (max-width:980px){.wrap{grid-template-columns:1fr}.sidebar{width:min(420px,calc(100vw - 36px));margin:0 auto}}
    @media (max-width:560px){.sidebar{width:min(420px,calc(100vw - 24px));}}

    article{background:#fff;border:1px solid var(--line);border-radius:26px;padding:22px;box-shadow:var(--shadow2)}
    h1{margin:0;font-size:28px;letter-spacing:-.4px;line-height:1.2}
    .meta{margin-top:10px;color:var(--muted);font-size:13px;font-weight:900}
    .lead{margin-top:14px;color:#374151;line-height:1.75}

    .sec{margin-top:18px;border-top:1px solid #f1f2f6;padding-top:14px}
    .sec h2{margin:0 0 10px;font-size:18px;letter-spacing:-.2px}
    .sec p{margin:0 0 10px;color:#374151;line-height:1.75}

    .sidebar{position:sticky;top:78px;will-change:transform}
    .panel{background:#fff;border:1px solid var(--line);border-radius:26px;box-shadow:var(--shadow);overflow:hidden}
    .head{padding:14px;background:linear-gradient(180deg,#fff3ea,#fff);border-bottom:1px solid #f1f2f6;display:flex;justify-content:space-between;gap:10px}
    .chip{font-size:12px;font-weight:900;padding:8px 10px;border-radius:999px;border:1px solid #ffd9c0;background:#fff7f1;color:#c2410c;white-space:nowrap}
    .list{padding:12px;display:flex;flex-direction:column;gap:10px}
    .card{border-radius:18px;border:1px solid #eef0f5;background:linear-gradient(180deg,#fff,#fff7f1);box-shadow:0 10px 20px rgba(17,24,39,.06);padding:12px;display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;overflow:hidden;position:relative}
    .card:before{content:"";position:absolute;inset:-40% auto auto -40%;width:180px;height:180px;background:radial-gradient(circle,rgba(255,122,24,.18),transparent 62%);transform:rotate(15deg)}
    .m{position:relative;display:flex;flex-direction:column;gap:6px;min-width:0}
    .n{font-weight:900;display:flex;gap:8px;align-items:center}
    .s{font-size:11px;color:#9ca3af;font-weight:800;border:1px solid #eef0f5;padding:4px 8px;border-radius:999px;background:#fff;white-space:nowrap}
    .pill{font-weight:900;border-radius:14px;border:1px solid #ffd9c0;background:#fff;padding:8px 10px;display:inline-flex;gap:8px;align-items:center;box-shadow:inset 0 -2px 0 rgba(255,122,24,.12)}
    .btn{border:0;border-radius:12px;font-weight:900;padding:10px 12px;cursor:pointer;box-shadow:0 10px 18px rgba(17,24,39,.08)}
    .copy{background:#fff;border:1px solid #e9e9ee;color:#111827}
    .go{background:linear-gradient(180deg,var(--brand2),var(--brand));color:#fff}

    .fab{position:fixed;right:16px;bottom:16px;width:58px;height:58px;border-radius:999px;border:1px solid rgba(255,255,255,.7);background:rgba(255,255,255,.55);backdrop-filter:blur(8px);box-shadow:0 18px 34px rgba(17,24,39,.16);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:200}
    .fab span{width:24px;height:24px;border-radius:8px;background:linear-gradient(180deg,var(--brand2),var(--brand));display:inline-block;position:relative}
    .fab span:before{content:"";position:absolute;inset:6px;border-radius:5px;border:2px solid rgba(255,255,255,.9)}
    .toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);background:#111827;color:#fff;padding:10px 14px;border-radius:999px;font-weight:900;font-size:13px;opacity:0;pointer-events:none;transition:opacity .18s ease, transform .18s ease;z-index:1000}
    .toast.show{opacity:1;transform:translateX(-50%) translateY(-6px)}
  </style>
</head>

<body>
  <header class="topbar">
    <div class="logo" id="logoBtn"><div class="logo-mark">TFY</div></div>
  </header>

  <main class="wrap">
    <article>
      <h1>(여기에 글 제목)</h1>
      <div class="meta">TFY 편집팀 · 업데이트: 상시 · 카테고리: (여기에 카테고리)</div>

      <!-- ✅ 여기서부터 본문만 채우면 됩니다 -->
      <p class="lead">
        (서론) 테무(Temu)에서 자주 검색되는 핵심 이슈를 실제 흐름 기준으로 정리합니다.
        오늘 글은 “어디서 막히는지 → 어떤 기준으로 해결하는지”를 빠르게 잡아주는 기사형 구조입니다.
      </p>

      <div class="sec">
        <h2>핵심 요약</h2>
        <p>(여기에 요약 3~5문장)</p>
      </div>

      <div class="sec">
        <h2>막히는 지점이 발생하는 구조</h2>
        <p>(여기에 설명)</p>
      </div>

      <div class="sec">
        <h2>해결 루트</h2>
        <p>(여기에 단계별 루트)</p>
      </div>

      <div class="sec">
        <h2>체크리스트</h2>
        <p>(여기에 체크리스트)</p>
      </div>

      <div class="sec">
        <h2>자주 묻는 질문</h2>
        <p>(여기에 FAQ)</p>
      </div>

      <!-- ✅ 2900자 이상 글 완성은 다음 단계에서 제가 본문만 채워드리면 됩니다 -->
    </article>

    <aside class="sidebar" id="sidebar">
      <div class="panel">
        <div class="head">
          <div>
            <b>🔥 쿠폰 코드 · 링크</b>
            <div style="margin-top:4px;color:#6b7280;font-size:12px;line-height:1.4">부드럽게 뒤따라오며 시선을 끄는 패널</div>
          </div>
          <div class="chip">관성 추적</div>
        </div>
        <div class="list" id="couponList"></div>
      </div>
    </aside>
  </main>

  <button class="fab" id="fabBtn"><span></span></button>
  <div class="toast" id="toast">복사 완료</div>

  <script src="./posts-data.js"></script>
  <script>
    const $=(s)=>document.querySelector(s);

    function shuffle(arr){
      const a=arr.slice();
      for(let i=a.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [a[i],a[j]]=[a[j],a[i]];
      }
      return a;
    }

    function showToast(msg){
      const t=$("#toast");
      t.textContent=msg||"복사 완료";
      t.classList.add("show");
      setTimeout(()=>t.classList.remove("show"),900);
    }

    async function copyText(text){
      try{await navigator.clipboard.writeText(text);showToast("복사 완료");}
      catch(e){
        const ta=document.createElement("textarea");
        ta.value=text;document.body.appendChild(ta);
        ta.select();document.execCommand("copy");
        document.body.removeChild(ta);
        showToast("복사 완료");
      }
    }

    function renderCoupons(){
      const list=$("#couponList");
      list.innerHTML="";
      for(const c of shuffle(window.TFY_COUPONS||[])){
        const card=document.createElement("div");
        card.className="card";
        const meta=document.createElement("div");
        meta.className="m";
        meta.innerHTML=`<div class="n"><span>${c.name}</span><span class="s">${c.who}</span></div>
                        <div class="pill"><span style="font-weight:900;color:#fb923c;">CODE</span> <b>${c.code}</b></div>`;
        const btns=document.createElement("div");
        btns.style.display="flex";btns.style.gap="8px";
        const b1=document.createElement("button");
        b1.className="btn copy";b1.textContent="복사";b1.onclick=()=>copyText(c.code);
        const b2=document.createElement("button");
        b2.className="btn go";b2.textContent="이동";b2.onclick=()=>window.open(c.link,"_blank","noopener,noreferrer");
        btns.appendChild(b1);btns.appendChild(b2);
        card.appendChild(meta);card.appendChild(btns);
        list.appendChild(card);
      }
    }

    function enableInertiaFollow(){
      const sidebar=$("#sidebar");
      let targetY=0,currentY=0;
      window.addEventListener("mousemove",(e)=>{
        const center=window.innerHeight/2;
        const dy=(e.clientY-center)*0.12;
        targetY=Math.max(-40,Math.min(120,dy));
      },{passive:true});
      (function tick(){
        currentY+=(targetY-currentY)*0.08;
        sidebar.style.transform=`translateY(${currentY}px)`;
        requestAnimationFrame(tick);
      })();
    }

    $("#logoBtn").addEventListener("click", ()=>{
      const mark=document.querySelector(".logo-mark");
      mark.style.animation="none"; void mark.offsetWidth;
      mark.style.animation="tickle 650ms ease-in-out both";
    });

    $("#fabBtn").addEventListener("click", ()=>{
      document.querySelector(".panel").scrollIntoView({behavior:"smooth", block:"start"});
    });

    renderCoupons();
    enableInertiaFollow();
  </script>
</body>
</html>
