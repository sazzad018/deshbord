#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create deployment directory
const deployDir = path.join(__dirname, '..', 'cpanel-deploy');

console.log('📦 Creating cPanel deployment package...');

// Clean and create deploy directory
if (fs.existsSync(deployDir)) {
  fs.rmSync(deployDir, { recursive: true, force: true });
}
fs.mkdirSync(deployDir, { recursive: true });

// Copy dist folder contents
const distPath = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ Build not found! Run "npm run build" first.');
  process.exit(1);
}

// Copy files to deploy directory
fs.cpSync(distPath, deployDir, { recursive: true });

// Create production package.json for cPanel
const productionPackage = {
  "name": "social-ads-expert",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.10.4",
    "drizzle-orm": "^0.39.1",
    "drizzle-zod": "^0.7.0",
    "express": "^4.21.2",
    "express-session": "^1.18.1",
    "connect-pg-simple": "^10.0.0",
    "memorystore": "^1.6.7",
    "zod": "^3.24.2",
    "zod-validation-error": "^3.4.0",
    "ws": "^8.18.0"
  }
};

fs.writeFileSync(
  path.join(deployDir, 'package.json'),
  JSON.stringify(productionPackage, null, 2)
);

// Create .htaccess for React routing
const htaccess = `Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
`;

fs.writeFileSync(path.join(deployDir, 'public', '.htaccess'), htaccess);

// Create environment template
const envTemplate = `# cPanel Environment Variables
# Add these in your cPanel Node.js App settings

DATABASE_URL=postgresql://username:password@hostname:5432/database
PGUSER=your_db_user
PGPASSWORD=your_db_password
PGDATABASE=your_db_name
PGHOST=your_db_host
PGPORT=5432
SESSION_SECRET=your-secret-session-key
NODE_ENV=production
PORT=5000
`;

fs.writeFileSync(path.join(deployDir, '.env.example'), envTemplate);

// Create deployment instructions
const instructions = `# Social Ads Expert - cPanel Deployment Instructions

## Prerequisites
- cPanel hosting with Node.js support (version 18+)
- PostgreSQL database access

## Deployment Steps

1. **Upload Files**
   - Create a ZIP file of all contents in this folder
   - Upload and extract to your cPanel Node.js app directory

2. **Configure Node.js App in cPanel**
   - Go to "Setup Node.js App" in cPanel
   - Create new application:
     - Node.js version: 18+ 
     - Application mode: Production
     - Application root: /path/to/your/app
     - Application URL: your domain or subdomain
     - Startup file: index.js

3. **Install Dependencies**
   - In Node.js app settings, click "Run NPM Install"
   - Wait for installation to complete

4. **Set Environment Variables**
   - In Node.js app settings, add these environment variables:
     - DATABASE_URL: Your PostgreSQL connection string
     - PGUSER: Database username
     - PGPASSWORD: Database password  
     - PGDATABASE: Database name
     - PGHOST: Database host
     - PGPORT: Database port (usually 5432)
     - SESSION_SECRET: Random secret key
     - NODE_ENV: production
     - PORT: 5000 (or your assigned port)

5. **Database Setup**
   - Make sure your PostgreSQL database is created
   - The app will automatically create tables on first run

6. **Start Application**
   - Click "Start" button in Node.js app settings
   - Your app should now be running!

## File Structure
- index.js: Main server file
- public/: React frontend files
- public/.htaccess: React routing configuration

## Troubleshooting
- Check Node.js app logs in cPanel for errors
- Ensure all environment variables are set correctly
- Verify database connection details
- Make sure Node.js version is 18 or higher

## Support
If you encounter issues, check:
1. Node.js app logs in cPanel
2. Database connection settings
3. Environment variables configuration
`;

fs.writeFileSync(path.join(deployDir, 'README.md'), instructions);

console.log('✅ cPanel deployment package created in:', deployDir);
console.log('📋 Next steps:');
console.log('1. ZIP the contents of cpanel-deploy folder');
console.log('2. Upload to your cPanel hosting');
console.log('3. Follow README.md instructions');