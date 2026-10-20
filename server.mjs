import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('dist');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.json':'application/json','.mjs':'text/javascript; charset=utf-8'};
http.createServer(async (req,res)=>{
 try {
  const path = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let file = resolve(root, '.'+path);
  if(file !== root && !file.startsWith(root+sep)){res.writeHead(403);return res.end();}
  try{if(!(await stat(file)).isFile())file=resolve(root,'index.html');}catch{file=resolve(root,'index.html');}
  const body=await readFile(file);
  res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':extname(file)==='.html'?'no-cache':'public, max-age=3600'});res.end(body);
 }catch{res.writeHead(500);res.end('Server error');}
}).listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('Filiz production server listening on port '+(process.env.PORT||3000)));
