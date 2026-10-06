#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PROJECT_DIR="$(/usr/bin/time -p pwd)"
WEBSITE_DIR="$PROJECT_DIR/website"
DIST_DIR="$WEBSITE_DIR/dist/client"
PORT="${PORT:-3000}"
WEB_DIR="${OPENCODE_WEB_DIR:-/home/runner/work/_temp/omgithub-web}"
/usr/bin/time -p mkdir -p "$WEB_DIR"
/usr/bin/time -p test -f "$WEBSITE_DIR/package.json"
if /usr/bin/time -p test -f "$WEBSITE_DIR/package-lock.json"; then
  /usr/bin/time -p npm --prefix "$WEBSITE_DIR" ci --no-audit --no-fund
else
  /usr/bin/time -p npm --prefix "$WEBSITE_DIR" install --no-audit --no-fund
fi
/usr/bin/time -p npm --prefix "$WEBSITE_DIR" run build
/usr/bin/time -p test -f "$DIST_DIR/index.html"
/usr/bin/time -p printf '{"project":"%s","directory":"%s"}\n' "$PROJECT_DIR" "$DIST_DIR" > "$WEB_DIR/deployment-output.json"
/usr/bin/time -p cat "$WEB_DIR/deployment-output.json"
export PORT DIST_DIR WEBSITE_DIR
/usr/bin/time -p node --input-type=module -e 'import {createServer} from "node:http";import {readFileSync,existsSync,statSync} from "node:fs";import {resolve,join,extname} from "node:path";import {pathToFileURL} from "node:url";const root=resolve(process.env.DIST_DIR);const web=resolve(process.env.WEBSITE_DIR);const mime={".html":"text/html",".js":"application/javascript",".css":"text/css",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".wasm":"application/wasm"};const server=createServer(async (req,res)=>{try{const url=new URL(req.url,"http://localhost");if(url.pathname==="/api/catalog"||url.pathname==="/api/preview"){const name=url.pathname==="/api/catalog"?"catalog":"preview";const {default:handler}=await import(pathToFileURL(join(web,"api",name+".js")).href);await handler(req,res);return;}let p=resolve(root,"."+decodeURIComponent(url.pathname));if(p!==root&&!p.startsWith(root+"/")){res.writeHead(404);res.end();return;}try{if(statSync(p).isDirectory())p=join(p,"index.html");}catch{p=join(root,"index.html");if(!existsSync(p)){res.writeHead(404);res.end("Not found");return;}}if(!existsSync(p)){const accept=req.headers.accept||"";if(accept.includes("text/html")){p=join(root,"index.html");}else{res.writeHead(404);res.end("Not found");return;}}res.setHeader("Content-Type",mime[extname(p)]||"application/octet-stream");res.setHeader("Cache-Control","no-cache");res.end(readFileSync(p));}catch{res.writeHead(404);res.end("Not found");}});server.listen(Number(process.env.PORT||"3000"),"0.0.0.0",()=>console.log("Serving "+root+" on port "+process.env.PORT));'
