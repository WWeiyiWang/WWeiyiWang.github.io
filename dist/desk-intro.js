// One compositor-only introduction to the existing live desk, never a replacement scene.
(() => {
  const html = document.documentElement;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const key = 'weiyi-desk-intro-seen-v3';
  const duration = 4000;
  const revealAt = 2800;
  if (location.pathname !== '/' || motion.matches) return;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch { return; } // Without session storage, prefer no repeated animation.
  html.classList.add('desk-intro-pending');
  let done = false, started = false, skip, overlay, edgeBlur, timer, revealTimer, layer, liveCanvas, canvasHome, canvasNext, day;
  const restoreCanvas = () => {
    if(liveCanvas){canvasHome.insertBefore(liveCanvas,canvasNext);liveCanvas.style.removeProperty('width');liveCanvas.style.removeProperty('height');liveCanvas=null;}
    layer?.remove();layer=null;
  };
  const animations = [], inert = [];
  const finish = () => {
    if (done) return;
    done = true;
    clearTimeout(timer);clearTimeout(revealTimer);
    const focusedSkip = document.activeElement === skip;
    animations.forEach(a => a.cancel());
    restoreCanvas();
    if(day){const showDay=day;day=null;showDay();}
    html.classList.remove('desk-intro-pending', 'desk-intro-playing');
    inert.forEach(([el, value]) => { el.inert = value; });
    overlay?.remove(); edgeBlur?.remove(); skip?.remove();
    window.removeEventListener('resize', resized);
    window.removeEventListener('pagehide', finish);
    document.removeEventListener('keydown', escape);
    document.removeEventListener('visibilitychange', hidden);
    motion.removeEventListener('change', finish);
    if (focusedSkip) document.querySelector('header a')?.focus({preventScroll:true});
  };
  const escape = e => { if (e.key === 'Escape') { e.preventDefault(); finish(); } };
  const hidden = () => { if (document.hidden) finish(); };
  const resized = () => { if (started) finish(); };
  window.addEventListener('resize', resized);
  window.addEventListener('pagehide', finish);
  document.addEventListener('keydown', escape);
  document.addEventListener('visibilitychange', hidden);
  motion.addEventListener('change', finish);
  // Slow WebGL/assets must not hold visitors behind a loading curtain.
  timer = setTimeout(finish, 2800);
  document.addEventListener('DOMContentLoaded', () => {
    if (done) return;
    clearTimeout(timer); timer = setTimeout(finish, 2200);
    for (const el of document.body.children) {
      if (['SCRIPT','LINK','STYLE'].includes(el.tagName)) continue;
      inert.push([el, el.inert]); el.inert = true;
    }
    skip = document.createElement('button');
    skip.className = 'desk-intro-skip'; skip.type = 'button';
    skip.textContent = html.lang === 'zh-CN' ? '跳过开场' : 'Skip intro';
    skip.addEventListener('click', finish); document.body.append(skip);
  }, {once:true});
  window.deskIntro = {
    finish,
    get active(){return !done;},
    start(points, options = {}) {
      day=options.day;
      if(done){day?.();day=null;return;}
      if (done || started || motion.matches || document.hidden || scrollY > 20) { finish(); return; }
      const stage = document.querySelector('#desk-stage'), canvas = document.querySelector('#desk-canvas');
      if (!stage || !canvas || points.length !== 4 || !points.flat().every(Number.isFinite)) { finish(); return; }
      started = true; clearTimeout(timer); timer = setTimeout(finish,duration);
      const w = stage.clientWidth, h = stage.clientHeight;
      const rect=stage.getBoundingClientRect(),vw=innerWidth,vh=innerHeight;
      const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
      const sw = Math.max(...xs)-Math.min(...xs), sh = Math.max(...ys)-Math.min(...ys);
      if (sw < 1 || sh < 1) { finish(); return; }
      const cx = xs.reduce((a,b)=>a+b)/4, cy = ys.reduce((a,b)=>a+b)/4;
      // Uniform scaling around the actual screen; preserve its perspective and aspect ratio.
      const scale = Math.max(vw/sw, vh/sh)*1.035;
      const start = `translate(${vw/2-rect.left-scale*cx}px,${vh/2-rect.top-scale*cy}px) scale(${scale})`;
      const settle = `translate(${-w*.0075}px,${-h*.0075}px) scale(1.015)`;
      const frames = [{transform:start,offset:0},{transform:start,offset:1750/duration,easing:'cubic-bezier(.42,0,.22,1)'},{transform:settle,offset:2500/duration,easing:'cubic-bezier(.2,0,.2,1)'},{transform:'translate(0px,0px) scale(1)',offset:revealAt/duration},{transform:'translate(0px,0px) scale(1)',offset:1}];
      const ns = 'http://www.w3.org/2000/svg';
      overlay = document.createElementNS(ns,'svg'); overlay.classList.add('desk-intro-screen');
      overlay.setAttribute('viewBox',`0 0 ${w} ${h}`); overlay.setAttribute('aria-hidden','true');
      const screen = document.createElementNS(ns,'polygon');
      screen.setAttribute('points',points.map(p=>p.join(',')).join(' ')); screen.setAttribute('fill','#080a0c');
      const name = document.createElementNS(ns,'text');
      name.setAttribute('x',cx); name.setAttribute('y',cy-sw/80); name.setAttribute('text-anchor','middle');
      name.setAttribute('dominant-baseline','middle'); name.setAttribute('font-size',sw/60);
      name.setAttribute('letter-spacing',sw/220); name.setAttribute('fill','#d5d9dc'); name.textContent='WEIYI WANG';
      const identity = document.createElementNS(ns,'text');
      identity.setAttribute('x',cx); identity.setAttribute('y',cy+sw/65);
      identity.setAttribute('text-anchor','middle'); identity.setAttribute('dominant-baseline','middle');
      identity.setAttribute('font-size',sw/105); identity.setAttribute('letter-spacing',sw/420);
      identity.setAttribute('fill','#a8b0b8'); identity.textContent='ARCHITECTURE × TECHNOLOGY';
      layer=document.createElement('div');layer.classList.add('desk-intro-fullscreen');
      const frame=document.createElement('div');frame.classList.add('desk-intro-frame');
      Object.assign(frame.style,{left:rect.left+'px',top:rect.top+'px',width:w+'px',height:h+'px'});
      canvasHome=canvas.parentNode;canvasNext=canvas.nextSibling;liveCanvas=canvas;
      canvas.style.width=w+'px';canvas.style.height=h+'px';
      frame.append(canvas);layer.append(frame);document.body.append(layer);
      overlay.append(screen,name,identity);frame.append(overlay);
      edgeBlur=document.createElement('div'); edgeBlur.classList.add('desk-intro-edge');
      edgeBlur.setAttribute('aria-hidden','true'); layer.append(edgeBlur);
      html.classList.replace('desk-intro-pending','desk-intro-playing');
      const animate = (el,frames,options) => { const a=el.animate(frames,options); animations.push(a); return a; };
      animate(canvas,frames,{duration,fill:'both'});
      animate(overlay,frames,{duration,fill:'both'});
      animate(screen,[{opacity:1,fill:'#080a0c'},{opacity:1,fill:'#141b22',offset:250/2050},{opacity:1,fill:'#141b22',offset:1900/2050},{opacity:0,fill:'#141b22'}],{duration:2050,fill:'both',easing:'ease-in-out'});
      for(const text of [name,identity]) animate(text,[{opacity:0},{opacity:.85,offset:250/1900},{opacity:.85,offset:1750/1900},{opacity:0}],{duration:1900,fill:'both',easing:'ease-in-out'});
      animate(edgeBlur,[{opacity:0},{opacity:0,offset:1750/duration},{opacity:.7,offset:2050/duration},{opacity:0,offset:2500/duration},{opacity:0}],{duration,fill:'both',easing:'ease-in-out'});
      const crop=`inset(${rect.top}px ${Math.max(0,vw-rect.right)}px ${Math.max(0,vh-rect.bottom)}px ${rect.left}px)`;
      animate(layer,[{clipPath:'inset(0px)'},{clipPath:'inset(0px)',offset:2500/duration},{clipPath:crop,offset:revealAt/duration},{clipPath:crop}],{duration,fill:'both'});
      revealTimer=setTimeout(()=>{restoreCanvas();if(day){const showDay=day;day=null;showDay();}},revealAt);
      for (const el of document.querySelectorAll('header,.desk-heading,.desk-caption,#desk-stage > :not(canvas):not(.desk-intro-screen):not(.desk-intro-edge),.home-projects,footer')) {
        animate(el,[{opacity:0},{opacity:0,offset:2500/duration},{opacity:1}],{duration,fill:'both'});
      }
    }
  };
})();
