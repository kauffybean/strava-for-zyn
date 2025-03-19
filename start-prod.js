const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Configure environment for production
process.env.NODE_ENV = 'production';

// Determine the correct entry point
let entryPoint = './server/dist/index.js';
if (!fs.existsSync(path.resolve(entryPoint))) {
  console.log('Server dist entry point not found, falling back to main dist entry');
  entryPoint = './dist/index.js';
}

console.log(`Starting server from ${entryPoint}...`);

// Start the Node.js application with the correct entry point
const nodeProcess = spawn('node', [entryPoint], {
  env: { ...process.env, NODE_ENV: 'production' },
  stdio: 'inherit'
});

nodeProcess.on('error', (err) => {
  console.error('Failed to start server process:', err);
  process.exit(1);
});

// Log process exit
nodeProcess.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

// Handle signals
process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  nodeProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  nodeProcess.kill('SIGTERM');
});