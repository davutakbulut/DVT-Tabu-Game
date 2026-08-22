const http = require('http');
const next = require('next');

const dev = false;
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;

app.prepare()
  .then(() => {
    http.createServer((req, res) => {
      handle(req, res);
    }).listen(port);
  })
  .catch((err) => {
    console.error('Next.js startup error:', err);
    process.exit(1);
  });
