// Lighthouse 측정용 정적 서버: GitHub Pages처럼 폴더 주소는 index.html로, 글자 파일은 gzip으로 내준다.
// python3 -m http.server는 압축하지 않아서 페이지 크기가 실제보다 크게 잡히고 점수가 실제와 달라진다.
// 사용: node scripts/serve-dist.mjs dist 4323
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { createGzip } from 'node:zlib';

const [root = 'dist', portArg = '4323'] = process.argv.slice(2);
const port = Number(portArg);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain',
};
const GZIP = new Set(['.html', '.css', '.js', '.json', '.svg', '.txt']);

createServer((req, res) => {
  const path = normalize(decodeURIComponent((req.url ?? '/').split('?')[0]));
  let file = join(root, path);
  if (existsSync(file) && statSync(file).isDirectory()) {
    if (!path.endsWith('/')) {
      res.writeHead(301, { Location: `${path}/` });
      res.end();
      return;
    }
    file = join(file, 'index.html');
  }
  if (!existsSync(file)) {
    res.writeHead(404, { 'Content-Type': TYPES['.html'] });
    createReadStream(join(root, '404.html')).pipe(res);
    return;
  }
  const ext = extname(file);
  // Pages가 보내는 캐시 시간(10분)과 같게 둔다.
  const headers = { 'Content-Type': TYPES[ext] ?? 'application/octet-stream', 'Cache-Control': 'max-age=600' };
  if (GZIP.has(ext) && /gzip/.test(req.headers['accept-encoding'] ?? '')) {
    res.writeHead(200, { ...headers, 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding' });
    createReadStream(file).pipe(createGzip()).pipe(res);
    return;
  }
  res.writeHead(200, headers);
  createReadStream(file).pipe(res);
}).listen(port);
