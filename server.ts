import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();

  // Allow up to 50MB payload for photos & high-res images
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  const dataDir = path.join(__dirname, 'public', 'data');
  const memoriesDir = path.join(__dirname, 'public', 'memories');
  const publicDataFilePath = path.join(dataDir, 'anniversary-data.json');
  const rootDataFilePath = path.join(__dirname, 'app-data.json');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(memoriesDir)) {
    fs.mkdirSync(memoriesDir, { recursive: true });
  }

  // Serve static public/memories directory directly
  app.use('/memories', express.static(memoriesDir));

  // 1. GET Current Anniversary Data
  app.get('/api/anniversary-data', (_req, res) => {
    try {
      if (fs.existsSync(publicDataFilePath)) {
        const raw = fs.readFileSync(publicDataFilePath, 'utf-8');
        return res.json(JSON.parse(raw));
      }
      if (fs.existsSync(rootDataFilePath)) {
        const raw = fs.readFileSync(rootDataFilePath, 'utf-8');
        return res.json(JSON.parse(raw));
      }
      return res.status(404).json({ error: 'No custom data saved on server' });
    } catch (err: any) {
      console.error('Error fetching data:', err);
      return res.status(500).json({ error: 'Failed to read data' });
    }
  });

  // 2. POST Save Anniversary Data (Syncs to server disk so deployment uses it!)
  app.post('/api/anniversary-data', (req, res) => {
    try {
      const data = req.body;
      if (!data || typeof data !== 'object') {
        return res.status(400).json({ error: 'Invalid data format' });
      }

      const jsonStr = JSON.stringify(data, null, 2);
      fs.writeFileSync(publicDataFilePath, jsonStr, 'utf-8');
      fs.writeFileSync(rootDataFilePath, jsonStr, 'utf-8');

      // Also sync to dist/ if dist exists (for production bundle)
      const distDataDir = path.join(__dirname, 'dist', 'data');
      if (fs.existsSync(distDataDir)) {
        fs.writeFileSync(path.join(distDataDir, 'anniversary-data.json'), jsonStr, 'utf-8');
      }

      console.log('✅ Successfully saved anniversary data to server storage.');
      return res.json({ success: true, message: 'Saved successfully' });
    } catch (err: any) {
      console.error('Error saving data:', err);
      return res.status(500).json({ error: 'Failed to save data' });
    }
  });

  // 3. POST Upload Photo (Saves image to /public/memories and returns public path)
  app.post('/api/upload-photo', (req, res) => {
    try {
      const { filename, dataUrl } = req.body;
      if (!dataUrl || !filename) {
        return res.status(400).json({ error: 'Filename and dataUrl required' });
      }

      const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: 'Invalid base64 data URL format' });
      }

      const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const cleanName = `${Date.now()}-${sanitized}`;
      const safeFilename = cleanName.endsWith(`.${ext}`) ? cleanName : `${cleanName}.${ext}`;
      const buffer = Buffer.from(matches[2], 'base64');

      const targetPath = path.join(memoriesDir, safeFilename);
      fs.writeFileSync(targetPath, buffer);

      // Also copy to dist/memories if dist exists
      const distMemoriesDir = path.join(__dirname, 'dist', 'memories');
      if (!fs.existsSync(distMemoriesDir) && fs.existsSync(path.join(__dirname, 'dist'))) {
        fs.mkdirSync(distMemoriesDir, { recursive: true });
      }
      if (fs.existsSync(distMemoriesDir)) {
        fs.writeFileSync(path.join(distMemoriesDir, safeFilename), buffer);
      }

      const publicUrl = `/memories/${safeFilename}`;
      console.log(`✅ Uploaded photo: ${publicUrl}`);
      return res.json({ success: true, url: publicUrl });
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      return res.status(500).json({ error: 'Failed to upload photo' });
    }
  });

  // Vite middleware in dev, static files in production
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server listening on http://0.0.0.0:${PORT} (isProd: ${isProd})`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
