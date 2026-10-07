document.querySelectorAll('[data-cv-scroll]').forEach(button=>button.addEventListener('click',()=>{
 const track=button.closest('.cv-pages').querySelector('.cv-carousel');
 const distance=track.querySelector('figure').getBoundingClientRect().width+parseFloat(getComputedStyle(track).gap);
 track.scrollBy({left:Number(button.dataset.cvScroll)*distance,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}));
