import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('.pages-dist');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const files=walk(root),errors=[];let count=0,total=0;
for(const file of files){
  const size=fs.statSync(file).size;total+=size;
  if(size>=100*1024*1024)errors.push('File exceeds GitHub limit: '+path.relative(root,file));
  if(!/\.(html|css|js|json)$/.test(file)||file.includes(path.sep+'vendor'+path.sep))continue;
  const text=fs.readFileSync(file,'utf8');
  const refs=file.endsWith('.html')?[...text.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(m=>m[1]):[...text.matchAll(/["'](\/(?:images|videos|files|vendor)\/[^"'\s]+)["']/g)].map(m=>m[1]);
  for(let ref of refs){
    if(/^(?:#|[a-z]+:|\/\/)/i.test(ref)||ref.includes('${'))continue;
    // JS also contains URL prefixes completed at runtime (e.g. day/night images).
    if(!file.endsWith('.html')&&!/\.[a-z0-9]+(?:[?#].*)?$/i.test(ref))continue;
    ref=decodeURIComponent(ref.split(/[?#]/)[0]);if(!ref)continue;
    const target=ref.startsWith('/')?path.join(root,ref):path.resolve(path.dirname(file),ref);
    count++;
    if(!fs.existsSync(target)||fs.statSync(target).isDirectory()&&!fs.existsSync(path.join(target,'index.html')))errors.push(path.relative(root,file)+' → '+ref);
  }
}
if(total>1024**3)errors.push('Published site exceeds 1 GiB');
for(const route of ['index.html','404.html','projects/index.html','writing/index.html','about/index.html','cv/index.html','other-work/photography/index.html','other-work/models/index.html','home-current/index.html','home-experimental/index.html'])if(!fs.existsSync(path.join(root,route)))errors.push('Missing route '+route);
if(errors.length){console.error([...new Set(errors)].join('\n'));process.exit(1);}
console.log(`Verified ${count} local references; ${files.length} files; ${(total/1024**2).toFixed(1)} MiB.`);
