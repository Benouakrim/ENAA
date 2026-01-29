#!/usr/bin/env node

console.log('🔧 Starting build process...');

// Generate Prisma Client
console.log('📦 Generating Prisma Client...');
const { execSync } = require('child_process');

try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client generated successfully');
} catch (error) {
  console.warn('⚠️ Prisma generation failed, continuing with build...');
  console.warn(error.message);
}

// Run Next.js build
console.log('🏗️ Building Next.js application...');
try {
  execSync('next build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed');
  process.exit(1);
}