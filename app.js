/**
 * TFY App Bootstrap
 * - Index: render categories + mount sidebar coupons + inertia follow
 * - Post: mount sidebar coupons + inertia follow + modal
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Sidebar coupons (exists on index & post)
  tfyMountCouponsSidebar('[data-coupons-sidebar]', { slots: 6 }).catch(()=>{});

  // Inertia follow effect on right panel
  tfyInitInertiaFollow('[data-follow-panel]');

  // Index-only: categories
  if(document.body.classList.contains('page-index')){
    tfyRenderCategories('[data-categories]').catch(()=>{});
  }

  // Modal coupons (optional)
  const modalBackdrop = document.querySelector('[data-modal-backdrop]');
  const openBtn = document.querySelector('[data-open-coupons]');
  const closeBtn = document.querySelector('[data-close-modal]');

  if(modalBackdrop && openBtn){
    openBtn.addEventListener('click', async ()=>{
      modalBackdrop.classList.add('open');
      await tfyMountCouponsModal('[data-modal]');
    });
  }
  if(modalBackdrop && closeBtn){
    closeBtn.addEventListener('click', ()=> modalBackdrop.classList.remove('open'));
    modalBackdrop.addEventListener('click', (e)=>{
      if(e.target === modalBackdrop) modalBackdrop.classList.remove('open');
    });
  }
});
