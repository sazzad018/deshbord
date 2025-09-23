#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🏗️  Building for production with proper defines...');

try {
  // Build frontend
  console.log('Building frontend...');
  execSync('vite build', { stdio: 'inherit' });
  
  // Build backend with production defines
  console.log('Building backend...');
  execSync([
    'esbuild server/index.ts',
    '--platform=node',
    '--packages=external',
    '--bundle',
    '--format=esm',
    '--outdir=dist',
    '--define:process.env.NODE_ENV=\\"production\\"',
    '--external:server/vite.ts',
    '--external:vite',
    '--external:@replit/vite-plugin-*'
  ].join(' '), { stdio: 'inherit' });
  
  console.log('✅ Production build complete!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}