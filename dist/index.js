// This file is auto-generated for deployment
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
// Require with proper paths to compiled files
const { registerRoutes } = require('../server/dist/routes');
const { storage } = require('../server/dist/storage');
const { initDatabase, createTables } = require('../server/dist/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'zynfantry-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  },
  store: storage.sessionStore
};

// Set trust proxy for production environment
app.set('trust proxy', 1);

// In production, set secure cookies
if (process.env.NODE_ENV === 'production') {
  sessionConfig.cookie.secure = true;
}

// Apply session middleware
app.use(session(sessionConfig));

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API routes
const httpServer = registerRoutes(app);

// Serve static files from the React app if they exist
const clientDistPath = path.join(process.cwd(), 'client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  
  // Handle other routes by returning the React app
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    const indexHtmlPath = path.join(clientDistPath, 'index.html');
    if (fs.existsSync(indexHtmlPath)) {
      res.sendFile(indexHtmlPath);
    } else {
      // Return a simple API running message if client files don't exist
      res.status(200).send('Zynfantry API running.');
    }
  });
} else {
  // Default route when client files don't exist
  app.get('/', (req, res) => {
    res.status(200).send('Zynfantry API running.');
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize database and start server
async function startServer() {
  try {
    await initDatabase();
    await createTables();
    
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`Zynfantry app running at http://0.0.0.0:${PORT}`);
    });
    
    httpServer.on('error', (error) => {
      console.error('Server error:', error);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();