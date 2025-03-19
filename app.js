const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { registerRoutes } = require('./server/routes');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API routes - register all routes from server/routes.js
registerRoutes(app);

// Serve static files from the static-app directory
app.use(express.static(path.join(__dirname, 'static-app')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Server is healthy');
});

// Default route - serve the index.html from static-app
app.get('*', (req, res) => {
  console.log('Serving index.html');
  res.sendFile(path.join(__dirname, 'static-app', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Zynfantry app running at http://0.0.0.0:${PORT}`);
});

// Handle errors
server.on('error', (error) => {
  console.error('Server error:', error);
});