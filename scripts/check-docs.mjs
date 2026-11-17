import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(), dir=path.join(root,'content/docs');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const files=walk(dir).filter(p=>p.endsWith('.mdx'));
const pages=new Set(files.map(p=>path.relative(dir,p).replaceAll('\\','/').replace(/\.mdx$/,'')));
const tours=JSON.parse(fs.readFileSync('content/system-tours.json','utf8'));
const sizes=JSON.parse(fs.readFileSync('content/screenshot-sizes.json','utf8'));
const errors=[];
const captures=JSON.parse(fs.readFileSync('evidence/feature-captures.json','utf8'));
const coverage=JSON.parse(fs.readFileSync('evidence/visual-coverage.json','utf8'));
if(new Set(captures.map(c=>c.file)).size!==captures.length)errors.push('Duplicate screenshot capture filenames');
for(const c of captures){
 if(!c.validated||new URL(c.url).pathname.startsWith('/auth/'))errors.push(`Unverified or login capture: ${c.file}`);
 if(!fs.existsSync(path.join(root,'public/screenshots',c.file)))errors.push(`Missing reviewed capture: ${c.file}`);
}
for(const feature of coverage){
 if(!feature.roles.length||!tours[feature.tour]?.video)errors.push(`Missing visual coverage: ${feature.feature}`);
 for(const lang of ['en','ar']){
  const p=path.join(dir,lang,'features',feature.feature+'.mdx');
  if(!fs.readFileSync(p,'utf8').includes(`tour="${feature.tour}"`))errors.push(`Missing contextual tour: ${lang}/${feature.feature}`);
 }
}
let diagramCount=0;
for(const file of files){
 const relative=path.relative(dir,file).replaceAll('\\','/'), slug=relative.replace(/\.mdx$/,''), text=fs.readFileSync(file,'utf8');
 const twin=slug.replace(/^(en|ar)\//,m=>m==='en/'?'ar/':'en/');
 diagramCount += [...text.matchAll(/```mermaid\r?\n([\s\S]*?)```/g)].length;
 if(!pages.has(twin))errors.push(`Missing translation: ${twin}`);
 if(!/^---\r?\n[\s\S]*?title:/m.test(text))errors.push(`Missing frontmatter: ${slug}`);
 if(slug.includes('/features/')&&!slug.endsWith('/index')){
  if((text.match(/^## /gm)||[]).length<6)errors.push(`Incomplete feature: ${slug}`);
  for(const heading of (slug.startsWith('ar/')?['## خطوات الاستخدام','## القيود والقرارات','## تدفق البيانات والنتيجة']:['## How to use it','## Restrictions and decisions','## Data flow and outcome']))if(!text.includes(heading))errors.push(`Missing feature jump destination ${slug}: ${heading}`);
 }
 for(const img of text.matchAll(/<(?:img|SystemScreenshot)\s+src="([^"]+)"/g)){
   if(img[1].startsWith('/docs/')&&!fs.existsSync(path.join(root,'public',img[1].slice(6))))errors.push(`Missing JSX image ${img[1]} on ${slug}`);
 }
 for(const tour of text.matchAll(/<SystemTour\s+tour="([^"]+)"/g))if(!tours[tour[1]])errors.push(`Unknown tour ${tour[1]} on ${slug}`);
 for(const m of text.matchAll(/(!?)\[[^\]]*\]\(([^)]+)\)/g)){
  const href=m[2].split('#')[0];if(!href||/^(https?:|mailto:)/.test(href))continue;
  if(m[1]){const asset=href.replace(/^\/docs\//,'');if(!fs.existsSync(path.join(root,'public',asset)))errors.push(`Missing image ${href} on ${slug}`);continue;}
  if(!href.startsWith('/'))errors.push(`Use a canonical absolute guide URL for ${href} on ${slug}; browser-relative links break on folder index pages. Run python scripts/canonicalize-links.py.`);
  const target=href.startsWith('/')?href.slice(1):path.posix.normalize(path.posix.join(path.posix.dirname(slug),href));
  if(!pages.has(target)&&!pages.has(target+'/index'))errors.push(`Broken page ${href} on ${slug} -> ${target}`);
 }
}
for(const [id,tour] of Object.entries(tours)){
 for(const [index,step] of tour.steps.entries()){
  if(!fs.existsSync(path.join(root,'public/screenshots',step.image)))errors.push(`Missing tour image ${id}: ${step.image}`);
  if(!sizes[step.image]?.width||!sizes[step.image]?.height)errors.push(`Missing dimensions for ${step.image}`);
  if(step.imageAr&&(!fs.existsSync(path.join(root,'public/screenshots',step.imageAr))||!sizes[step.imageAr]?.width))errors.push(`Missing Arabic tour image or dimensions ${id}: ${step.imageAr}`);
  const [x,y,w,h]=step.focus;
  if(step.focus.length!==4||![x,y,w,h].every(Number.isFinite)||x<0||y<0||w<=0||h<=0||x+w>100||y+h>100)errors.push(`Invalid focus area ${id} step ${index+1}`);
  for(const lang of ['en','ar']){
   if(!step.title[lang]||!step.body[lang])errors.push(`Missing ${lang} tour explanation ${id}`);
   if(!pages.has(`${lang}/${step.guide}`))errors.push(`Broken contextual tour link ${id}: ${step.guide}`);
  }
 }
 if(tour.video)for(const file of [...(tour.localizedVideo?['en','ar'].flatMap(lang=>[`${id}-${lang}-tour.mp4`,`${id}-${lang}-poster.jpg`]):[`${id}-tour.mp4`,`${id}-poster.jpg`]),`${id}-en.vtt`,`${id}-ar.vtt`]){
  const media=path.join(root,'public/videos',file);
  if(!fs.existsSync(media)||fs.statSync(media).size===0)errors.push(`Missing tour media ${file}`);
  if(file.endsWith('.vtt')&&fs.existsSync(media)){
   const cues=fs.readFileSync(media,'utf8');
   if(!cues.startsWith('WEBVTT')||(cues.match(/ --> /g)||[]).length!==tour.steps.length)errors.push(`Invalid caption cues ${file}`);
  }
 }
}
const inventory=JSON.parse(fs.readFileSync('evidence/source-inventory.json','utf8'));
for(const [surface,s] of Object.entries(inventory.surfaces))for(const route of s.root_routes){
 if(!route.feature&&!route.special)errors.push(`Unclassified route ${surface}${route.path}`);
 if(route.feature&&!pages.has('en/features/'+route.feature))errors.push(`No guide for ${surface}${route.path}`);
}
const old=/(MENT ARP|Plakment|10\.22\.3\.81|agency-erp|SUPER_ADMIN|BUSINESS_DEVELOPMENT)/i;
for(const file of [...files,...walk(path.join(root,'app')),...walk(path.join(root,'lib')),...walk(path.join(root,'components'))].filter(p=>/\.(tsx?|css|mdx)$/.test(p)))if(old.test(fs.readFileSync(file,'utf8')))errors.push(`ERP residue in ${file}`);
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`Verified ${files.length} pages, ${diagramCount} diagram blocks, ${Object.keys(tours).length} interactive tours, bilingual video captions, language parity, feature sections, links, screenshots and ${Object.values(inventory.surfaces).reduce((n,s)=>n+s.root_routes.length,0)} frontend route entries. Rendering and playback are checked in the browser.`);
