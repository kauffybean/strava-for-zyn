import express from 'express';
import cors from 'cors';
import path from 'path';
import { registerRoutes } from './routes';

const app = express();
const PORT = parseInt(process.env.PORT || '8000');

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5000',
  credentials: true
}));

// API routes
const server = registerRoutes(app);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
