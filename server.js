import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

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
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  const p = req.path.toLowerCase();
  if (
    p.startsWith('/.') ||
    p === '/public' ||
    p.startsWith('/public/') ||
    BLOCKED_PATHS.has(p)
  ) {
    return res.status(404).sendFile(path.join(__dirname, '404.html'));
  }
  next();
});

// Serve gallery.html for /gallery and /gallery/ to prevent directory redirect collision
app.get(['/gallery', '/gallery/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'gallery.html'));
});

app.use(express.static(__dirname, { extensions: ['html'] }));

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
