(function(){
  // 글 파일에서 아래 3개만 바꿔치기하면 됩니다.
  // 1) window.__POST = { title, meta, kicker, breadcrumb, contentHTML }
  // 2) 이 스크립트는 그 값을 화면에 넣습니다.

  function setText(id, v){
    const el = document.getElementById(id);
    if (el && v != null) el.textContent = String(v);
  }
  function setHTML(id, v){
    const el = document.getElementById(id);
    if (el && v != null) el.innerHTML = String(v);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const p = window.__POST;
    if (!p) return;

    setText("postTitle", p.title);
    setText("postMeta", p.meta);
    setText("postKicker", p.kicker);
    setText("postBreadcrumb", p.breadcrumb);
    setHTML("postContent", p.contentHTML);
  });
})();
