import * as THREE from './vendor/three.module.min.js';
// A quiet drawn woodland backdrop, generated once without external downloads.
export function woodlandTexture(){
 const c=document.createElement('canvas');c.width=1600;c.height=1000;const g=c.getContext('2d');
 g.fillStyle='#dce1cf';g.fillRect(0,0,c.width,c.height);
 let seed=723;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let layer=0;layer<3;layer++){
  for(let i=0;i<16;i++){
   const x=random()*1700-50,y=180+random()*370,r=90+random()*140;
   g.fillStyle=['#afc3b0','#8eae9e','#719589'][layer];g.globalAlpha=.56+layer*.13;
   g.beginPath();for(let k=0;k<=32;k++){const a=k/32*Math.PI*2,rr=r*(.86+random()*.18),px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr*.8;if(k===0)g.moveTo(px,py);else g.lineTo(px,py);}g.closePath();g.fill();
   g.strokeStyle='#435f5675';g.lineWidth=.7;g.stroke();
   g.globalAlpha=.42+layer*.14;g.fillStyle=['#a9baa3','#849b85','#6b8875'][layer];g.beginPath();g.moveTo(x-9,1000);g.bezierCurveTo(x-12,740,x+8,500,x,y);g.bezierCurveTo(x-1,520,x+20,780,x+15,1000);g.fill();
   g.strokeStyle='#52655b';g.lineWidth=.8;g.beginPath();g.moveTo(x,990);g.quadraticCurveTo(x+12,650,x,y+40);g.moveTo(x+3,y+200);g.quadraticCurveTo(x-25,y+130,x-r*.42,y+80);g.stroke();
  }
 }
 g.globalAlpha=.4;g.fillStyle='#c8cfac';g.beginPath();g.moveTo(0,820);g.quadraticCurveTo(800,710,1600,850);g.lineTo(1600,1000);g.lineTo(0,1000);g.fill();
 g.globalAlpha=.055;for(let i=0;i<14000;i++){g.fillStyle=i%2?'#ffffff':'#4f6555';g.fillRect(random()*1600,random()*1000,1,1);}g.globalAlpha=1;
 // Soften only the distant woodland once; foreground geometry stays crisp.
 const softened=document.createElement('canvas');softened.width=c.width;softened.height=c.height;
 const soft=softened.getContext('2d');soft.fillStyle='#dce1cf';soft.fillRect(0,0,c.width,c.height);
 soft.filter='blur(8px)';soft.drawImage(c,-16,-10,c.width+32,c.height+20);
 const tx=new THREE.CanvasTexture(softened);tx.colorSpace=THREE.SRGBColorSpace;return tx;
}
