(async function(){
  const POSTS_URL = "./data/posts.json";

  function el(tag, cls){
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  }

  function safeStr(v){ return (v==null) ? "" : String(v); }

  async function loadJSON(url){
    const r = await fetch(url, { cache:"no-store" });
    return r.json();
  }

  function renderCats(grid, categories){
    grid.innerHTML = "";

    categories.forEach(cat => {
      const box = el("section","cat-box");

      const head = el("div","cat-head");
      const title = el("div","cat-title");
      title.textContent = safeStr(cat.title);

      const meta = el("div","cat-meta");
      meta.textContent = "스크롤";

      head.appendChild(title);
      head.appendChild(meta);

      const list = el("div","cat-list");

      (cat.items || []).forEach(p => {
        const row = document.createElement("a");
        row.className = "post-row";

        const t = el("div","post-title");
        t.textContent = safeStr(p.title);

        const status = safeStr(p.status).toLowerCase();
        const ready = (status === "ready");
        const pill = el("span", "pill " + (ready ? "pill-ready" : "pill-soon"));
        pill.textContent = ready ? "완료" : "준비중";

        // href 처리
        const href = safeStr(p.href).trim();
        if (ready && href){
          row.href = href;
        } else {
          row.href = "#";
          row.classList.add("disabled");
          row.setAttribute("aria-disabled","true");
          row.addEventListener("click", (e)=>e.preventDefault());
        }

        row.appendChild(t);
        row.appendChild(pill);
        list.appendChild(row);
      });

      box.appendChild(head);
      box.appendChild(list);
      grid.appendChild(box);
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const grid = document.getElementById("catsGrid");
    if (!grid) return;

    const data = await loadJSON(POSTS_URL);
    renderCats(grid, data.categories || []);
  });
})();
 
