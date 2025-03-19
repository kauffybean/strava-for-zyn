import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { registerRoutes } from './routes';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

app.use(express.json());
app.use(cors({
  origin: function(origin, callback) {
    callback(null, true); // Allow all origins in development
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Register API routes
const server = registerRoutes(app);

// Serve client assets in production
if (process.env.NODE_ENV === 'production') {
  const clientPath = path.join(process.cwd(), '../client/dist');

  if (fs.existsSync(clientPath)) {
    app.use(express.static(clientPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) return;
      res.sendFile(path.join(clientPath, 'index.html'));
    });
    console.log(`Serving static files from ${clientPath}`);
  } else {
    console.warn(`Client build folder not found at ${clientPath}`);
  }
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});