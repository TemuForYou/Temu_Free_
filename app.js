/* ================================
   TemuForYou - app.js (FULL)
   ================================ */

document.addEventListener("DOMContentLoaded", () => {
  loadPosts();
});

/* ================================
   POSTS LOAD
   ================================ */
async function loadPosts() {
  try {
    const res = await fetch("data/posts.json");
    if (!res.ok) throw new Error("posts.json not found");

    const posts = await res.json();
    renderCategories(posts);
  } catch (err) {
    console.error("Failed to load posts:", err);
  }
}

/* ================================
   CATEGORY RENDER
   ================================ */
function renderCategories(posts) {
  const container = document.getElementById("categoryContainer");
  if (!container) return;

  container.innerHTML = "";

  // 카테고리별 분류
  const grouped = {};
  posts.forEach(post => {
    if (!grouped[post.category]) {
      grouped[post.category] = [];
    }
    grouped[post.category].push(post);
  });

  Object.keys(grouped).forEach(categoryName => {
    const section = document.createElement("section");
    section.className = "category-section";

    const title = document.createElement("h2");
    title.className = "category-title";
    title.textContent = categoryName;
    section.appendChild(title);

    const list = document.createElement("div");
    list.className = "post-list";

    grouped[categoryName].forEach(post => {
      const item = document.createElement("div");
      item.className = "post-item";

      const postTitle = document.createElement("div");
      postTitle.className = "post-title";
      postTitle.textContent = post.title;

      const meta = document.createElement("div");
      meta.className = "post-meta";
      meta.textContent = `${post.date || ""} · 쿠폰 포함`;

      item.appendChild(postTitle);
      item.appendChild(meta);

      // ✅ 완료된 글만 클릭 가능
      if (post.done === true && post.file) {
        item.classList.add("active");
        item.addEventListener("click", () => {
          window.location.href = post.file;
        });
      } else {
        item.classList.add("disabled");

        const badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = "준비중";
        item.appendChild(badge);
      }

      list.appendChild(item);
    });

    section.appendChild(list);
    container.appendChild(section);
  });
}
