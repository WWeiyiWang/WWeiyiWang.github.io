import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadWallImage} from '../dist/wall-image.js';
test('retries a cold-load failure and waits for image decoding',async()=>{
 let attempts=0,decoded=false;
 class ImageStub{
  naturalWidth=640;naturalHeight=480;
  set src(value){this.source=value;const n=++attempts;queueMicrotask(()=>n===1?this.onerror():this.onload());}
  async decode(){await new Promise(r=>setTimeout(r,5));decoded=true;}
 }
 const image=await loadWallImage('/test.webp',{ImageClass:ImageStub,delay:0});
 assert.equal(attempts,2);assert.equal(decoded,true);assert.equal(image.source,'/test.webp');
});
test('stalled requests are bounded and retried three times',async()=>{
 let attempts=0;class ImageStub{set src(value){attempts++;}}
 await assert.rejects(loadWallImage('/test.webp',{ImageClass:ImageStub,timeout:5,delay:0}));
 assert.equal(attempts,3);
});
test('decode failure is retried instead of drawing an incomplete image',async()=>{
 let attempts=0;class ImageStub{
  naturalWidth=640;
  set src(value){attempts++;queueMicrotask(()=>this.onload());}
  async decode(){if(attempts<2)throw Error('decode');}
 }
 await loadWallImage('/test.webp',{ImageClass:ImageStub,delay:0});assert.equal(attempts,2);
});
