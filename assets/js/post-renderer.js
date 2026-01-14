/* TFY post renderer (simple)
   If this template page is used with ?slug=xxx, redirect to /posts/xxx.html.
   This avoids "design missing" issues caused by partial templates.
*/
(function(){
  try{
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug') || params.get('p') || '';
    if(slug){
      window.location.replace(`posts/${encodeURIComponent(slug)}.html`);
      return;
    }
  }catch(_){}
})();
