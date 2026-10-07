const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync('dist/desk-intro.js','utf8');
function page({seen=false,reduced=false,storageBlocked=false}={}) {
 const events=new Map(),timers=new Map(),animations=[];let clock=0,seq=0;
 const classes=new Set();
 const el=tag=>({tagName:tag,inert:false,style:{removeProperty(k){delete this[k];}},children:[],classList:{add(){}},setAttribute(){},addEventListener(){},insertBefore(e){e.parentNode=this;},getBoundingClientRect(){return {left:0,top:0,right:1200,bottom:600};},append(...els){this.children.push(...els);els.forEach(e=>e.parentNode=this);},remove(){this.removed=true;},focus(){this.focused=true;},animate(frames,options){const a={frames,options,cancel(){this.cancelled=true;}};animations.push(a);return a;}});
 const html={lang:'en',classList:{add:c=>classes.add(c),remove:(...cs)=>cs.forEach(c=>classes.delete(c)),replace:(a,b)=>{classes.delete(a);classes.add(b);}}};
 const header=el('HEADER'),main=el('MAIN'),canvas=el('CANVAS'),stage=Object.assign(el('DIV'),{clientWidth:1200,clientHeight:600}),link=el('A');
 canvas.parentNode=stage;canvas.nextSibling=null;
 const on=(k,f)=>{if(!events.has(k))events.set(k,new Set());events.get(k).add(f);};
 const off=(k,f)=>events.get(k)?.delete(f);
 const document={documentElement:html,hidden:false,activeElement:null,body:Object.assign(el('BODY'),{children:[header,main]}),addEventListener:on,removeEventListener:off,createElement:el,createElementNS:(_,tag)=>el(tag),querySelector:s=>({'#desk-stage':stage,'#desk-canvas':canvas,'header a':link}[s]),querySelectorAll:()=>[header]};
 const context={innerWidth:1200,innerHeight:600,document,location:{pathname:'/'},scrollY:0,matchMedia:()=>({matches:reduced,addEventListener:on,removeEventListener:off}),sessionStorage:{getItem(){if(storageBlocked)throw Error();return seen?'1':null;},setItem(){seen=true;}},setTimeout:(f,ms)=>{timers.set(++seq,{f,at:clock+ms});return seq;},clearTimeout:id=>timers.delete(id),addEventListener:on,removeEventListener:off};context.window=context;
 vm.runInNewContext(source,context);
 const emit=(type,e={})=>[...(events.get(type)||[])].forEach(f=>f(e));
 const tick=ms=>{clock+=ms;for(const [id,t] of [...timers])if(t.at<=clock){timers.delete(id);t.f();}};
 return {context,classes,animations,header,main,stage,document,emit,tick,link};
}
const corners=[[580,240],[880,240],[880,420],[580,420]];
test('uses screen coordinates, uniform scale, and restores the exact scene after 4000ms',()=>{
 const p=page();p.emit('DOMContentLoaded');p.context.deskIntro.start(corners);
 assert(p.classes.has('desk-intro-playing'));assert(p.main.inert);
 assert.equal(p.animations[0].options.duration,4000);
 assert.match(p.animations[0].frames[0].transform,/translate\(-2422\.2px,-1066\.1999999999998px\) scale\(4\.14\)/);
 assert.equal(p.animations[0].frames.at(-1).transform,'translate(0px,0px) scale(1)');
 p.tick(4000);assert.equal(p.classes.size,0);assert.equal(p.main.inert,false);assert(p.animations.every(a=>a.cancelled));
});
test('reduced motion, repeat visits and blocked storage do not hide or animate content',()=>{
 for(const options of [{seen:true},{reduced:true},{storageBlocked:true}]){const p=page(options);assert.equal(p.classes.size,0);assert.equal(p.context.deskIntro,undefined);}
});
test('slow assets reveal the normal homepage and cannot start a late animation',()=>{
 const p=page();p.emit('DOMContentLoaded');p.tick(8000);p.context.deskIntro.start(corners);assert.equal(p.classes.size,0);assert.equal(p.main.inert,false);assert.equal(p.animations.length,0);
});
test('Escape, resize during playback, and backgrounding clean up all animation state',()=>{
 for(const event of ['keydown','resize','visibilitychange']){const p=page();p.emit('DOMContentLoaded');p.context.deskIntro.start(corners);if(event==='visibilitychange')p.document.hidden=true;p.emit(event,{key:'Escape',preventDefault(){}});assert.equal(p.classes.size,0);assert.equal(p.main.inert,false);assert(p.animations.every(a=>a.cancelled));}
});
test('initial viewport resize does not cancel a pending intro',()=>{
 const p=page();p.emit('DOMContentLoaded');p.emit('resize');p.context.deskIntro.start(corners);assert(p.classes.has('desk-intro-playing'));
});

test('returns the live canvas and changes night to day only once after pull-back',()=>{
 const p=page();let changes=0;p.emit('DOMContentLoaded');p.context.deskIntro.start(corners,{day:()=>changes++});
 p.tick(2800);assert.equal(changes,1);assert(p.classes.has('desk-intro-playing'));
 p.tick(1200);assert.equal(changes,1);assert.equal(p.main.inert,false);
});

test('temporary intro lighting never saves over manual preferences and waits for the window',async()=>{
 const src=fs.readFileSync('dist/desk.js','utf8');const body=src.slice(src.indexOf('async function chooseMood('),src.indexOf(' async function chooseImage('));
 const calls=[];const context={currentMood:'night',customImage:null,stage:{dataset:{}},document:{documentElement:{dataset:{}}},localStorage:{setItem(){calls.push('write');}},applyLamp:d=>calls.push('light:'+d),chooseImage:async()=>calls.push('window'),viewMat:{opacity:1},save:()=>true,status:{},say:x=>x};
 vm.runInNewContext(body+';this.chooseMood=chooseMood;',context);await context.chooseMood('day',false,1000);assert.deepEqual(calls,['window','light:1000']);assert.equal(context.currentMood,'day');
});

test('asset preparation time does not consume the four-second animation',()=>{
 const p=page();p.emit('DOMContentLoaded');p.tick(5000);
 assert(p.classes.has('desk-intro-pending'));
 p.context.deskIntro.start(corners);
 assert.equal(p.animations[0].options.duration,4000);
 p.tick(3999);assert(p.classes.has('desk-intro-playing'));
 p.tick(1);assert.equal(p.classes.size,0);
});
