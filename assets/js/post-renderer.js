async function tfyFileExists(url){
  try{
    const res = await fetch(url, { method:'HEAD', cache:'no-store' });
    return res.ok;
  }catch(e){
    return false;
  }
}

async function tfyLoadPostsJson(path){
  const res = await fetch(path, { cache:'no-store' });
  if(!res.ok) throw new Error('posts.json load failed');
  return res.json();
}

function tfyEscapeHtml(str){
  return String(str ?? '')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'","&#039;");
}

function tfyStatusTag(status){
  const s = (status || 'todo').toLowerCase();
  if(s === 'done') return `<span class="tag done">완료</span>`;
  return `<span class="tag todo">준비중</span>`;
}

function tfyRenderCategoryCard(cat){
  const items = Array.isArray(cat.items) ? cat.items : [];
  const preview = items.slice(0, 5);

  const html = `
    <article class="catCard">
      <div class="catHead">
        <div>
          <h3 class="catTitle">${tfyEscapeHtml(cat.title || '')}</h3>
          <div class="catMeta">총 ${items.length}개</div>
        </div>
        <a class="btn" href="#popular" aria-label="인기글로 이동">보기</a>
      </div>

      <div class="catList">
        ${preview.map(p => `
          <div class="postRow">
            <div>
              <div class="postRowTitle">${tfyEscapeHtml(p.title || '')}</div>
              <div class="postRowSub">${tfyEscapeHtml(p.desc || '')}</div>
            </div>

            <div class="postRowRight">
              ${tfyStatusTag(p.status)}
              ${p.url ? `<a class="btn primary" href="${tfyEscapeHtml(p.url)}">이동</a>` : `<span class="btn" aria-disabled="true">대기</span>`}
            </div>
          </div>
        `).join('')}
      </div>
    </article>
  `;
  return html;
}

async function tfyRenderCategories(containerSel = '[data-categories]', jsonPath = './data/posts.json'){
  const el = document.querySelector(containerSel);
  if(!el) return;

  const data = await tfyLoadPostsJson(jsonPath);
  const cats = Array.isArray(data.categories) ? data.categories : [];

  el.innerHTML = cats.map(tfyRenderCategoryCard).join('');
}

// 전역
window.tfyRenderCategories = tfyRenderCategories;
