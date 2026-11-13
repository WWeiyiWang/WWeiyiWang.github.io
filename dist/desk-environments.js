import {woodlandTexture} from './woodland-texture.js';
import * as THREE from './vendor/three.module.min.js';

// Static, reusable geometry: no extra render loop, images or dependencies.
export function addDeskEnvironments({root,stage,wall,curtains,rod,noteMeshes,windowGroup,say}) {
 const editablePlants=[];
 const garden=new THREE.Group();root.add(garden);garden.visible=false;
 const gardenFill=new THREE.HemisphereLight(0xe4efd0,0x51694c,.8);garden.add(gardenFill);
 const material=(color)=>new THREE.MeshStandardMaterial({color,roughness:.88,side:THREE.DoubleSide});
 const structure=material('#f3efe3'),floorMat=material('#c9c6b3');
 const farStructure=material('#e2e6dc');farStructure.emissive.set('#cfd8ce');farStructure.emissiveIntensity=.22;
 const cityHaze=new THREE.Mesh(new THREE.PlaneGeometry(6.4,3.3),new THREE.MeshBasicMaterial({color:'#e4e9e3',transparent:true,opacity:0,depthWrite:false}));cityHaze.position.z=.012;cityHaze.raycast=()=>{};windowGroup.add(cityHaze);
 // Soft grass texture: deterministic strokes, shared across the ground plane.
 const grassCanvas=document.createElement('canvas');grassCanvas.width=grassCanvas.height=256;const gc=grassCanvas.getContext('2d');gc.fillStyle='#899d70';gc.fillRect(0,0,256,256);
 let grassSeed=53;const grassRandom=()=>{grassSeed=(grassSeed*1664525+1013904223)>>>0;return grassSeed/4294967296;};
 for(let i=0;i<1800;i++){const x=grassRandom()*256,y=grassRandom()*256;gc.strokeStyle=['#81966955','#d0d6ac66','#6f875144'][i%3];gc.lineWidth=.6+grassRandom()*.8;gc.beginPath();gc.moveTo(x,y);gc.quadraticCurveTo(x-2,y-3,x+(grassRandom()-.5)*5,y-3-grassRandom()*6);gc.stroke();}
 const grassMap=new THREE.CanvasTexture(grassCanvas);grassMap.colorSpace=THREE.SRGBColorSpace;grassMap.wrapS=grassMap.wrapT=THREE.RepeatWrapping;grassMap.repeat.set(12,12);floorMat.map=grassMap;floorMat.roughness=1;
 const backdropMat=new THREE.MeshBasicMaterial({color:'#ffffff',map:woodlandTexture()});
 const mesh=(geometry,mat,x,y,z)=>{const o=new THREE.Mesh(geometry,mat);o.position.set(x,y,z);o.receiveShadow=true;o.raycast=()=>{};garden.add(o);return o;};
 mesh(new THREE.PlaneGeometry(32,20),backdropMat,0,5,-10);
 const floor=mesh(new THREE.PlaneGeometry(50,50),floorMat,0,-1.61,0);floor.rotation.x=-Math.PI/2;
 function beam(a,b,r=.032){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),d=end.clone().sub(start);const o=mesh(new THREE.CylinderGeometry(r*(a[2]<=-7&&b[2]<=-7?.65:1),r*(a[2]<=-7&&b[2]<=-7?.65:1),d.length(),6),a[2]<=-7&&b[2]<=-7?farStructure:structure,...start.clone().add(end).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());}
 // Receding barrel-vault ribs with light climbing foliage.
 const vineColors=['#69886a','#7d956a','#526f5b','#94a37b'].map(material);
 const vineMat=material('#69886a');
 for(const z of [-8,-5.2,-3.4]){
  const arch=[];for(let i=0;i<=40;i++){const t=Math.PI*i/40;arch.push(new THREE.Vector3(7.2*Math.cos(t),2.5+4.0*Math.sin(t),z));}
  mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arch),48,z===-8?.028:.045,6,false),z===-8?farStructure:structure,0,0,0);
  for(const x of [-7.2,-4.8,4.8,7.2]){const top=2.5+4.0*Math.sqrt(1-x*x/51.84);beam([x,-1.6,z],[x,top,z],.0525);}
  const vine=[];for(let i=0;i<=55;i++){const t=Math.PI*i/55;vine.push(new THREE.Vector3(7.2*Math.cos(t)+.06*Math.sin(i*1.8),2.5+4.0*Math.sin(t)+.06*Math.cos(i*1.8),z+.05*Math.sin(i)));}
  mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(vine),70,.014,4,false),vineMat,0,0,0);
  for(let i=2;i<54;i+=3){const v=vine[i],leaf=mesh(new THREE.SphereGeometry(1,8,5),vineColors[(i+Math.round(-z*10))%4],v.x,v.y,v.z);const variation=.7+.6*(.5+.5*Math.sin(i*17+z*9));leaf.scale.set(.13*variation*(z===-3.4?1.2:1),.25*variation*(z===-3.4?1.2:1),.025);leaf.rotation.set(Math.sin(i*3+z)*.7,Math.cos(i*7+z)*.8,i*.8+Math.sin(z+i));}
 }
 // Simplified fanlight at the front arch, with a horizontal spring line.
 beam([-7.2,2.5,-3.4],[7.2,2.5,-3.4],.052);
 const innerArch=[];for(let i=0;i<=32;i++){const t=Math.PI*i/32;innerArch.push(new THREE.Vector3(5.1*Math.cos(t),2.5+2.75*Math.sin(t),-3.4));}
 mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(innerArch),40,.038,6,false),structure,0,0,0);
 for(const t of [Math.PI/6,Math.PI/3,Math.PI/2,Math.PI*2/3,Math.PI*5/6])beam([5.1*Math.cos(t),2.5+2.75*Math.sin(t),-3.4],[7.2*Math.cos(t),2.5+4.0*Math.sin(t),-3.4],.035);
 // Horizontal side rails connect the existing uprights without extra vertical bays.
 for(const x of [-7.2,7.2])for(const y of [.2,1.35,2.5])beam([x,y,-8],[x,y,-3.4],.035);
 for(const y of [.2,1.35,2.5])beam([-7.2,y,-8],[7.2,y,-8],.035);
 for(const x of [-7.2,-4,0,4,7.2]){const y=2.5+4.0*Math.sqrt(1-x*x/51.84);beam([x,y,-8],[x,y,-3.4]);}
 // Restrained ink-and-wash palette; geometry supplies depth rather than realistic textures.
 const greens=['#738265','#939d76','#63785d','#899574','#6d7c60','#a8ad81'].map(color=>new THREE.MeshStandardMaterial({color,roughness:1,side:THREE.DoubleSide,emissive:color,emissiveIntensity:.12}));
 const ink=new THREE.LineBasicMaterial({color:'#344d49',transparent:true,opacity:.12});
 const stemMat=material('#5e7144');
 // A soft alpha edge on the nearest leaves suggests slight foreground defocus.
 // Generated once, without blurring the desk or adding a postprocessing pass.
 const edgeCanvas=document.createElement('canvas');edgeCanvas.width=edgeCanvas.height=128;
 const edgeContext=edgeCanvas.getContext('2d'),edgePixels=edgeContext.createImageData(128,128);
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){
  const edge=Math.min(x,127-x,y,127-y)/7,t=Math.min(1,edge),value=Math.round(255*t*t*(3-2*t)),i=(y*128+x)*4;
  edgePixels.data[i]=edgePixels.data[i+1]=edgePixels.data[i+2]=value;edgePixels.data[i+3]=255;
 }
 edgeContext.putImageData(edgePixels,0,0);const softEdge=new THREE.CanvasTexture(edgeCanvas);
 const softGreens=greens.map(m=>{const soft=m.clone();soft.alphaMap=softEdge;soft.transparent=true;soft.depthWrite=false;return soft;});
 // Seeded variation stays stable across reloads and environment switches.
 const random=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
 function plant(x,z,height,seed,base=-1.58,kind='broad'){
  height*=1.20*(.92+random(seed+19)*.16);
  const group=new THREE.Group();group.position.set(x,base,z);garden.add(group);
  for(let i=0;i<7;i++){
   const angle=seed+i*2.399+random(seed+i)*.55,h=height*(.30+random(seed+i+2)*.62),reach=height*(.18+random(seed+i+9)*.23);
   const tip=new THREE.Vector3(Math.cos(angle)*reach,h,Math.sin(angle)*reach);
   const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(0,0,0),new THREE.Vector3(tip.x*.25,h*.85,tip.z*.25),tip);
   const stem=new THREE.Mesh(new THREE.TubeGeometry(curve,6,.009,3,false),stemMat);group.add(stem);
   const geo=new THREE.PlaneGeometry(1,1,8,16),p=geo.attributes.position,length=height*(.31+random(seed+i+7)*.14);
   for(let j=0;j<p.count;j++){const u=p.getX(j)*2,v=p.getY(j)+.5;const rib=i%3===0?1-.16*Math.pow(Math.sin(v*17),6):1;const width=Math.pow(Math.sin(Math.PI*v),i%3===2?.48:.8)*length*(kind==='fern'?.15:i%3===1?.20:.36)*rib;
    p.setXYZ(j,u*width,v*length,.15*length*Math.sin(Math.PI*v)*(1-Math.abs(u))-.4*v*v*length+.009*length*Math.sin(v*12)*u*u);}
   geo.computeVertexNormals();const leaf=new THREE.Mesh(geo,(z>=3?softGreens:greens)[Math.floor(random(seed+i+31)*greens.length)]);leaf.position.copy(tip);leaf.rotation.set(.85+Math.sin(angle)*.5,angle,-Math.cos(angle)*.8);leaf.receiveShadow=false;group.add(leaf);
   // Outline only the perimeter, not the mesh triangulation.
   const points=[];const cols=9,rows=17;
   for(let row=0;row<rows;row++)points.push(new THREE.Vector3().fromBufferAttribute(p,row*cols));
   for(let row=rows-1;row>=0;row--)points.push(new THREE.Vector3().fromBufferAttribute(p,row*cols+cols-1));
   const outline=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points),ink);if(z<3)leaf.add(outline);
   const vein=[];for(let row=0;row<rows;row++){const v=new THREE.Vector3().fromBufferAttribute(p,row*cols+4);v.z+=.003;vein.push(v);}
   if(z<3)leaf.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(vein),ink));
  }
  group.traverse(o=>o.raycast=()=>{});editablePlants.push(group);return group;
 }
 // Fewer, broader planting groups with an open central desk corridor.
 for(let i=0;i<2;i++)plant(-6+i*12+(random(i+4)-.5)*.8,-7.8+random(i+8)*1.5,2.9+random(i+12)*1.8,i*.73);
 for(const [x,z,h,seed] of [[-7.2,-1.65,4.1,3],[7.4,-1.8,3.5,12],[-8,3.4,3.1,22],[8.2,3.2,2.6,28],[-5.8,-4.5,2.2,31],[6.5,-5,2.8,37]]){
  const crown=plant(x,z,h,seed,z < -4?7.4:-1.58);if(z < -4)crown.rotation.z=Math.PI;
 }
 const frontLeft=plant(-6.7,5.0,2.2,43,-2.1);frontLeft.scale.set(1.35,1.15,1.25);
 const frontRight=plant(6.9,5.2,2.3,49,-2.1);frontRight.scale.set(1.35,1.15,1.25);
 const bark=material('#766e56');
 function tree(x,z,h,seed){
  const before=new Set(garden.children);
  const trunkCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(x,-1.58,z),new THREE.Vector3(x+.14,h*.35-1.58,z+.1),new THREE.Vector3(x-.18,h-1.58,z)]);
  mesh(new THREE.TubeGeometry(trunkCurve,12,.065,7,false),bark,0,0,0);
  for(let i=0;i<3;i++){const origin=trunkCurve.getPoint(.60+i*.13),end=origin.clone().add(new THREE.Vector3((i%2?1:-1)*.65,.65,.1));const branch=new THREE.LineCurve3(origin,end);mesh(new THREE.TubeGeometry(branch,3,.025,5,false),bark,0,0,0);}
  const crown=plant(x-.1,z,2.2,seed,h-1.95);crown.scale.set(1.25,.63,1.1);crown.rotation.y=seed*.31;
  editablePlants.pop();const wholeTree=new THREE.Group();wholeTree.position.set(x,-1.58,z);garden.add(wholeTree);for(const child of [...garden.children])if(child!==wholeTree&&!before.has(child)){child.position.sub(wholeTree.position);wholeTree.add(child);}editablePlants.push(wholeTree);
 }
 // These trees are in front of the window (z=-2.35), but behind the desk destinations.
 tree(-4.4,-1.95,4.8,61);tree(4.6,-1.9,5.4,74);
 // Low-contrast dappled ground light avoids hard, repeated leaf silhouettes.
 const lightCanvas=document.createElement('canvas');lightCanvas.width=lightCanvas.height=256;const lc=lightCanvas.getContext('2d');
 for(let i=0;i<24;i++){const x=(i*73)%256,y=(i*113)%256,r=15+i%22,g=lc.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(245,244,203,.16)');g.addColorStop(1,'rgba(245,244,203,0)');lc.fillStyle=g;lc.fillRect(x-r,y-r,r*2,r*2);}
 const glowMat=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(lightCanvas),transparent:true,depthWrite:false,opacity:.12});
 const glow=mesh(new THREE.PlaneGeometry(19,15),glowMat,0,-1.595,0);glow.rotation.x=-Math.PI/2;
 const controls=document.createElement('div');controls.className='desk-environments';controls.setAttribute('role','group');stage.append(controls);
 let selected='studio';
 const buttons=['studio','greenhouse'].map(value=>{const b=document.createElement('button');b.type='button';b.dataset.environment=value;controls.append(b);b.addEventListener('click',()=>{selected=value;update();try{localStorage.setItem('weiyi-desk-environment',value);}catch{}});return b;});
 function update(){const active=selected==='greenhouse',night=document.documentElement.dataset.theme==='night';garden.visible=active;wall.visible=!active;cityHaze.visible=active;cityHaze.material.color.set(night?'#82939d':'#e4e9e3');cityHaze.material.opacity=night?.025:.06;noteMeshes.forEach(m=>{m.position.z=active?.8:-2.30;});curtains.forEach(c=>c.visible=!active);rod.visible=!active;stage.dataset.environment=selected;controls.setAttribute('aria-label',say('Desk environment','书桌环境'));buttons.forEach((b,i)=>{b.textContent=i?say('Greenhouse','植物温室'):say('City studio','城市工作室');b.setAttribute('aria-pressed',String(b.dataset.environment===selected));});gardenFill.intensity=night?.12:.8;glowMat.opacity=night?.08:.65;backdropMat.color.set(night?'#31474d':'#ffffff');floorMat.color.set(night?'#405342':'#c5d1b3');}
 new MutationObserver(update).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','lang']});update();
 return editablePlants;
}
