const express = require('express');
const path = require('path');

const app = express();
const PORT = 5000;

// Serve the static HTML file
app.use(express.static(path.join(__dirname)));

// Default route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Static Zynfantry app running at http://0.0.0.0:${PORT}`);
});