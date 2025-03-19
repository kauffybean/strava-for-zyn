
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { registerRoutes } from './routes';

// Node.js path resolution for CommonJS compatibility
const __dirname = process.cwd();

const app = express();
const PORT = parseInt(process.env.PORT || '3000');
console.log(`Starting server on port ${PORT}`);

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use(cors({
  origin: true,
  credentials: true
}));

const server = registerRoutes(app);

// Serve client assets in production
if (process.env.NODE_ENV === 'production') {
  // Client folder could be different in production vs. development
  const clientPath = path.join(__dirname, 'client/dist');
  const clientPathAlt = path.join(__dirname, 'client/build');
  
  // Check if client/dist exists, otherwise try client/build
  const clientFolder = fs.existsSync(clientPath) ? clientPath : 
                      (fs.existsSync(clientPathAlt) ? clientPathAlt : null);
  
  if (clientFolder) {
    app.use(express.static(clientFolder));
    app.get('*', (req, res) => {
      // Skip API routes
      if (req.path.startsWith('/api/')) {
        return;
      }
      res.sendFile(path.join(clientFolder, 'index.html'));
    });
    console.log(`Serving static files from ${clientFolder}`);
  } else {
    console.warn('Client build folder not found. Static files will not be served.');
  }
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
