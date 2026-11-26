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
  '/bun.lock',
  '/metadata.json',
  '/server.js',
  '/.gitignore',
  '/gallery/readme.txt'
]);

app.disable('x-powered-by');

function negotiateEncoding(acceptHeader) {
  const accept = String(acceptHeader || '');
  if (!accept) return '';
  let brQ = 0;
  let gzipQ = 0;
  for (const part of accept.split(',')) {
    const [rawName, ...params] = part.trim().toLowerCase().split(';');
    if (rawName !== 'br' && rawName !== 'gzip') continue;
    let q = 1;
    for (const p of params) {
      const m = /^q=([0-9.]+)$/.exec(p.trim());
      if (m) {
        const parsed = Number(m[1]);
        q = Number.isFinite(parsed) ? parsed : 0;
        break;
      }
    }
    if (rawName === 'br' && q > brQ) brQ = q;
    if (rawName === 'gzip' && q > gzipQ) gzipQ = q;
  }
  if (brQ > 0 && brQ >= gzipQ) return 'br';
  if (gzipQ > 0) return 'gzip';
  return '';
}

app.use((req, res, next) => {
  const encoding = negotiateEncoding(req.headers['accept-encoding']);
  if (!encoding || req.method === 'HEAD') return next();

  const origWrite = res.write.bind(res);
  const origEnd = res.end.bind(res);
  const origWriteHead = res.writeHead.bind(res);
  let compressor = null;
  let decided = false;

  function appendVary(value) {
    const existing = res.getHeader('Vary');
    if (!existing) {
      res.setHeader('Vary', value);
      return;
    }
    const list = Array.isArray(existing)
      ? existing.flatMap((v) => String(v).split(','))
      : String(existing).split(',');
    const normalized = list.map((v) => v.trim()).filter(Boolean);
    if (!normalized.some((v) => v.toLowerCase() === value.toLowerCase())) {
      normalized.push(value);
      res.setHeader('Vary', normalized.join(', '));
    }
  }

  function initCompressor() {
    if (decided) return;
    decided = true;
    const ct = String(res.getHeader('Content-Type') || '');
    const ce = res.getHeader('Content-Encoding');
    const cr = res.getHeader('Content-Range');
    const len = Number(res.getHeader('Content-Length') || 0);
    if (
      ce ||
      cr ||
      res.statusCode < 200 ||
      res.statusCode === 204 ||
      res.statusCode === 205 ||
      res.statusCode === 206 ||
      res.statusCode === 304 ||
      !COMPRESSIBLE_RE.test(ct) ||
      (len > 0 && len < 1024)
    ) {
      return;
    }
    res.removeHeader('Content-Length');
    res.setHeader('Content-Encoding', encoding);
    appendVary('Accept-Encoding');
    compressor = encoding === 'br'
      ? zlib.createBrotliCompress({ params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 4 } })
      : zlib.createGzip({ level: 6 });

    const onResDrain = () => {
      if (compressor && !compressor.destroyed) compressor.resume();
    };
    const cleanup = () => {
      res.removeListener('drain', onResDrain);
    };

    res.on('drain', onResDrain);
    res.once('close', () => {
      cleanup();
      if (compressor && !compressor.destroyed && !res.writableEnded) {
        compressor.destroy();
      }
    });
    compressor.on('data', (chunk) => {
      if (!origWrite(chunk) && !compressor.destroyed) {
        compressor.pause();
      }
    });
    compressor.on('drain', () => res.emit('drain'));
    compressor.on('end', () => {
      cleanup();
      origEnd();
    });
    compressor.on('error', () => {
      cleanup();
      origEnd();
    });
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
    p = path.posix.normalize(decodeURIComponent(req.path).replace(/\\/g, '/').replace(/\/{2,}/g, '/')).toLowerCase();
  } catch {
    return res.status(404).sendFile(path.join(__dirname, '404.html'));
  }
  const cleanPath = p.length > 1 ? p.replace(/\/+$/, '') : p;
  if (
    p.startsWith('/.') ||
    p.includes('/.') ||
    cleanPath === '/public' ||
    cleanPath.startsWith('/public/') ||
    BLOCKED_PATHS.has(cleanPath)
  ) {
    return res.status(404).sendFile(path.join(__dirname, '404.html'));
  }
  next();
});

// Normalize trailing slashes on page routes and preserve query strings
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  const qIdx = req.url.indexOf('?');
  const qs = qIdx !== -1 ? req.url.slice(qIdx) : '';
  const lp = req.path.toLowerCase();
  if (lp === '/index' || lp === '/index/') {
    return res.redirect(301, '/' + qs);
  }
  if (lp === '/gallery/' || lp === '/services/' || lp === '/staff/' || lp === '/thanks/') {
    return res.redirect(301, lp.slice(0, -1) + qs);
  }
  next();
});

// Serve gallery.html for /gallery to prevent directory redirect collision
app.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, 'gallery.html'));
});

app.use(express.static(__dirname, {
  extensions: ['html'],
  redirect: false,
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
