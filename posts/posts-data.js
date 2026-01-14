/**
 * TFY Posts Data Loader
 * - Loads /data/posts.json
 * - Exposes window.TFY_POSTS
 */
async function tfyLoadPosts(){
  const res = await fetch('./data/posts.json', { cache: 'no-store' });
  if(!res.ok) throw new Error('posts.json load failed');
  return await res.json();
}
