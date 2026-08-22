const http = require('http');
const { parse } = require('url');
const path = require('path');
const next = require('next');

const dev = false;
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    const server = http.createServer((req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Request Handling Error:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });

    server.listen(port, (err) => {
      if (err) {
        console.error('Server Listen Error:', err);
        process.exit(1);
      }
      console.log(`> DVT Tabu Game server running on ${port}`);
    });
  })
  .catch((err) => {
    console.error('Next.js app.prepare() Failed:', err);
    process.exit(1);
  });
