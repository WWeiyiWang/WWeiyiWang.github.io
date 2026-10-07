import fs from 'node:fs';
import path from 'node:path';

// A separate checkout publishes the current site without the old hosting history.
const root=process.cwd(),dest=path.resolve('github-pages');
if(!fs.existsSync(path.join(root,'网站资料')))throw new Error('Run this from the original portfolio website workspace. In a GitHub clone, commit and push directly.');
if(path.dirname(dest)!==root)throw new Error('Publishing checkout must be inside the workspace');
fs.mkdirSync(dest,{recursive:true});
const sourceFiles=['build.mjs','content.json','desk-template.mjs','photography-template.mjs','wall-projects.mjs','README.md','.gitattributes','.github','scripts'];
for(const name of sourceFiles)fs.cpSync(path.join(root,name),path.join(dest,name),{recursive:true});
const pkg=JSON.parse(fs.readFileSync('package.json'));
fs.writeFileSync(path.join(dest,'package.json'),JSON.stringify({name:pkg.name,private:true,type:'module',scripts:{build:pkg.scripts.build,'build:pages':pkg.scripts['build:pages'],'check:pages':pkg.scripts['check:pages']}},null,2)+'\n');
fs.writeFileSync(path.join(dest,'.gitignore'),'.pages-dist/\nnode_modules/\n.env*\n.dev.vars\n');
fs.mkdirSync(path.join(dest,'dist'),{recursive:true});
for(const name of fs.readdirSync('dist')){
 if(['client','server','.openai'].includes(name))continue;
 fs.cpSync(path.join(root,'dist',name),path.join(dest,'dist',name),{recursive:true});
}
console.log('Publishing source synchronized to '+dest);
