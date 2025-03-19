const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve the static HTML file
app.use(express.static(path.join(__dirname)));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Server is healthy');
});

// Special routes for specific HTML files
app.get('/feed.html', (req, res) => {
  console.log('Serving feed.html');
  res.sendFile(path.join(__dirname, 'feed.html'));
});

app.get('/post.html', (req, res) => {
  console.log('Serving post.html');
  res.sendFile(path.join(__dirname, 'post.html'));
});

// Default route for all other requests
app.get('*', (req, res) => {
  console.log('Serving index.html');
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Static Zynfantry app running at http://0.0.0.0:${PORT}`);
});

// Handle errors
server.on('error', (error) => {
  console.error('Server error:', error);
});