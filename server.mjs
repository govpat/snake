import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

const host = '127.0.0.1';
const port = Number(process.env.PORT || 4173);

createServer(async (req, res) => {
  try {
    const url = req.url === '/' ? '/index.html' : req.url;
    const pathname = normalize(url).replace(/^\/+/, '');
    const filePath = join(process.cwd(), pathname);
    const body = await readFile(filePath);
    const type = MIME[extname(filePath)] || 'application/octet-stream';
    res.writeHead(200, { 'content-type': type });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  }
}).listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});
