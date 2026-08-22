const http = require('http');
const fs = require('fs');
const path = require('path');

// Diagnostic logger for Plesk Windows IIS
function logBoot(msg) {
  try {
    const logPath = path.join(__dirname, 'iisnode_boot.log');
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`);
  } catch (e) {
    // ignore
  }
}

logBoot('server.js starting up...');

process.on('uncaughtException', (err) => {
  logBoot('UNCAUGHT EXCEPTION: ' + (err && err.stack ? err.stack : err));
});

process.on('unhandledRejection', (reason, promise) => {
  logBoot('UNHANDLED REJECTION: ' + (reason && reason.stack ? reason.stack : reason));
});

try {
  const next = require('next');
  const dev = false;
  const app = next({ dev, dir: __dirname });
  const handle = app.getRequestHandler();

  logBoot('Next.js instance created. Calling app.prepare()...');

  app.prepare()
    .then(() => {
      logBoot('app.prepare() completed successfully.');

      const server = http.createServer((req, res) => {
        try {
          handle(req, res);
        } catch (err) {
          logBoot('Error handling request: ' + req.url + ' -> ' + (err && err.stack ? err.stack : err));
          res.statusCode = 500;
          res.end('Server Error: ' + err.message);
        }
      });

      const port = process.env.PORT || 3000;
      server.listen(port, () => {
        logBoot(`HTTP server listening on: ${port}`);
      });
    })
    .catch((err) => {
      logBoot('FATAL: app.prepare() failed: ' + (err && err.stack ? err.stack : err));
      process.exit(1);
    });
} catch (err) {
  logBoot('FATAL: Top-level error in server.js: ' + (err && err.stack ? err.stack : err));
}
