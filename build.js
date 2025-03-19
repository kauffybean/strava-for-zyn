const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure server/dist directory exists
if (!fs.existsSync(path.join(__dirname, 'server', 'dist'))) {
  fs.mkdirSync(path.join(__dirname, 'server', 'dist'), { recursive: true });
}

// Compile TypeScript files
try {
  console.log('Compiling TypeScript files...');
  execSync('npx tsc -p server/tsconfig.json', { stdio: 'inherit' });
  console.log('TypeScript compilation successful.');
} catch (error) {
  console.error('TypeScript compilation failed:', error);
  process.exit(1);
}

console.log('Build completed successfully!');