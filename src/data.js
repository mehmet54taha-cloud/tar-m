import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
export const courses = [
 {id:'akilli-tarim',name:'Akıllı Tarım',sub:'Teknolojiyle geleceği yetiştir',icon:'Sprout',color:'#53764e',bg:'#edf2e6',tag:'TEKNOLOJİ'},
 {id:'bitki-fizyolojisi',name:'Bitki fizyolojisi',sub:'Yaşamın yeşil tarafını keşfet',icon:'Leaf',color:'#6c8650',bg:'#f0f3e7',tag:'BİTKİ BİLİMLERİ'},
 {id:'genetik',name:'Genetik',sub:'Yaşamın şifresini çöz',icon:'Dna',color:'#8a729e',bg:'#f2edf7',tag:'YAŞAM BİLİMLERİ'},
 {id:'gida-bilimi',name:'Gıda bilimi ve güvenliği',sub:'Tarladan sofraya güvenle',icon:'Apple',color:'#b1804a',bg:'#fbf1e2',tag:'GIDA'},
 {id:'hayvansal-uretim',name:'Hayvansal üretim',sub:'Sağlıklı ve sürdürülebilir üretim',icon:'Beef',color:'#aa8270',bg:'#f6eee8',tag:'ÜRETİM'},
 {id:'istatistik',name:'İstatistik',sub:'Veriyi anlamlı bilgiye dönüştür',icon:'ChartNoAxesCombined',color:'#6486a0',bg:'#eaf1f6',tag:'VERİ BİLİMİ'},
 {id:'mekanizasyon',name:'Tarımsal mekanizasyon',sub:'Üretimin gücünü keşfet',icon:'Tractor',color:'#a58b4d',bg:'#f6f2e5',tag:'MÜHENDİSLİK'},
 {id:'yapilar-sulama',name:'Tarımsal yapılar ve sulama',sub:'Her damlanın değerini öğren',icon:'Droplets',color:'#588f8e',bg:'#e9f3f1',tag:'SU VE YAPI'},
 {id:'toprak',name:'Toprak bilgisi',sub:'Her şeyin başladığı yere dön',icon:'Layers',color:'#a17c5a',bg:'#f5eee4',tag:'TOPRAK'}
];
export const emptyData=()=>({version:1,topics:[],cards:[],activity:[],reviews:[]});
export const uid=()=>crypto.randomUUID();
let database;
export async function db(){
 if(database)return database;
 database=await new Promise((resolve,reject)=>{const r=indexedDB.open('filiz-study',1);r.onupgradeneeded=()=>{r.result.createObjectStore('state');r.result.createObjectStore('files',{keyPath:'id'});};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});return database;
}
export async function getData(){const d=await db();return new Promise((resolve,reject)=>{const r=d.transaction('state').objectStore('state').get('main');r.onsuccess=()=>resolve(r.result||emptyData());r.onerror=()=>reject(r.error);});}
export async function saveData(data){const d=await db();await new Promise((resolve,reject)=>{const tx=d.transaction('state','readwrite');tx.objectStore('state').put(data,'main');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
export async function putFiles(files){const d=await db();await new Promise((resolve,reject)=>{const tx=d.transaction('files','readwrite');for(const file of files)tx.objectStore('files').put(file);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
export async function getFile(id){const d=await db();return new Promise((resolve,reject)=>{const r=d.transaction('files').objectStore('files').get(id);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
export async function deleteFiles(ids){const d=await db();await new Promise((resolve,reject)=>{const tx=d.transaction('files','readwrite');ids.forEach(id=>tx.objectStore('files').delete(id));tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
export async function readText(file){
 if(file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf')){
  const pdfjs=await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc=pdfWorkerUrl;
  const loadingTask=pdfjs.getDocument({data:await file.arrayBuffer(),isEvalSupported:false});
  const pdf=await loadingTask.promise;
  let text='';
  try { for(let i=1;i<=Math.min(pdf.numPages,100);i++){const page=await pdf.getPage(i);const content=await page.getTextContent();text+=content.items.map(item=>item.str+(item.hasEOL?'\n':' ')).join('')+'\n';} } finally {await loadingTask.destroy();}
  return {text:text.trim(),warning:pdf.numPages>100?'İlk 100 sayfa metne aktarıldı.':!text.trim()?'Bu PDF metin içermiyor. Taranmış sayfalar için konu notu ekleyebilirsin.':''};
 }
 if(/\.(txt|md|csv)$/i.test(file.name)||file.type.startsWith('text/'))return {text:await file.text(),warning:''};
 return {text:'',warning:''};
}
export function makeDrafts(topic,limit=12){
 const paragraphs=(topic.notes+'\n'+(topic.extractedText||'')).replace(/\r/g,'').split(/\n+|(?<=[.!?])\s+/).map(s=>s.replace(/^[-•*\d.)\s]+/,'').trim()).filter(s=>s.length>15&&s.length<700);
 const unique=[...new Set(paragraphs)];
 return unique.slice(0,limit).map((sentence)=>{
  const definition=sentence.match(/^([^:]{3,85}):\s*(.{8,})$/);
  if(definition)return {id:uid(),front:definition[1]+' nedir?',back:definition[2],topicId:topic.id,courseId:topic.courseId};
  const words=sentence.split(/\s+/);const hide=Math.max(1,Math.min(4,Math.floor(words.length/3)));
  return {id:uid(),front:words.slice(0,-hide).join(' ')+' ____\n\nBoşluğu tamamla.',back:sentence,topicId:topic.id,courseId:topic.courseId};
 });
}
export function download(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);}
export function validateBackup(value){
 if(value?.version!==1||!Array.isArray(value.topics)||!Array.isArray(value.cards)||!Array.isArray(value.files))throw new Error('Geçerli bir Filiz yedeği seç.');
 const ids=new Set(courses.map(c=>c.id)); const topicIds=new Set();const fileIds=new Set();
 for(const f of value.files){if(typeof f.id!=='string'||fileIds.has(f.id)||typeof f.content!=='string'||typeof f.name!=='string')throw new Error('Yedekte dosya bilgisi geçersiz.');fileIds.add(f.id);}
 for(const t of value.topics){if(typeof t.id!=='string'||topicIds.has(t.id)||!ids.has(t.courseId)||typeof t.title!=='string'||typeof t.notes!=='string'||!['new','learning','done'].includes(t.status)||!Array.isArray(t.files)||t.files.some(f=>!fileIds.has(f.id)))throw new Error('Yedekte konu bilgisi geçersiz.');topicIds.add(t.id);}
 const cardIds=new Set();
 for(const c of value.cards){if(typeof c.id!=='string'||cardIds.has(c.id)||!ids.has(c.courseId)||typeof c.front!=='string'||typeof c.back!=='string'||(c.topicId&&!topicIds.has(c.topicId)))throw new Error('Yedekte kart bilgisi geçersiz.');cardIds.add(c.id);}
 return value;
}
