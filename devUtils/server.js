/**
 * Vanduo Framework - Development Server
 * Express.js server with Nodemon for auto-restart
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4860;

// Get the root directory (parent of devUtils)
const rootDir = path.join(__dirname, '..');

// Serve static files from root directory
app.use(express.static(rootDir));

// Serve CSS files
app.use('/css', express.static(path.join(rootDir, 'css')));

// Serve JS files
app.use('/js', express.static(path.join(rootDir, 'js')));

// Serve examples
app.use('/examples', express.static(path.join(rootDir, 'examples')));

// Main route - serve the example page
app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'examples', 'index.html'));
});

// Start Express server
const server = app.listen(PORT, () => {
  console.log('🚀 Vanduo Framework Development Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`📄 Main page: http://localhost:${PORT}/`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✨ Nodemon watching for changes in js, css, and html files');
  console.log('Press Ctrl+C to stop the server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

