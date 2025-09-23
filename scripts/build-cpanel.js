#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🏗️  Building for cPanel hosting...');

try {
  // Build frontend
  console.log('Building frontend...');
  execSync('vite build', { stdio: 'inherit' });
  
  // Build backend with cPanel compatible database and production defines
  console.log('Building backend for cPanel...');
  execSync([
    'esbuild server/index-cpanel.ts',
    '--platform=node',
    '--packages=external',
    '--bundle',
    '--format=esm',
    '--outfile=dist/index.js',
    '--define:process.env.NODE_ENV=\\"production\\"',
    '--external:server/vite.ts',
    '--external:vite',
    '--external:@replit/vite-plugin-*'
  ].join(' '), { stdio: 'inherit' });
  
  console.log('✅ cPanel build complete!');
  
  // Now package for deployment
  console.log('📦 Creating cPanel deployment package...');
  
  const deployDir = path.join(__dirname, '..', 'cpanel-deploy');
  
  // Clean and create deploy directory
  if (fs.existsSync(deployDir)) {
    fs.rmSync(deployDir, { recursive: true, force: true });
  }
  fs.mkdirSync(deployDir, { recursive: true });

  // Copy dist folder contents
  const distPath = path.join(__dirname, '..', 'dist');
  fs.cpSync(distPath, deployDir, { recursive: true });

  // Create production package.json for cPanel with postgres driver
  const productionPackage = {
    "name": "social-ads-expert",
    "version": "1.0.0",
    "type": "module",
    "main": "index.js",
    "scripts": {
      "start": "node index.js"
    },
    "dependencies": {
      "postgres": "^3.4.5",
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

  // Create environment template for cPanel
  const envTemplate = `# cPanel Environment Variables for Social Ads Expert
# Add these in your cPanel Node.js App settings

# Database Configuration (Use your cPanel PostgreSQL details)
DATABASE_URL=postgresql://beautyzo_ads:your_password@jupiter.hostseba.com:5432/beautyzo_desh
PGUSER=beautyzo_ads
PGPASSWORD=your_actual_password
PGDATABASE=beautyzo_desh
PGHOST=jupiter.hostseba.com
PGPORT=5432

# Session Configuration
SESSION_SECRET=your-secure-32-character-random-string

# Application Configuration
NODE_ENV=production
PORT=5000
`;

  fs.writeFileSync(path.join(deployDir, '.env.example'), envTemplate);

  // Create cPanel deployment instructions
  const instructions = `# Social Ads Expert - cPanel Deployment Instructions

## ✅ Fixed Issues
- ✅ Replaced Neon driver with cPanel-compatible PostgreSQL driver
- ✅ Fixed database host (jupiter.hostseba.com instead of localhost)
- ✅ Removed development dependencies from production bundle

## 📋 Deployment Steps

### 1. Environment Variables
Set these in cPanel Node.js App settings:

\`\`\`
DATABASE_URL=postgresql://beautyzo_ads:your_password@jupiter.hostseba.com:5432/beautyzo_desh
PGUSER=beautyzo_ads
PGPASSWORD=your_actual_password
PGDATABASE=beautyzo_desh
PGHOST=jupiter.hostseba.com
PGPORT=5432
SESSION_SECRET=your-secure-32-character-random-string
NODE_ENV=production
PORT=5000
\`\`\`

### 2. Upload Files
- ZIP all contents of this folder
- Upload to your cPanel Node.js app directory
- Extract files

### 3. Install Dependencies
- In Node.js app settings, click "Run NPM Install"
- Wait for installation to complete

### 4. Start Application
- Click "Start" button
- Check logs for any errors
- Your app should now work without 503 errors!

## 🔧 Key Changes Made
1. **Database Driver**: Changed from @neondatabase/serverless to postgres
2. **Connection**: Updated to use jupiter.hostseba.com host
3. **SSL**: Configured for cPanel SSL requirements
4. **Dependencies**: Removed all development dependencies

## 📞 Support
If you still get errors, check:
1. Database credentials are correct
2. Database "beautyzo_desh" exists in cPanel
3. User "beautyzo_ads" has access to the database
4. All environment variables are set properly
`;

  fs.writeFileSync(path.join(deployDir, 'README.md'), instructions);

  console.log('✅ cPanel deployment package created in:', deployDir);
  console.log('📋 Next steps:');
  console.log('1. Update environment variables with correct database info');
  console.log('2. ZIP the contents of cpanel-deploy folder');
  console.log('3. Upload to your cPanel hosting');
  console.log('4. Follow README.md instructions');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}