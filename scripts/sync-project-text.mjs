import fs from 'node:fs';
import path from 'node:path';
const file='content.json',content=JSON.parse(fs.readFileSync(file,'utf8'));
const folders={'bamor':'BAMOR','digital-flora':'Alterflora','urban-mycelium':'Urban Mycelium','memory-museum':'MEMORY MUSEUM','adaptive-facade':'ADAPTIVE FACADE','moon-village':'MOON METABOLISM','generic-traditional':'GENERIC & TRADITIONAL','parametric-robotic-construction':'PAEAMETRIC ROBOTIC CONSTRUCTION','rural-plug-in':'FARMLAND PLUGIN','underground-theater':'UNDERGROUND THEATER'};
const labels={'项目名称':'name','小标题':'subtitle','副标题':'subtitle','年份':'year','标签 / Keywords':'keywords','标签/keywords':'keywords','简短介绍':'brief','合作者':'credits','个人承担的工作／合作者':'credits','My Role':'role','Research Methods':'methods','Tools':'tools','Publication':'publication'};
const titles={role:['My role','个人贡献'],methods:['Research methods','研究方法'],tools:['Tools','工具'],publication:['Publication','发表成果'],credits:['Collaborators','合作者']};
const bilingual=value=>[value,value]; // Source files currently supply English only.
for(const project of content.projects){
 const folder=folders[project.slug];if(!folder)continue;
 const text=fs.readFileSync(path.join('网站资料','01_Projects',folder,'项目介绍.txt'),'utf8');
 const fields={};let key=null;
 for(const line of text.split(/\r?\n/)){
  const match=line.match(/^([^:：]+)[:：](.*)$/);
  const label=match?.[1].trim();
  if(match&&labels[label]){key=labels[label];fields[key]=match[2].trim();}
  else if(key)fields[key]+='\n'+line;
 }
 for(const field in fields)fields[field]=fields[field].trim();
 if(!fields.brief||!fields.subtitle||!/^\d{4}$/.test(fields.year))throw Error('Incomplete project text: '+folder);
 project.year=fields.year;project.subtitle=bilingual(fields.subtitle);project.category=bilingual(fields.keywords);
 if(project.slug==='digital-flora')project.name=fields.name;
 const brief=project.sections.find(s=>s.title?.[0]==='Project brief');
 if(!brief)throw Error('Missing brief section: '+folder);
 brief.text=bilingual(fields.brief);
 for(const [field,title] of Object.entries(titles)){
  if(!fields[field])continue;
  const section={title,type:'text',text:bilingual(fields[field])};
  const existing=project.sections.findIndex(s=>s.title?.[0]===title[0]);
  if(existing>=0)project.sections[existing]=section;
  else {const pos=project.sections.indexOf(brief)+1;project.sections.splice(pos,0,section);}
 }
 // Keep supporting metadata after project media, immediately before collaborators.
 const endTitles=['Research methods','My role','Tools'];
 const endSections=endTitles.flatMap(title=>project.sections.filter(s=>s.title?.[0]===title));
 project.sections=project.sections.filter(s=>!endTitles.includes(s.title?.[0]));
 const collaborators=project.sections.findIndex(s=>s.title?.[0]==='Collaborators');
 project.sections.splice(collaborators<0?project.sections.length:collaborators,0,...endSections);
 console.log(project.slug+': brief, subtitle, keywords and provided metadata synchronized');
}
fs.writeFileSync(file,JSON.stringify(content,null,2)+'\n');
