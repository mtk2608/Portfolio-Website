// Serves dist/ locally WITH the headers from public/_headers applied, so you can
// check that the CSP and other security headers don't break the site before
// deploying. Usage: npm run build && npm run preview:secure
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';

const DIST = join(import.meta.dirname, '..', 'dist');
const PORT = Number(process.env.PORT ?? 4322);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
  '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json',
};

// Parse the Netlify/Cloudflare _headers format: a path pattern, then indented "Name: value" lines.
const rules = [];
for (const line of readFileSync(join(DIST, '_headers'), 'utf8').split(/\r?\n/)) {
  if (!line.trim() || line.trim().startsWith('#')) continue;
  if (!/^\s/.test(line)) rules.push({ pattern: line.trim(), headers: [] });
  else rules.at(-1)?.headers.push(line.trim().split(/:\s*(.*)/s).slice(0, 2));
}
const matches = (pattern, path) =>
  new RegExp('^' + pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$').test(path);

createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
  let file = normalize(join(DIST, path));
  if (!file.startsWith(DIST)) return res.writeHead(403).end();
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  let status = 200;
  if (!existsSync(file)) { file = join(DIST, '404.html'); status = 404; }
  const found = existsSync(file);

  for (const r of rules) if (matches(r.pattern, path)) for (const [k, v] of r.headers) res.setHeader(k, v);
  // HSTS/upgrade-insecure-requests are meaningless (and sticky) on plain-http localhost.
  res.removeHeader('Strict-Transport-Security');
  const csp = res.getHeader('Content-Security-Policy');
  if (csp) res.setHeader('Content-Security-Policy', String(csp).replace(/;\s*upgrade-insecure-requests/, ''));

  if (!found) return res.writeHead(404).end('Not found');
  if (!res.hasHeader('Content-Type')) res.setHeader('Content-Type', TYPES[extname(file)] ?? 'application/octet-stream');
  res.writeHead(status).end(readFileSync(file));
}).listen(PORT, () => console.log(`Serving dist/ with _headers on http://localhost:${PORT}`));
