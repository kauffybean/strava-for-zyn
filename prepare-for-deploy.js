const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Preparing for deployment...');

// First compile TypeScript files
try {
  console.log('Compiling TypeScript files...');
  execSync('npx tsc', { stdio: 'inherit' });
  console.log('TypeScript compilation successful.');
  
  // Create server/dist directory if it doesn't exist
  const serverDistDir = path.join(__dirname, 'server', 'dist');
  if (!fs.existsSync(serverDistDir)) {
    fs.mkdirSync(serverDistDir, { recursive: true });
  }
  
  // Copy all server files
  console.log('Copying compiled server files to server/dist...');
  const serverFiles = fs.readdirSync(path.join(__dirname, 'dist', 'server'));
  serverFiles.forEach(file => {
    fs.copyFileSync(
      path.join(__dirname, 'dist', 'server', file),
      path.join(__dirname, 'server', 'dist', file)
    );
  });
  
  // Create shared directories in both dist locations
  const serverDistSharedDir = path.join(__dirname, 'server', 'dist', 'shared');
  const distSharedDir = path.join(__dirname, 'dist', 'shared');
  
  if (!fs.existsSync(serverDistSharedDir)) {
    fs.mkdirSync(serverDistSharedDir, { recursive: true });
  }
  
  if (!fs.existsSync(distSharedDir)) {
    fs.mkdirSync(distSharedDir, { recursive: true });
  }
  
  // Copy shared files to both locations
  // First, copy any shared JS files generated from TypeScript compilation
  if (fs.existsSync(path.join(__dirname, 'dist', 'shared'))) {
    const compiledSharedFiles = fs.readdirSync(path.join(__dirname, 'dist', 'shared'));
    compiledSharedFiles.forEach(file => {
      // Copy to server/dist/shared
      fs.copyFileSync(
        path.join(__dirname, 'dist', 'shared', file),
        path.join(serverDistSharedDir, file)
      );
    });
  }
  
  // Then, copy any direct JS files from the shared directory
  const sharedFiles = fs.readdirSync(path.join(__dirname, 'shared'))
    .filter(file => file.endsWith('.js'));
  
  sharedFiles.forEach(file => {
    // Copy to server/dist/shared
    fs.copyFileSync(
      path.join(__dirname, 'shared', file),
      path.join(serverDistSharedDir, file)
    );
    
    // Copy to dist/shared
    fs.copyFileSync(
      path.join(__dirname, 'shared', file),
      path.join(distSharedDir, file)
    );
  });
  
  // Now fix all module import paths in compiled files
  const serverDistFilesDir = path.join(__dirname, 'server', 'dist');
  // Get a list of all .js files in server/dist
  const distFiles = fs.readdirSync(serverDistFilesDir)
    .filter(file => file.endsWith('.js'));
  
  // Fix imports in each file
  distFiles.forEach(file => {
    const filePath = path.join(serverDistFilesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace '../shared/db' or '../shared/schema' with './shared/db' or './shared/schema'
    content = content.replace(/require\(['"]\.\.\/shared\/(db|schema)['"]\)/g, 'require(\'./shared/$1\')');
    fs.writeFileSync(filePath, content);
  });
  
  console.log('Fixed module paths in all compiled files');
  
  console.log('Files copied successfully, including shared modules.');
} catch (error) {
  console.error('Build preparation failed:', error);
  process.exit(1);
}

// Create server/dist/index.js file
const serverDistIndexContent = `// This file is auto-generated for deployment
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const { registerRoutes } = require('./routes');
const { storage } = require('./storage');
const { initDatabase, createTables } = require('./db');

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
  console.log(\`\${new Date().toISOString()} - \${req.method} \${req.url}\`);
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
      console.log(\`Zynfantry app running at http://0.0.0.0:\${PORT}\`);
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
`;

// Write the server/dist/index.js
fs.writeFileSync(path.join(__dirname, 'server', 'dist', 'index.js'), serverDistIndexContent);
console.log('Created server entry point: server/dist/index.js');

// Create dist/index.js file
const serverEntryContent = `// This file is auto-generated for deployment
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
  console.log(\`\${new Date().toISOString()} - \${req.method} \${req.url}\`);
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
      console.log(\`Zynfantry app running at http://0.0.0.0:\${PORT}\`);
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
`;

// Write the server entry point
fs.writeFileSync(path.join(__dirname, 'dist', 'index.js'), serverEntryContent);
console.log('Created server entry point: dist/index.js');

console.log('Deployment preparation complete. The compiled files are in the dist directory.');