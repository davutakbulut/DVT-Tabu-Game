const http = require('http');
const { parse } = require('url');
const next = require('next');

const dev = false;
const port = process.env.PORT || 3000;

const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    http.createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Server error handling request:', req.url, err);
        res.statusCode = 500;
        res.end('Internal Server Error: ' + (err && err.message ? err.message : ''));
      }
    }).listen(port);
  })
  .catch((err) => {
    console.error('Next.js startup error:', err);
    process.exit(1);
  });
