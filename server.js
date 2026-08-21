const path = require('path');

// CRITICAL for Windows IIS / iisnode: Force process cwd to application root
try {
  process.chdir(__dirname);
} catch (e) {
  console.error('Failed to chdir:', e);
}

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const port = process.env.PORT || 3000;
const app = next({ 
  dev: false, 
  dir: path.resolve(__dirname),
  conf: { distDir: '.next' }
});
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Request error:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    }).listen(port, () => {
      console.log(`> DVT Tabu Game server listening on ${port}`);
    });
  })
  .catch((err) => {
    console.error('Fatal Next.js prepare error:', err);
    process.exit(1);
  });
