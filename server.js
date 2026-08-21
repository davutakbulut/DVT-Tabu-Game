const { createServer } = require('http');
const { parse } = require('url');
const fs = require('fs');
const path = require('path');
const next = require('next');

// Check if production build files exist, otherwise fallback smoothly
const isBuilt = fs.existsSync(path.join(__dirname, '.next', 'prerender-manifest.json'));
const dev = process.env.NODE_ENV !== 'production' && !isBuilt;
const port = process.env.PORT || 3000;
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> DVT Tabu Game Ready on ${port} (mode: ${dev ? 'dev-fallback' : 'production'})`);
  });
}).catch((err) => {
  console.error('Next.js server initialization error:', err);
});
