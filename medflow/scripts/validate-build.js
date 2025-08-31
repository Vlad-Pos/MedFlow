#!/usr/bin/env node

/**
 * 🏥 MedFlow - Build Validation Script
 * 
 * Validates build output before Firebase deployment
 * Ensures all assets are properly generated and accessible
 */

import { readdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';

const REQUIRED_ASSETS = [
  'index.html',
  'assets/index-*.js',
  'assets/index-*.css',
  'assets/react-core-*.js',
  'assets/react-router-*.js',
  'assets/firebase-core-*.js'
];

const MIN_BUILD_SIZE = 1000; // Minimum file size in bytes

function validateBuild() {
  console.log('🔍 Validating MedFlow build output...');
  
  const distPath = join(process.cwd(), 'dist');
  
  // Check if dist directory exists
  if (!existsSync(distPath)) {
    console.error('❌ dist directory not found!');
    console.error('   Please run npm run build first');
    process.exit(1);
  }
  
  // Check if dist directory is not empty
  const distContents = readdirSync(distPath);
  if (distContents.length === 0) {
    console.error('❌ dist directory is empty!');
    console.error('   Build may have failed');
    process.exit(1);
  }
  
  console.log(`✅ dist directory contains ${distContents.length} items`);
  
  // Validate required files
  const missingFiles = [];
  const assetsPath = join(distPath, 'assets');
  
  if (!existsSync(assetsPath)) {
    console.error('❌ assets directory not found!');
    process.exit(1);
  }
  
  const assetsContents = readdirSync(assetsPath);
  console.log(`✅ assets directory contains ${assetsContents.length} files`);
  
  // Check for critical files
  const criticalFiles = [
    'index.html',
    'medflow-logo.svg'
  ];
  
  criticalFiles.forEach(file => {
    const filePath = join(distPath, file);
    if (!existsSync(filePath)) {
      missingFiles.push(file);
    } else {
      const stats = statSync(filePath);
      if (stats.size < MIN_BUILD_SIZE) {
        console.warn(`⚠️  ${file} is suspiciously small (${stats.size} bytes)`);
      }
    }
  });
  
  // Check for JavaScript bundles
  const jsFiles = assetsContents.filter(file => file.endsWith('.js'));
  const cssFiles = assetsContents.filter(file => file.endsWith('.css'));
  
  if (jsFiles.length === 0) {
    console.error('❌ No JavaScript files found in assets!');
    process.exit(1);
  }
  
  if (cssFiles.length === 0) {
    console.error('❌ No CSS files found in assets!');
    process.exit(1);
  }
  
  console.log(`✅ Found ${jsFiles.length} JavaScript files and ${cssFiles.length} CSS files`);
  
  // Check for main entry point
  const mainJsFile = jsFiles.find(file => file.startsWith('index-'));
  if (!mainJsFile) {
    console.error('❌ Main JavaScript entry point not found!');
    process.exit(1);
  }
  
  console.log(`✅ Main JavaScript entry point: ${mainJsFile}`);
  
  // Validate file sizes
  let totalSize = 0;
  let largeFiles = [];
  
  assetsContents.forEach(file => {
    const filePath = join(assetsPath, file);
    const stats = statSync(filePath);
    totalSize += stats.size;
    
    if (stats.size > 500000) { // Files larger than 500KB
      largeFiles.push({ name: file, size: stats.size });
    }
  });
  
  console.log(`✅ Total assets size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  
  if (largeFiles.length > 0) {
    console.log('📋 Large files detected:');
    largeFiles.forEach(file => {
      console.log(`   - ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    });
  }
  
  // Check for missing files
  if (missingFiles.length > 0) {
    console.error('❌ Missing critical files:');
    missingFiles.forEach(file => console.error(`   - ${file}`));
    process.exit(1);
  }
  
  console.log('\n🎯 Build validation passed! Ready for Firebase deployment.');
}

// Run validation
try {
  validateBuild();
} catch (error) {
  console.error('❌ Build validation failed:', error.message);
  process.exit(1);
}
