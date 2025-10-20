// Production startup script for Render.com
const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting Whop Sales Backend...');

// Check if dist folder exists, if not build it
try {
  const distPath = path.join(__dirname, 'dist');
  const fs = require('fs');
  
  if (!fs.existsSync(distPath)) {
    console.log('📦 Building TypeScript files...');
    execSync('npm run build', { stdio: 'inherit' });
  }
  
  console.log('✅ Starting server...');
  require('./dist/server.js');
  
} catch (error) {
  console.error('❌ Error starting server:', error.message);
  process.exit(1);
}
