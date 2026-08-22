const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const nextDir = path.join(__dirname, '.next');
const prerenderManifest = path.join(nextDir, 'prerender-manifest.json');

// Check if Next.js build output exists
if (!fs.existsSync(prerenderManifest)) {
  console.warn('Next.js production build (.next) not found. Serving temporary build notice.');
  
  const server = http.createServer((req, res) => {
    res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="utf-8">
        <title>DVT Tabu Game - Derleme Gerekiyor</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #090d16; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
          .card { background: #131a29; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; max-width: 480px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
          h1 { color: #f59e0b; font-size: 22px; margin-top: 0; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
          .code { background: #0f172a; padding: 8px 16px; border-radius: 8px; font-family: monospace; color: #38bdf8; font-weight: bold; margin: 16px 0; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>⚙️ Uygulama Derleniyor / Build Gerekiyor</h1>
          <p>Proje dosyaları sunucuya yüklendi ancak üretim derlemesi (build) henüz tamamlanmadı.</p>
          <div class="code">Plesk &rarr; Run Script &rarr; build</div>
          <p>Plesk Node.js panelinden <strong>"Run script (build)"</strong> butonuna tıklayıp derleme bittiğinde <strong>"Restart App"</strong> yapınız.</p>
        </div>
      </body>
      </html>
    `);
  });

  server.listen(port);
} else {
  const next = require('next');
  const dev = false;
  const app = next({ dev, dir: __dirname });
  const handle = app.getRequestHandler();

  app.prepare()
    .then(() => {
      http.createServer((req, res) => {
        handle(req, res);
      }).listen(port);
    })
    .catch((err) => {
      console.error('Next.js prepare error:', err);
      process.exit(1);
    });
}
