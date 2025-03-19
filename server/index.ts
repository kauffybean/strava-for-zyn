
import express from 'express';
import cors from 'cors';
import path from 'path';
import { registerRoutes } from './routes';

// Node.js path resolution for CommonJS compatibility
const __dirname = path.resolve();

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

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build/index.html'));
  });
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
