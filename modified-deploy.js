const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting deployment process...');

// Run prepare-for-deploy.js first
try {
  console.log('Preparing for deployment...');
  require('./prepare-for-deploy.js');
} catch (error) {
  console.error('Preparation failed:', error);
  process.exit(1);
}

console.log('Setting up production environment...');

// Create a start-prod.js file that properly starts the server in production mode
const startProdContent = `const path = require('path');
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

console.log(\`Starting server from \${entryPoint}...\`);

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
  console.log(\`Server process exited with code \${code}\`);
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
`;

fs.writeFileSync(path.join(__dirname, 'start-prod.js'), startProdContent);
console.log('Created start-prod.js for production server startup');

// Ensure server/dist directory exists
const serverDistDir = path.join(__dirname, 'server', 'dist');
if (!fs.existsSync(serverDistDir)) {
  fs.mkdirSync(serverDistDir, { recursive: true });
}

// Check that server/dist/index.js exists
const serverDistIndex = path.join(serverDistDir, 'index.js');
if (!fs.existsSync(serverDistIndex)) {
  console.error('Error: server/dist/index.js not found!');
  console.log('Available files in server/dist:');
  if (fs.existsSync(serverDistDir)) {
    console.log(fs.readdirSync(serverDistDir));
  } else {
    console.log('server/dist directory does not exist');
  }
  process.exit(1);
}

// Check that all required files exist
['routes.js', 'storage.js', 'db.js', 'auth.js'].forEach(file => {
  const filePath = path.join(serverDistDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`Error: ${file} not found in server/dist`);
    process.exit(1);
  }
});

// Check shared directory
const sharedDir = path.join(serverDistDir, 'shared');
if (!fs.existsSync(sharedDir)) {
  console.error('Error: server/dist/shared directory not found!');
  process.exit(1);
}

console.log('All required server files verified successfully.');

console.log('Deployment completed successfully!');
console.log('To start the app in production mode, run:');
console.log('  node start-prod.js');