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
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
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

// Serve static files from the static-app directory
app.use(express.static(path.join(__dirname, 'static-app')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Server is healthy');
});

// Default route - serve the appropriate HTML file from static-app
app.get('*', (req, res) => {
  const requestPath = req.path.toLowerCase();
  
  // Determine which HTML file to serve based on the requested path
  if (requestPath === '/feed.html' || requestPath === '/feed') {
    console.log('Serving feed.html');
    res.sendFile(path.join(__dirname, 'static-app', 'feed.html'));
  } else if (requestPath === '/post.html' || requestPath === '/post') {
    console.log('Serving post.html');
    res.sendFile(path.join(__dirname, 'static-app', 'post.html'));
  } else {
    console.log('Serving index.html');
    res.sendFile(path.join(__dirname, 'static-app', 'index.html'));
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Zynfantry app running at http://0.0.0.0:${PORT}`);
});

// Handle errors
httpServer.on('error', (error) => {
  console.error('Server error:', error);
});