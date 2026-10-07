import fs from 'node:fs';
export function writeWallProjects(content){
 const catalog=content.projects.map(p=>{const images=[],seen=new Set();const add=(src,label)=>{if(typeof src==='string'&&/\.(webp|png|jpe?g)$/i.test(src)&&!seen.has(src)){seen.add(src);images.push({src,label});}};add(p.cover,'Cover');const scan=o=>{if(!o||typeof o!=='object')return;if(o.src?.startsWith('/images/'))add(o.src,o.alt||'Image '+(images.length+1));if(o.poster)add(o.poster,'Film still');for(const v of Object.values(o))if(typeof v==='object'){if(Array.isArray(v))v.forEach(scan);else scan(v);}};scan(p.sections);return {slug:p.slug,name:p.name,url:'/projects/'+p.slug+'/',images};});
 fs.writeFileSync('dist/wall-projects.json',JSON.stringify(catalog));
}
if(process.argv[1]?.endsWith('wall-projects.mjs'))writeWallProjects(JSON.parse(fs.readFileSync('content.json','utf8')));
