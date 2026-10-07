// Decode before painting; a transient mobile image failure must not require a reload.
export async function loadWallImage(src, {ImageClass=Image, timeout=6000, delay=350}={}) {
 for(let attempt=0;attempt<3;attempt++){
  try{
   return await new Promise((resolve,reject)=>{
    const image=new ImageClass();image.decoding='async';
    const timer=setTimeout(()=>{image.onload=image.onerror=null;reject(new Error('Wall image timed out'));},timeout);
    const fail=()=>{clearTimeout(timer);image.onload=image.onerror=null;reject(new Error('Wall image unavailable'));};
    image.onerror=fail;
    image.onload=async()=>{
     try{await image.decode();if(!image.naturalWidth)throw new Error('Empty image');clearTimeout(timer);image.onload=image.onerror=null;resolve(image);}catch{fail();}
    };
    image.src=src;
   });
  }catch(error){if(attempt===2)throw error;await new Promise(resolve=>setTimeout(resolve,delay*(attempt+1)));}
 }
}
