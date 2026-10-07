import * as THREE from './vendor/three.module.min.js';
import {citySVG} from './window-city.js';

const stage=document.querySelector('#desk-stage');
const canvas=document.querySelector('#desk-canvas');
const loading=document.querySelector('#desk-loading');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const zh=()=>document.documentElement.lang==='zh-CN';
const say=(en,cn)=>zh()?cn:en;
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});}catch{
 stage.classList.add('has-error');loading.textContent=say('The 3D view is unavailable. Use the top navigation to explore.','当前设备无法显示三维场景，请使用顶部导航浏览。');
}
if(renderer) init().catch(()=>{stage.classList.add('has-error');loading.hidden=false;loading.textContent=say('The desk could not load. All pages are available using the top navigation.','书桌暂时无法加载，你仍可使用顶部导航访问全部页面。');});

async function init(){
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.VSMShadowMap;
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0xffffff,1);
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.16;
 const scene=new THREE.Scene();
 const camera=new THREE.OrthographicCamera(-6,6,4,-4,.1,80);
 camera.position.set(2.1,3.45,17);camera.lookAt(0,2.1,0);
 const ambient=new THREE.HemisphereLight(0xffffff,0xc8cedb,1.5);scene.add(ambient);
 const sun=new THREE.DirectionalLight(0xfff3e4,2.05);sun.position.set(-3,7,-4);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-8;sun.shadow.camera.right=8;sun.shadow.camera.top=8;sun.shadow.camera.bottom=-8;sun.shadow.normalBias=.015;sun.shadow.radius=5;sun.shadow.blurSamples=8;scene.add(sun);
 const fill=new THREE.DirectionalLight(0xdce5ff,.65);fill.position.set(6,5,-4);scene.add(fill);
 const root=new THREE.Group();scene.add(root);
 const mat=(color,roughness=.65,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
 const white=mat('#ebe9e3'),edge=mat('#b8bdc6'),dark=mat('#27292a',.86),silver=mat('#777a7c',.48,.45),wood=mat('#c9bba3'),paper=mat('#e9e5dc',.94),violet=mat('#656b73'),glass=new THREE.MeshPhysicalMaterial({color:'#354049',roughness:.12,metalness:.3,clearcoat:1,clearcoatRoughness:.12});
 // Small bevels only on broad surfaces; slim structural members remain simple boxes.
 function beveledBox(w,h,d){const g=new THREE.BoxGeometry(w,h,d,4,4,4),p=g.attributes.position,n=g.attributes.normal;const sizes=[w,h,d],r=Math.min(.022,Math.min(w,h,d)*.22);for(let i=0;i<p.count;i++){const v=new THREE.Vector3(p.getX(i),p.getY(i),p.getZ(i));for(let a=0;a<3;a++){const half=sizes[a]/2,raw=v.getComponent(a);v.setComponent(a,Math.abs(raw)<half*.1?0:Math.sign(raw)*(Math.abs(raw)>half*.9?half:half-r));}const inner=new THREE.Vector3(...sizes.map((d,a)=>THREE.MathUtils.clamp(v.getComponent(a),-d/2+r,d/2-r)));const normal=v.clone().sub(inner).normalize();v.copy(inner).addScaledVector(normal,r);p.setXYZ(i,v.x,v.y,v.z);n.setXYZ(i,normal.x,normal.y,normal.z);}return g;}
 const box=(parent,w,h,d,x,y,z,m)=>{const major=w>.5&&Math.max(h,d)>.5;const o=new THREE.Mesh(major?beveledBox(w,h,d):new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;};
 const cyl=(parent,r1,r2,h,x,y,z,m)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,48),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;};
 const plane=(parent,w,h,x,y,z,m)=>{const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);o.position.set(x,y,z);parent.add(o);return o;};
 const texture=(draw,w=1024,h=640)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=renderer.capabilities.getMaxAnisotropy();return tx;};

 const screenDrawers=[];
 const screenTex=(title,sub)=>{
  const images=[],tx=texture(()=>{});
  const draw=()=>{const ctx=tx.image.getContext('2d'),w=tx.image.width,h=tx.image.height,night=document.documentElement.dataset.theme==='night';
   ctx.fillStyle=night?'#202630':'#f8f8f6';ctx.fillRect(0,0,w,h);ctx.fillStyle=night?'#e5e7ec':'#232323';ctx.font='32px Arial';ctx.fillText('WEIYI WANG',65,70);ctx.font='70px Arial';ctx.fillText(title,65,190);ctx.font='24px Arial';ctx.fillStyle=night?'#a6aebb':'#777';ctx.fillText(sub,65,240);ctx.fillStyle='#5930F5';ctx.fillRect(65,573,85,4);
   images.forEach((img,i)=>{if(!img)return;const x=i?525:65,y=290,iw=425,ih=250,r=Math.max(iw/img.width,ih/img.height),sw=iw/r,sh=ih/r;ctx.save();ctx.filter=night?'brightness(0.65)':'none';ctx.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,x,y,iw,ih);ctx.restore();});tx.needsUpdate=true;
  };
  screenDrawers.push(draw);draw();
  const sources=title==='Writing'?['/home-current/images/writing/spatial-memory.webp','/home-current/images/writing/lunar-settlement.webp']:['/home-current/images/bamor/cover.webp','/home-current/images/digital-flora/cover.webp'];
  sources.forEach((src,i)=>{const img=new Image();img.onload=()=>{images[i]=img;draw();};img.src=src;});return tx;
 };
 new MutationObserver(()=>screenDrawers.forEach(draw=>draw())).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});

 const grain=texture((ctx,w,h)=>{ctx.fillStyle='#c9b89e';ctx.fillRect(0,0,w,h);for(let i=0;i<360;i++){ctx.strokeStyle=i%3?'#b499780c':'#f6e4c515';ctx.lineWidth=.5+i%2;ctx.beginPath();const y=i*h/360;ctx.moveTo(0,y);ctx.bezierCurveTo(w*.3,y+Math.sin(i)*3,w*.7,y-2,w,y+1);ctx.stroke();}},1024,512);const deskWood=new THREE.MeshStandardMaterial({map:grain,roughness:.8});
 // A desk, rather than an enclosed room.
 box(root,10.7,.105,4.6,0,.0675,0,deskWood);
 for(const x of [-3.7,3.7])for(const z of [-1.6,1.6])box(root,.13,1.60,.13,x,-.78,z,edge);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.ShadowMaterial({opacity:.055}));ground.rotation.x=-Math.PI/2;ground.position.y=-1.6;ground.receiveShadow=true;scene.add(ground);
 const occlusion=texture((ctx,w,h)=>{const grad=ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);grad.addColorStop(0,'rgba(47,55,68,.24)');grad.addColorStop(.45,'rgba(47,55,68,.14)');grad.addColorStop(1,'rgba(47,55,68,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);},64,64);
 function contact(parent,x,z,w,d,y=.126){const o=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({map:occlusion,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));o.rotation.x=-Math.PI/2;o.position.set(x,y,z);o.raycast=()=>{};parent.add(o);}
 const objects=[];const hotbox=document.querySelector('#desk-hotspots');
 function item(key,n,en,cn,url,x,z,anchor){const g=new THREE.Group();g.position.set(x,.13,z);g.userData={key,n,en,cn,url,anchor:new THREE.Vector3(...anchor),baseY:.13};root.add(g);const a=document.createElement('a');a.className='desk-hotspot'+(['laptop','monitor'].includes(key)?' desk-hotspot-primary':'');a.href=url;a.innerHTML=`<span class="spot-number">${n}</span><span class="spot-label" data-en="${en}" data-zh="${cn}">${say(en,cn)}</span><span class="spot-arrow" aria-hidden="true">→</span>`;a.setAttribute('aria-label',say(en,cn));hotbox.append(a);g.userData.el=a;objects.push(g);a.addEventListener('mouseenter',()=>setHover(g));a.addEventListener('mouseleave',()=>setHover(null));a.addEventListener('focus',()=>setHover(g));a.addEventListener('blur',()=>setHover(null));return g;}
 const laptop=item('laptop','02','Writing','写作','/writing/',-.8,.70,[-1,1.52,0]);laptop.scale.setScalar(1.33);laptop.rotation.y=0;
 box(laptop,1.72,.085,1.2,0,.05,0,silver);box(laptop,1.58,.018,.63,0,.10,-.19,dark);
 for(let r=0;r<4;r++)for(let c=0;c<11;c++)box(laptop,.115,.014,.105,-.67+c*.133,.116,-.41+r*.15,mat('#575a5e'));
 box(laptop,.54,.018,.27,0,.104,.34,edge);
 const lid=new THREE.Group();lid.position.set(0,.10,-.55);lid.rotation.x=-.18;laptop.add(lid);
 box(lid,1.74,1.1,.065,0,.53,0,silver);box(lid,1.65,1.01,.02,0,.53,.045,dark);
 plane(lid,1.53,.89,0,.53,.06,new THREE.MeshBasicMaterial({map:screenTex('Writing','Notes, papers & ideas')}));
 const monitor=item('monitor','01','Projects','项目','/projects/',.9,-1.05,[0,2.35,.12]);
 monitor.scale.setScalar(1.3);
 box(monitor,1.02,.06,.7,0,.035,.05,silver);box(monitor,.19,.72,.15,0,.4,-.06,silver);
 box(monitor,2.45,1.47,.13,0,1.4,0,dark);plane(monitor,2.37,1.39,0,1.4,.074,new THREE.MeshBasicMaterial({map:screenTex('Selected projects','Designs, experiments & things in progress')}));
 
 const cameraBody=mat('#202223',.88);const photo=item('camera','03','Photography','摄影','/other-work/photography/',-4.1,1.28,[0,.95,.2]);photo.scale.setScalar(.85);photo.rotation.y=.05;
 box(photo,1.04,.58,.42,0,.34,0,cameraBody);box(photo,1.05,.12,.43,0,.64,0,silver);box(photo,.35,.17,.33,-.06,.74,-.015,cameraBody);
 let lens=cyl(photo,.26,.28,.41,.14,.35,.37,cameraBody);lens.rotation.x=Math.PI/2;
 lens=cyl(photo,.21,.21,.03,.14,.35,.59,silver);lens.rotation.x=Math.PI/2;
 lens=cyl(photo,.175,.175,.035,.14,.35,.612,glass);lens.rotation.x=Math.PI/2;
 cyl(photo,.09,.09,.035,.34,.726,-.03,cameraBody);box(photo,.18,.045,.17,-.34,.73,.03,violet);
 const strap=new THREE.Mesh(new THREE.TorusGeometry(.55,.025,8,50,Math.PI*1.6),cameraBody);strap.rotation.x=Math.PI/2;strap.position.set(-.21,.04,.3);photo.add(strap);
 const model=item('model','04','Models','模型','/other-work/models/',2.85,.90,[0,1.65,0]);model.scale.setScalar(1.0);model.rotation.y=0;
 box(model,1.8,.075,1.32,0,.04,0,mat('#bbae96'));
 const plaster=mat('#ddd7ca',.86);box(model,1.43,.10,1.04,0,.14,0,plaster);
 for(const x of [-.59,0,.59])for(const z of [-.38,.38])box(model,.06,.63,.06,x,.49,z,plaster);
 box(model,1.45,.075,1.05,0,.83,0,plaster);box(model,.5,.59,.04,-.42,.50,-.37,plaster);box(model,.04,.59,.5,.59,.50,-.08,plaster);
 for(let j=0;j<5;j++)box(model,.27,.025,.13,-.35,.22+j*.11,.40-j*.13,plaster);
 box(model,.58,.065,.58,.23,1.28,-.1,plaster);box(model,.04,.43,.5,.5,1.04,-.1,plaster);box(model,.5,.43,.04,.23,1.04,-.33,plaster);
 const cv=item('paper','05','CV','履历','/cv/',-2.62,1.70,[0,.52,.2]);cv.rotation.y=-.12;
 for(let i=0;i<6;i++){const p=box(cv,.82,.012,1.15,i%2*.028,.013+i*.015,i%3*.014,paper);p.rotation.y=(i-3)*.025;}
 const paperTexture=texture((ctx,w,h)=>{ctx.fillStyle='#e9e5dc';ctx.fillRect(0,0,w,h);ctx.fillStyle='#2d2d2d';ctx.font='48px Arial';ctx.fillText('WEIYI WANG',70,110);ctx.font='27px Arial';ctx.fillText('Curriculum Vitae',70,164);ctx.fillStyle='#888';for(let y=240;y<560;y+=48)ctx.fillRect(70,y,y%96===0?680:840,6);},1024,720);
 const topPage=plane(cv,.78,1.11,0,.105,0,new THREE.MeshBasicMaterial({map:paperTexture}));topPage.rotation.x=-Math.PI/2;
 box(cv,.05,.027,.19,-.28,.119,-.43,mat('#5930f5'));
 // Supporting objects: procedural, replaceable independently of navigation groups.
 // Desktop arrangement: choose a species without replacing site content.
 const bouquet=new THREE.Group();bouquet.position.set(-4.25,.14,-.8);bouquet.scale.setScalar(.87);bouquet.userData.action='flowers';root.add(bouquet);
 const vaseMat=mat('#b8d5e8',.88);const profile=[new THREE.Vector2(.17,0),new THREE.Vector2(.19,.018),new THREE.Vector2(.20,.06),new THREE.Vector2(.18,.35),new THREE.Vector2(.105,.70),new THREE.Vector2(.095,.81),new THREE.Vector2(.092,.83)];const vase=new THREE.Mesh(new THREE.LatheGeometry(profile,48),vaseMat);vase.castShadow=true;vase.receiveShadow=true;bouquet.add(vase);cyl(bouquet,.082,.082,.012,0,.815,0,mat('#645e48')); 
 const blooms=new THREE.Group();bouquet.add(blooms);const flowerGreen=mat('#65705a');
 function arrangeFlowers(kind){
 while(blooms.children.length){const child=blooms.children[0];child.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material&&o.material!==flowerGreen)o.material.dispose();});blooms.remove(child);}
 const colors={tulip:'#a66f78',daisy:'#e9e5dc',poppy:'#a66f78'};const petalMat=mat(colors[kind]||colors.tulip);
 for(let i=0;i<3;i++){const a=i*2.4,x=Math.cos(a)*(.26+i*.028),z=Math.sin(a)*.24,h=1.45+(i%3)*.23;const top=new THREE.Vector3(x,h,z);
 const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,.80,0),new THREE.Vector3(x*.3,h*.77,z*.3),top]);const stem=new THREE.Mesh(new THREE.TubeGeometry(curve,12,.008,5,false),flowerGreen);blooms.add(stem);
 for(let k=0;k<2;k++){const t=.22+k*.29,base=curve.getPoint(t),angle=a+k*2.2;const length=.28+(i%3)*.04;const direction=new THREE.Vector3(Math.cos(angle)*.8,.5,Math.sin(angle)*.8).normalize();const geo=new THREE.PlaneGeometry(1,1,8,18);const pos=geo.attributes.position;for(let n=0;n<pos.count;n++){const u=pos.getX(n)*2,v=pos.getY(n)+.5;pos.setXYZ(n,u*.065*Math.sin(Math.PI*v),v*length,.035*Math.sin(Math.PI*v)*(1-u*u)-.045*v*v);}geo.computeVertexNormals();const lm=mat('#65705a');lm.side=THREE.DoubleSide;const leaf=new THREE.Mesh(geo,lm);leaf.position.copy(base);leaf.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction);leaf.castShadow=true;blooms.add(leaf);}
 const head=new THREE.Group();head.position.copy(top);head.scale.setScalar(.8);head.rotation.set(.45,0,i*.17);blooms.add(head);
 if(kind==='tulip'){for(let j=0;j<6;j++){const a=j*Math.PI/3;const petal=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),petalMat);petal.scale.set(.085,.15,.052);petal.position.set(Math.cos(a)*.068,.05,Math.sin(a)*.068);petal.rotation.y=-a;head.add(petal);}}
 else{const count=kind==='daisy'?12:5;for(let j=0;j<count;j++){const a=j*Math.PI*2/count;const petal=new THREE.Mesh(new THREE.SphereGeometry(1,20,12),petalMat);petal.scale.set(kind==='daisy'?.047:.105,.025,kind==='daisy'?.13:.14);petal.position.set(Math.sin(a)*.11,0,Math.cos(a)*.11);petal.rotation.y=a;head.add(petal);}cyl(head,.057,.057,.048,0,.035,0,mat(kind==='daisy'?'#d9ae53':'#4d403a'));}
 }document.querySelectorAll('[data-flower]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.flower===kind)));
 }
 let flowerChoice='tulip';try{flowerChoice=localStorage.getItem('weiyi-flowers')||'tulip';}catch{}arrangeFlowers(['tulip','daisy','poppy'].includes(flowerChoice)?flowerChoice:'tulip');
 const flowerDialog=document.querySelector('#flower-dialog');document.querySelector('#edit-flowers').addEventListener('click',()=>flowerDialog.showModal());
 document.querySelectorAll('[data-flower]').forEach(b=>b.addEventListener('click',()=>{arrangeFlowers(b.dataset.flower);try{localStorage.setItem('weiyi-flowers',b.dataset.flower);}catch{}document.querySelector('#flower-status').textContent=say('Arrangement updated.','插花已更新。');}));
 const lampMetal=mat('#55585a',.52,.65),lampShade=mat('#f2c62d',.93);const lamp=new THREE.Group();lamp.position.set(4.1,.16,-1.4);root.add(lamp);lamp.userData.action="lamp";const lampLight=new THREE.PointLight('#ffd49b',0,4,2);lampLight.position.set(4.1,2.2,-1.4);root.add(lampLight);cyl(lamp,.3,.33,.07,0,.04,0,lampMetal);cyl(lamp,.035,.035,2.2,0,1.1,0,lampMetal);const shade=new THREE.Mesh(new THREE.SphereGeometry(.43,32,16,0,Math.PI*2,0,Math.PI/2),lampShade);shade.position.set(0,2.2,0);shade.castShadow=true;shade.receiveShadow=true;lamp.add(shade);const lining=new THREE.Mesh(shade.geometry,mat('#e9e1ce',.9));lining.material.side=THREE.BackSide;lining.scale.setScalar(.985);lining.position.copy(shade.position);lamp.add(lining);
 const poolTexture=texture((ctx,w,h)=>{const g=ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g.addColorStop(0,'rgba(255,202,125,.32)');g.addColorStop(.4,'rgba(255,196,113,.16)');g.addColorStop(1,'rgba(255,196,113,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);},64,64);
 const lampPool=new THREE.Mesh(new THREE.PlaneGeometry(2.3,1.7),new THREE.MeshBasicMaterial({map:poolTexture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));lampPool.rotation.x=-Math.PI/2;lampPool.position.set(3.75,.125,-.85);lampPool.visible=false;lampPool.raycast=()=>{};root.add(lampPool);
 // Small studio details remain subordinate to the five navigation objects.
 const mugMat=mat('#39466c',.72);const mug=cyl(root,.18,.15,.38,-3.35,.32,-.3,mugMat);const coffee=cyl(root,.143,.143,.012,-3.35,.52,-.3,mat('#66513d'));
 const handle=new THREE.Mesh(new THREE.TorusGeometry(.13,.033,8,30),mugMat);handle.rotation.y=0;handle.position.set(-3.14,.33,-.3);root.add(handle);
 // A freestanding window makes the view editable without building an entire room.
 const windowGroup=new THREE.Group();windowGroup.position.set(0,2.65,-2.35);root.add(windowGroup);
 const viewMat=new THREE.MeshBasicMaterial({color:'#dce8ed',transparent:true});
 const windowPlane=plane(windowGroup,6.4,3.3,0,0,0,viewMat);
 const windowFrame=mat('#62544b',.84);
 for(const x of [-3.25,3.25])box(windowGroup,.10,3.5,.13,x,0,.08,windowFrame);
 for(const y of [-1.7,1.7])box(windowGroup,6.6,.10,.13,0,y,.08,windowFrame);
 box(windowGroup,.065,3.4,.13,0,0,.1,windowFrame);box(windowGroup,6.8,.08,.40,0,-1.78,.1,windowFrame);

 // Gathered linen curtains, with real folds and a soft uneven hem.
 const curtains=[];
 const linen=new THREE.MeshStandardMaterial({color:'#7c8794',roughness:1,vertexColors:true,side:THREE.DoubleSide});
 for(const side of [-1,1]){const geo=new THREE.PlaneGeometry(.86,3.27,36,32);const pos=geo.attributes.position;
 for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),v=(y+1.635)/3.27;pos.setXYZ(i,x*(.88+.12*(1-v)),y+.025*Math.cos(x*24)*(1-v),.085*Math.cos(x*37)+.025*Math.sin(v*4));}const fabricColors=[];for(let i=0;i<pos.count;i++){const tone=.96+.04*(.5+.5*Math.cos(pos.getX(i)*37));fabricColors.push(tone,tone,tone);}geo.setAttribute('color',new THREE.Float32BufferAttribute(fabricColors,3));geo.computeVertexNormals();const curtain=new THREE.Mesh(geo,linen);curtain.scale.y=1.055;curtain.position.set(side*3.25,.095,.27);curtain.castShadow=true;curtain.receiveShadow=true;windowGroup.add(curtain);curtains.push(curtain);}
 const rod=cyl(windowGroup,.025,.025,7.6,0,1.88,.3,edge);rod.rotation.z=Math.PI/2;
 // A small editable windowsill plant; only a handful of leaves.
 const sillPlant=new THREE.Group();sillPlant.position.set(-2.55,.912,-2.2);root.add(sillPlant);sillPlant.userData.action='plant';
 cyl(sillPlant,.14,.105,.24,0,.12,0,mat('#e6dfd1'));cyl(sillPlant,.12,.12,.01,0,.24,0,mat('#665d4b'));
 const foliage=new THREE.Group();sillPlant.add(foliage);const foliageMat=mat('#425e3c');
 for(let i=0;i<7;i++){const a=i*2.4,h=.28+(i%3)*.11;const stem=cyl(foliage,.005,.005,h,Math.cos(a)*.045,.24+h/2,Math.sin(a)*.045,foliageMat);const leaf=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),foliageMat);leaf.scale.set(.072,.12,.025);leaf.position.set(Math.cos(a)*.11,.24+h,Math.sin(a)*.1);leaf.rotation.set(.35,a,Math.sin(a)*.65);leaf.castShadow=true;foliage.add(leaf);}
 function plantMode(mode){sillPlant.visible=false;foliage.scale.set(1,mode==='compact'?.65:1,1);document.querySelectorAll('[data-plant]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.plant===mode)));}
 let plantChoice='leafy';try{plantChoice=localStorage.getItem('weiyi-plant')||'leafy';}catch{}plantMode('none');document.querySelector('#edit-plant').hidden=true;
 const plantDialog=document.querySelector('#plant-dialog');document.querySelector('#edit-plant').addEventListener('click',()=>plantDialog.showModal());document.querySelectorAll('[data-plant]').forEach(b=>b.addEventListener('click',()=>{plantMode(b.dataset.plant);try{localStorage.setItem('weiyi-plant',b.dataset.plant);}catch{}}));
 contact(root,-.8,.7,2.7,1.8);contact(root,.9,-1,1.8,1.2);contact(root,-4.1,1.3,1.3,.9);contact(root,-2.62,1.7,1.4,1.1);contact(root,2.85,.90,2.0,1.5);contact(root,-4.25,-.8,.6,.6);contact(root,-3.35,-.3,.55,.55);contact(root,4.1,-1.4,.8,.8);
 // Editable lightweight wall notes, persisted locally.
 const noteDialog=document.createElement('dialog');noteDialog.className='wall-note-dialog';noteDialog.innerHTML='<form method="dialog"><button class="note-close" aria-label="Close / 关闭">×</button></form><h2><span data-en="Wall notes" data-zh="墙上便签">Wall notes</span></h2><label><span data-en="Note" data-zh="便签">Note</span><select><option value="0">01</option><option value="1">02</option><option value="2">03</option></select></label><label><span data-en="Text" data-zh="文字">Text</span><textarea maxlength="140" rows="4"></textarea></label><label><span data-en="Image" data-zh="贴画图片">Image</span><input type="file" accept="image/jpeg,image/png,image/webp"></label><p class="note-help"><span data-en="Saved in this browser only." data-zh="仅保存在当前浏览器。">Saved in this browser only.</span></p><button type="button" class="note-save"><span data-en="Save" data-zh="保存">Save</span></button> <button type="button" class="note-clear"><span data-en="Remove image" data-zh="移除图片">Remove image</span></button><p class="note-status" role="status"></p>';document.body.append(noteDialog);
 let notes=[{text:'A thought in progress.',image:null},{text:'Look a little closer.',image:null},{text:'Things to try.',image:null}];try{const saved=JSON.parse(localStorage.getItem('weiyi-wall-notes'));if(Array.isArray(saved)&&saved.length===3)notes=saved;}catch{}
 const noteMeshes=[];let editingNote=0;const noteInput=noteDialog.querySelector('textarea'),noteStatus=noteDialog.querySelector('.note-status');
 function paintNote(i){const entry=notes[i],mesh=noteMeshes[i];const tx=texture((ctx,w,h)=>{ctx.fillStyle=['#f0e4b6','#dce5ec','#f1dfda'][i];ctx.fillRect(0,0,w,h);ctx.fillStyle='#42464a';ctx.font='23px Arial';const words=Array.from(entry.text||'');let line='',y=65;for(const char of words){if(char==='\n'||ctx.measureText(line+char).width>w-48){ctx.fillText(line,24,y);line='';y+=32;}if(char!=='\n')line+=char;}ctx.fillText(line,24,y);},256,256);mesh.material.map?.dispose();mesh.material.map=tx;mesh.material.needsUpdate=true;if(entry.image){const src=entry.image;new THREE.TextureLoader().load(src,img=>{if(notes[i].image!==src){img.dispose();return;}img.colorSpace=THREE.SRGBColorSpace;mesh.material.map?.dispose();mesh.material.map=img;mesh.material.needsUpdate=true;});}}
 function openNote(i){editingNote=i;noteDialog.querySelector('select').value=String(i);noteInput.value=notes[i].text||'';noteStatus.textContent='';noteDialog.showModal();}
 noteDialog.querySelector('select').addEventListener('change',e=>{editingNote=Number(e.target.value);noteInput.value=notes[editingNote].text||'';noteStatus.textContent='';});
 function localizeNotes(){noteDialog.querySelectorAll('[data-en][data-zh]').forEach(el=>el.textContent=say(el.dataset.en,el.dataset.zh));}localizeNotes();new MutationObserver(localizeNotes).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 function saveNotes(){try{localStorage.setItem('weiyi-wall-notes',JSON.stringify(notes));noteStatus.textContent=say('Saved in this browser.','已保存在当前浏览器。');}catch{noteStatus.textContent=say('Preview updated; browser storage is full.','预览已更新，但浏览器存储空间不足。');}}
 for(let i=0;i<3;i++){const mesh=plane(root,i===2?.82:.55,i===2?.87:.58,i===2?-4.65:i===0?-4.25:4.05,i===2?2.05:i===0?3.05:3.1,-2.30,new THREE.MeshBasicMaterial());mesh.rotation.z=[-.07,.06,-.045][i];mesh.userData.action='note';mesh.userData.noteIndex=i;const tape=new THREE.Mesh(new THREE.PlaneGeometry(.22,.075),new THREE.MeshBasicMaterial({color:'#e6ddbf',transparent:true,opacity:.62,depthWrite:false}));tape.position.set(0,(i===2?.87:.58)/2-.015,.006);tape.rotation.z=[.06,-.09,.04][i];mesh.add(tape);noteMeshes.push(mesh);paintNote(i);}
 noteDialog.querySelector('.note-save').addEventListener('click',()=>{notes[editingNote].text=noteInput.value;paintNote(editingNote);saveNotes();});
 noteDialog.querySelector('.note-clear').addEventListener('click',()=>{notes[editingNote].image=null;paintNote(editingNote);saveNotes();});
 noteDialog.querySelector('input').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10000000){noteStatus.textContent=say('Choose JPG / PNG / WebP under 10 MB.','请选择小于 10 MB 的 JPG、PNG 或 WebP。');return;}const index=editingNote,url=URL.createObjectURL(file);try{const im=new Image();im.src=url;await im.decode();const c=document.createElement('canvas');c.width=c.height=384;const ctx=c.getContext('2d'),side=Math.min(im.width,im.height);ctx.drawImage(im,(im.width-side)/2,(im.height-side)/2,side,side,0,0,384,384);notes[index].image=c.toDataURL('image/jpeg',.85);paintNote(index);saveNotes();}catch{noteStatus.textContent=say('Could not open image.','无法读取图片。');}finally{URL.revokeObjectURL(url);e.target.value='';}});
 const noteEdit=document.createElement('button');noteEdit.className='notes-edit';noteEdit.dataset.en='Edit wall notes ↗';noteEdit.dataset.zh='编辑便签 ↗';noteEdit.textContent=say(noteEdit.dataset.en,noteEdit.dataset.zh);stage.append(noteEdit);noteEdit.addEventListener('click',()=>openNote(0));
 windowPlane.userData.action='window';
 // Optional DOM-only visitor, created only after a sky hit; never another WebGL object.
 const ufoLayer=document.createElement('div');ufoLayer.className='window-visitor';ufoLayer.setAttribute('aria-hidden','true');stage.append(ufoLayer);
 let visitor=null,currentMood='day';
 let lampLevel=0;
 function applyLamp(){const night=currentMood==='night';lampLight.intensity=night?[3,9,17][lampLevel]:0;lampPool.visible=night;lampPool.material.opacity=[.25,.55,.85][lampLevel];lining.material.emissive.set(night?'#dca35f':'#000000');lining.material.emissiveIntensity=night?[.35,.85,1.35][lampLevel]:0;}
 function cycleLamp(){if(currentMood!=='night')return;lampLevel=(lampLevel+1)%3;applyLamp();}

 function skyClick(event){
  const hit=raycaster.intersectObject(windowPlane)[0];
  if(!hit||hit.uv.y<.64||visitor)return;
  
  visitor=document.createElement('div');visitor.className='ufo-flight'+(currentMood==='night'?' night':'')+(Math.random()<.5?' reverse':'');visitor.setAttribute('aria-hidden','true');
  visitor.innerHTML='<svg viewBox="0 0 40 20"><path fill="#aebec9" d="M12 10a8 7 0 0116 0"/><ellipse cx="20" cy="12" rx="18" ry="4" fill="#566780"/><path stroke="#e8d997" stroke-width="2" d="M10 13h4m4 0h4m4 0h4"/></svg>';ufoLayer.append(visitor);if(reduced.matches)setTimeout(()=>{visitor?.remove();visitor=null;},1400);
  visitor.addEventListener('animationend',()=>{visitor?.remove();visitor=null;},{once:true});
 }
 function positionVisitor(){
  const points=[[-3.12,1.55],[3.12,1.55],[3.12,.70],[-3.12,.70]].map(([x,y])=>windowGroup.localToWorld(new THREE.Vector3(x,y,.01)).project(camera)).map(p=>[(p.x*.5+.5)*stage.clientWidth,(-p.y*.5+.5)*stage.clientHeight]);
  const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,h=Math.max(...ys)-y;
  // Two inset glass panes mask the DOM flight behind curtains and the centre mullion.
  const panes=[[-2.72,-.075],[.075,2.72]].map(([left,right])=>[[left,1.55],[right,1.55],[right,.70],[left,.70]].map(([px,py])=>windowGroup.localToWorld(new THREE.Vector3(px,py,.01)).project(camera)).map(p=>[(p.x*.5+.5)*stage.clientWidth-x,(-p.y*.5+.5)*stage.clientHeight-y]));
  const mask=panes.map(p=>'M'+p.map(v=>v.map(n=>n.toFixed(2)).join(' ')).join(' L')+' Z').join(' ');
  Object.assign(ufoLayer.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px',clipPath:'path("'+mask+'")'});ufoLayer.style.setProperty('--flight',w+'px');
 }

 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let hovered=null,drag=null,turn=0,tilt=0,zoomTarget=1,yawNow=0,pitchNow=0,visible=true;
 function setHover(g){if(hovered===g)return;hovered=g;objects.forEach(o=>o.userData.el.classList.toggle('is-active',o===g));canvas.style.cursor=g?'pointer':'grab';}
 function pick(event){const r=canvas.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(root.children,true);if(!hits.length)return null;let o=hits[0].object;while(o&&o!==root){if(o.userData.url||o.userData.action)return o;o=o.parent;}return null;}
 canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};if(e.pointerType==='mouse')canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(drag){if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>5)drag.moved=true;if(drag.moved){turn=THREE.MathUtils.clamp(turn+(e.clientX-drag.lastX)*.0025,-.28,.28);tilt=THREE.MathUtils.clamp(tilt-(e.clientY-drag.lastY)*.0025,0,.26);setHover(null);}drag.lastX=e.clientX;drag.lastY=e.clientY;}else setHover(pick(e));});
 canvas.addEventListener('pointerup',e=>{if(drag&&!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<9){const g=pick(e);if(g?.userData.action==='window')skyClick(e);else if(g?.userData.action==='lamp')cycleLamp();else if(g?.userData.action==='note')openNote(g.userData.noteIndex);else if(g?.userData.action==='flowers')document.querySelector('#flower-dialog').showModal();else if(g?.userData.action==='plant')document.querySelector('#plant-dialog').showModal();else if(g)location.href=g.userData.url;}drag=null;});canvas.addEventListener('pointercancel',()=>drag=null);canvas.addEventListener('pointerleave',()=>{if(!drag)setHover(null)});
 document.querySelector('#reset-desk').addEventListener('click',()=>{turn=0;tilt=0;zoomTarget=1;});
 let renderWidth=0,renderHeight=0;
 function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(w===renderWidth&&h===renderHeight)return;renderWidth=w;renderHeight=h;renderer.setSize(w,h,false);const aspect=w/h;const halfWidth=Math.max(5.8,2.95*aspect);camera.left=-halfWidth;camera.right=halfWidth;camera.top=halfWidth/aspect;camera.bottom=-halfWidth/aspect;camera.updateProjectionMatrix();}
 new ResizeObserver(resize).observe(stage);resize();
 canvas.addEventListener('wheel',e=>{const next=THREE.MathUtils.clamp(zoomTarget-e.deltaY*.0007,.9,1.1);if(next!==zoomTarget||e.ctrlKey){e.preventDefault();zoomTarget=next;}},{passive:false});
 const touches=new Map();let pinchDistance=0;
 canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){touches.set(e.pointerId,[e.clientX,e.clientY]);if(touches.size===2){drag=null;const p=[...touches.values()];pinchDistance=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);}}});
 canvas.addEventListener('pointermove',e=>{if(!touches.has(e.pointerId))return;touches.set(e.pointerId,[e.clientX,e.clientY]);if(touches.size===2){const p=[...touches.values()],d=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);zoomTarget=THREE.MathUtils.clamp(zoomTarget*d/Math.max(1,pinchDistance),.9,1.1);pinchDistance=d;drag=null;}});
 for(const type of ['pointerup','pointercancel'])canvas.addEventListener(type,e=>touches.delete(e.pointerId));
 const observer=new IntersectionObserver(([entry])=>visible=entry.isIntersecting);observer.observe(stage);
 function frame(){requestAnimationFrame(frame);if(!visible||document.hidden)return;const time=performance.now()*.001;if(!reduced.matches){foliage.rotation.z=Math.sin(time*.43)*.012;curtains.forEach((c,i)=>c.rotation.y=Math.sin(time*.3+i)*.006);}yawNow=THREE.MathUtils.lerp(yawNow,turn,reduced.matches?1:.12);pitchNow=THREE.MathUtils.lerp(pitchNow,tilt,reduced.matches?1:.12);const angle=.079+pitchNow,radius=17.182;camera.position.set(Math.sin(.123+yawNow)*Math.cos(angle)*radius,2.1+Math.sin(angle)*radius,Math.cos(.123+yawNow)*Math.cos(angle)*radius);camera.lookAt(0,2.1,0);camera.zoom=THREE.MathUtils.lerp(camera.zoom,zoomTarget,reduced.matches?1:.12);camera.updateProjectionMatrix();for(const g of objects){g.position.y=THREE.MathUtils.lerp(g.position.y,g.userData.baseY+(g===hovered&&!reduced.matches?.012:0),.16);const pos=g.localToWorld(g.userData.anchor.clone()).project(camera);g.userData.el.style.left=(pos.x*.5+.5)*stage.clientWidth+'px';const offset=stage.clientWidth<600?(g.userData.key==='paper'?25:g.userData.key==='camera'?-18:0):0;g.userData.el.style.top=((-pos.y*.5+.5)*stage.clientHeight+offset)+'px';}positionVisitor();renderer.render(scene,camera);}
 frame();loading.hidden=true;
 new MutationObserver(()=>objects.forEach(g=>g.userData.el.setAttribute('aria-label',say(g.userData.en,g.userData.cn)))).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();stage.classList.add('has-error');loading.hidden=false;loading.textContent=say('The 3D view paused. Reload to resume, or use the links below.','三维场景已暂停，可刷新页面或使用顶部导航。');});
 let config={windowImage:null,windowMood:'day'};try{const response=await fetch('/home-current/desk-config.json');if(response.ok)config=await response.json();}catch{}
 let customImage=null,imageToken=0;const status=document.querySelector('#window-status');
 function setTexture(tx){viewMat.map?.dispose();viewMat.map=tx;viewMat.color.set('#ffffff');viewMat.needsUpdate=true;}
 function save(value){try{localStorage.setItem('weiyi-window-illustrated-v1',JSON.stringify(value));return true;}catch{status.textContent=say('Preview updated, but browser storage is unavailable.','预览已更新，但浏览器无法保存。');return false;}}
 function fadeWindow(to){return new Promise(resolve=>{if(reduced.matches){viewMat.opacity=to;resolve();return;}const from=viewMat.opacity,start=performance.now();function step(t){const p=Math.min(1,(t-start)/300);viewMat.opacity=from+(to-from)*p;if(p<1)requestAnimationFrame(step);else resolve();}requestAnimationFrame(step);});}
 async function chooseMood(mood,persist=true){if(mood!=='night')mood='day';if(persist&&mood===currentMood)return;currentMood=mood;stage.dataset.mood=mood;document.documentElement.dataset.theme=mood;try{localStorage.setItem('weiyi-theme',mood);}catch{}renderer.setClearColor(mood==='night'?0x252c38:0xf2f0ea,1);applyLamp();ambient.intensity=mood==='night'?.8:1.5;sun.intensity=mood==='night'?.7:2.05;sun.color.set(mood==='night'?'#aebddb':'#fff3e4');linen.color.set(mood==='night'?'#151e32':'#46536b');const src=customImage||'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(citySVG(mood));if(persist)await fadeWindow(0);await chooseImage(src,false,mood);if(persist)await fadeWindow(1);else viewMat.opacity=1;if(persist&&save({mood,image:customImage}))status.textContent=say('Saved in this browser.','已保存在此浏览器。');}
 async function chooseImage(src,persist=false,mood=null){const token=++imageToken;return new Promise(resolve=>{new THREE.TextureLoader().load(src,tx=>{if(token!==imageToken){tx.dispose();resolve(false);return;}tx.colorSpace=THREE.SRGBColorSpace;const ratio=tx.image.width/tx.image.height,target=6.4/3.3;if(ratio>target){tx.repeat.x=target/ratio;tx.offset.x=(1-tx.repeat.x)/2;}else{tx.repeat.y=ratio/target;tx.offset.y=(1-tx.repeat.y)/2;}setTexture(tx);document.querySelectorAll('#window-dialog button[data-mood]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mood===mood)));if(persist&&save({image:src}))status.textContent=say('Your view is saved in this browser.','你的窗景已保存在此浏览器。');resolve(true);},undefined,()=>{status.textContent=say('This image could not be opened. Try another JPG, PNG or WebP.','无法读取图片，请换一张 JPG、PNG 或 WebP。');resolve(false);});});}
 async function siteDefault(){let mode=config.windowMood||'day';try{mode=localStorage.getItem('weiyi-theme')||mode;}catch{}await chooseMood(mode,false);}
 await siteDefault();try{const saved=JSON.parse(localStorage.getItem('weiyi-window-illustrated-v1')||'null');if(saved?.image)customImage=saved.image;if(saved?.mood||customImage)await chooseMood(saved.mood||currentMood,false);}catch{}
 const dialog=document.querySelector('#window-dialog');document.querySelector('#edit-window').addEventListener('click',()=>dialog.showModal());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});

 const upload=document.querySelector('#window-image');
 upload.addEventListener('change',async()=>{
  const file=upload.files[0];if(!file)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024){status.textContent=say('Choose JPG / PNG / WebP under 10 MB.','请选择小于 10 MB 的 JPG、PNG 或 WebP。');upload.value='';return;}
  upload.disabled=true;const url=URL.createObjectURL(file);
  try{
   const image=new Image();image.src=url;await image.decode();
   const scale=Math.min(1,1600/Math.max(image.width,image.height)),buffer=document.createElement('canvas');
   buffer.width=Math.max(1,Math.round(image.width*scale));buffer.height=Math.max(1,Math.round(image.height*scale));
   const ctx=buffer.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,buffer.width,buffer.height);ctx.drawImage(image,0,0,buffer.width,buffer.height);
   const src=buffer.toDataURL('image/jpeg',.85);
   if(await chooseImage(src,false,currentMood)){customImage=src;if(save({mood:currentMood,image:src}))status.textContent=say('Your view is saved in this browser.','你的窗景已保存在此浏览器。');}
  }catch{status.textContent=say('Could not open image. Please try another file.','无法读取图片，请尝试其他文件。');}
  finally{URL.revokeObjectURL(url);upload.disabled=false;upload.value='';}
 });
 document.querySelector('#restore-window').addEventListener('click',async()=>{
  customImage=null;await chooseMood(currentMood,false);
  if(save({mood:currentMood}))status.textContent=say('Illustrated view restored.','已恢复插画窗景。');
 });
 // The stage also has data-mood for styling: never bind its bubbling clicks to theme changes.
 document.querySelectorAll('#window-dialog button[data-mood]').forEach(b=>b.addEventListener('click',()=>chooseMood(b.dataset.mood)));
 const themeSwitch=document.createElement('button');themeSwitch.className='theme-switch';themeSwitch.type='button';stage.append(themeSwitch);
 function updateThemeSwitch(){themeSwitch.textContent=currentMood==='night'?say('☀ Day mode','☀ 日间模式'):say('☾ Night mode','☾ 夜间模式');themeSwitch.setAttribute('aria-label',currentMood==='night'?say('Switch to day mode','切换至日间模式'):say('Switch to night mode','切换至夜间模式'));}
 themeSwitch.addEventListener('click',async()=>{themeSwitch.disabled=true;await chooseMood(currentMood==='night'?'day':'night');themeSwitch.disabled=false;updateThemeSwitch();});new MutationObserver(updateThemeSwitch).observe(document.documentElement,{attributes:true,attributeFilter:['lang','data-theme']});updateThemeSwitch();


}

