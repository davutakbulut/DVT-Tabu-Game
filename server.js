const http = require('http');
const fs = require('fs');
const path = require('path');
const next = require('next');

const port = process.env.PORT || 3000;
const dev = false;
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    http.createServer((req, res) => {
      // Direct pass-through for Let's Encrypt ACME verification tokens
      if (req.url && req.url.includes('.well-known/acme-challenge/')) {
        const token = req.url.split('/').pop().split('?')[0];
        const tokenPath = path.join(__dirname, '.well-known', 'acme-challenge', token);
        if (fs.existsSync(tokenPath)) {
          const file = fs.readFileSync(tokenPath);
          res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
          return res.end(file);
        }
      }
      
      handle(req, res);
    }).listen(port);
  })
  .catch((err) => {
    console.error('Next.js startup error:', err);
    process.exit(1);
  });
