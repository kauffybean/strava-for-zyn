const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const { registerRoutes } = require('./server/routes');
const { storage } = require('./server/storage');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS for development
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
    secure: false, // set to true in production with HTTPS
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days for better persistence
  },
  store: storage.sessionStore
};

// In production, set secure cookies
if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
  sessionConfig.cookie.secure = true;
}

// Apply session middleware
app.use(session(sessionConfig));

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API routes - register all routes from server/routes.js
const httpServer = registerRoutes(app);

// Serve static files for the React client
app.use(express.static(path.join(__dirname, 'client/dist')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Server is healthy');
});

// For API requests
app.use('/api', (req, res, next) => {
  // This middleware only processes /api routes
  next();
});

// For all other requests, serve the React app's index.html
app.get('*', (req, res, next) => {
  // Don't handle API routes here
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  console.log(`Serving React app for path: ${req.path}`);
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize database and start server
const { initDatabase, createTables } = require('./server/db');

async function startServer() {
  try {
    // Initialize database connection
    await initDatabase();
    
    // Create tables if they don't exist
    await createTables();
    
    // Start server
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`Zynfantry app running at http://0.0.0.0:${PORT}`);
    });
    
    // Handle errors
    httpServer.on('error', (error) => {
      console.error('Server error:', error);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();