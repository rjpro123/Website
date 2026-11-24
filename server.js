import express from 'express';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

const COMPRESSIBLE_RE = /^(?:text\/|application\/(?:javascript|json|xml)|image\/svg\+xml)/i;

const BLOCKED_PATHS = new Set([
  '/brief.md',
  '/readme.md',
  '/package.json',
  '/package-lock.json',
  '/metadata.json',
  '/server.js',
  '/.gitignore',
  '/gallery/readme.txt'
]);

app.disable('x-powered-by');

app.use((req, res, next) => {
  const accept = String(req.headers['accept-encoding'] || '');
  const encoding = /\bbr\b/i.test(accept) ? 'br' : /\bgzip\b/i.test(accept) ? 'gzip' : '';
  if (!encoding || req.method === 'HEAD') return next();

  const origWrite = res.write.bind(res);
  const origEnd = res.end.bind(res);
  const origWriteHead = res.writeHead.bind(res);
  let compressor = null;
  let decided = false;

  function initCompressor() {
    if (decided) return;
    decided = true;
    const ct = String(res.getHeader('Content-Type') || '');
    const ce = res.getHeader('Content-Encoding');
    const len = Number(res.getHeader('Content-Length') || 0);
    if (
      ce ||
      res.statusCode === 204 ||
      res.statusCode === 304 ||
      !COMPRESSIBLE_RE.test(ct) ||
      (len > 0 && len < 1024)
    ) {
      return;
    }
    res.removeHeader('Content-Length');
    res.setHeader('Content-Encoding', encoding);
    res.setHeader('Vary', 'Accept-Encoding');
    compressor = encoding === 'br'
      ? zlib.createBrotliCompress({ params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 4 } })
      : zlib.createGzip({ level: 6 });
    compressor.on('data', (chunk) => origWrite(chunk));
    compressor.on('drain', () => res.emit('drain'));
    compressor.on('end', () => origEnd());
    compressor.on('error', () => origEnd());
  }

  res.writeHead = (statusCode, statusMessage, headers) => {
    if (typeof statusMessage === 'object' && statusMessage !== null) {
      headers = statusMessage;
      statusMessage = undefined;
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        res.setHeader(k, v);
      }
    }
    res.statusCode = statusCode;
    initCompressor();
    return statusMessage !== undefined
      ? origWriteHead(statusCode, statusMessage)
      : origWriteHead(statusCode);
  };

  res.write = (chunk, enc, cb) => {
    if (!decided) initCompressor();
    return compressor ? compressor.write(chunk, enc, cb) : origWrite(chunk, enc, cb);
  };

  res.end = (chunk, enc, cb) => {
    if (!decided) initCompressor();
    if (!compressor) return origEnd(chunk, enc, cb);
    if (typeof chunk === 'function') {
      cb = chunk;
      chunk = undefined;
      enc = undefined;
    } else if (typeof enc === 'function') {
      cb = enc;
      enc = undefined;
    }
    if (chunk !== undefined) compressor.end(chunk, enc, cb);
    else compressor.end(cb);
    return res;
  };

  next();
});

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  let p;
  try {
    p = decodeURIComponent(req.path).toLowerCase();
  } catch {
    return res.status(404).sendFile(path.join(__dirname, '404.html'));
  }
  if (
    p.startsWith('/.') ||
    p.includes('/.') ||
    p === '/public' ||
    p.startsWith('/public/') ||
    BLOCKED_PATHS.has(p)
  ) {
    return res.status(404).sendFile(path.join(__dirname, '404.html'));
  }
  next();
});

// Redirect /gallery/ to /gallery so relative asset paths resolve from root,
// and serve gallery.html for /gallery to prevent directory redirect collision
app.get(['/gallery', '/gallery/'], (req, res) => {
  if (req.path === '/gallery/') {
    return res.redirect(301, '/gallery');
  }
  res.sendFile(path.join(__dirname, 'gallery.html'));
});

app.use(express.static(__dirname, {
  extensions: ['html'],
  setHeaders: (res, filePath) => {
    if (/\.html?$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    } else if (/\.(?:css|js|png|jpe?g|webp|svg|ico)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=604800');
    }
  }
}));

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
