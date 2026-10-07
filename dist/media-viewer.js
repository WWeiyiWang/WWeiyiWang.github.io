(()=>{
const triggers=[...document.querySelectorAll('[data-media]')];if(!triggers.length)return;
const dialog=document.createElement('dialog');dialog.className='media-viewer';dialog.setAttribute('aria-label','Media preview');
const close=document.createElement('button');close.type='button';close.className='media-close';close.textContent='×';close.setAttribute('aria-label','Close preview');
const content=document.createElement('div');content.className='media-viewer-content';dialog.append(close,content);document.body.append(dialog);let opener;
function dismiss(){dialog.close();}
close.addEventListener('click',dismiss);dialog.addEventListener('click',e=>{if(e.target===dialog)dismiss();});
dialog.addEventListener('close',()=>{content.querySelector('video')?.pause();content.replaceChildren();document.documentElement.classList.remove('media-open');opener?.focus();});
triggers.forEach(button=>button.addEventListener('click',e=>{e.preventDefault();opener=button;const isVideo=button.dataset.media==='video',media=document.createElement(isVideo?'video':'img');media.src=button.getAttribute('href');if(isVideo){media.controls=true;media.playsInline=true;media.preload='metadata';}else media.alt=button.querySelector('img')?.alt||'Publication illustration';content.replaceChildren(media);const title=button.dataset[document.documentElement.lang.startsWith('zh')?'captionZh':'captionEn'];if(title){const caption=document.createElement('p');caption.className='media-viewer-caption';caption.textContent=title;content.append(caption);}dialog.showModal();document.documentElement.classList.add('media-open');close.focus();}));
})();
