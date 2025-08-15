#!/usr/bin/env node

/**
 * Performance Test Script for MedFlow
 * Tests critical performance metrics and validates optimization
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 MedFlow Performance Test Suite');
console.log('================================\n');

// Test 1: Bundle Size Analysis
console.log('📦 Bundle Size Analysis:');
const distPath = path.join(__dirname, '../dist/assets');
const jsFiles = fs.readdirSync(distPath).filter(file => file.endsWith('.js'));
const cssFiles = fs.readdirSync(distPath).filter(file => file.endsWith('.css'));

let totalJsSize = 0;
let totalCssSize = 0;

jsFiles.forEach(file => {
  const stats = fs.statSync(path.join(distPath, file));
  totalJsSize += stats.size;
});

cssFiles.forEach(file => {
  const stats = fs.statSync(path.join(distPath, file));
  totalCssSize += stats.size;
});

const totalSize = totalJsSize + totalCssSize;
const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

console.log(`✅ Total JS bundle size: ${(totalJsSize / 1024).toFixed(1)} KB`);
console.log(`✅ Total CSS bundle size: ${(totalCssSize / 1024).toFixed(1)} KB`);
console.log(`✅ Total bundle size: ${totalSizeMB} MB`);

// Performance thresholds
const jsThreshold = 2 * 1024 * 1024; // 2MB
const cssThreshold = 200 * 1024; // 200KB
const totalThreshold = 2.5 * 1024 * 1024; // 2.5MB

console.log('\n📊 Performance Validation:');
console.log(`✅ JS bundle under threshold: ${totalJsSize < jsThreshold ? 'PASS' : 'FAIL'} (${jsThreshold / (1024 * 1024)}MB)`);
console.log(`✅ CSS bundle under threshold: ${totalCssSize < cssThreshold ? 'PASS' : 'FAIL'} (${cssThreshold / 1024}KB)`);
console.log(`✅ Total bundle under threshold: ${totalSize < totalThreshold ? 'PASS' : 'FAIL'} (${totalThreshold / (1024 * 1024)}MB)`);

// Test 2: Code Splitting Validation
console.log('\n🔧 Code Splitting Analysis:');
const chunkCount = jsFiles.length;
console.log(`✅ Number of chunks: ${chunkCount}`);

// Check for large chunks (>100KB)
const largeChunks = jsFiles.filter(file => {
  const stats = fs.statSync(path.join(distPath, file));
  return stats.size > 100 * 1024;
});

console.log(`✅ Large chunks (>100KB): ${largeChunks.length}`);
largeChunks.forEach(chunk => {
  const stats = fs.statSync(path.join(distPath, chunk));
  console.log(`   - ${chunk}: ${(stats.size / 1024).toFixed(1)} KB`);
});

// Test 3: Asset Optimization
console.log('\n🎯 Asset Optimization:');
const svgFiles = fs.readdirSync(distPath).filter(file => file.endsWith('.svg'));
const imageFiles = fs.readdirSync(distPath).filter(file => /\.(png|jpg|jpeg|gif|webp)$/i.test(file));

console.log(`✅ SVG assets: ${svgFiles.length}`);
console.log(`✅ Image assets: ${imageFiles.length}`);

// Test 4: Build Performance
console.log('\n⚡ Build Performance:');
const buildStart = Date.now();

// Simulate build time check
setTimeout(() => {
  const buildTime = Date.now() - buildStart;
  console.log(`✅ Build time simulation: ${buildTime}ms`);
  
  // Final Results
  console.log('\n🎉 Performance Test Results:');
  console.log('============================');
  
  const allPassed = totalJsSize < jsThreshold && 
                    totalCssSize < cssThreshold && 
                    totalSize < totalThreshold &&
                    chunkCount > 5;
  
  if (allPassed) {
    console.log('✅ ALL PERFORMANCE TARGETS MET!');
    console.log('🚀 MedFlow is ready for production!');
  } else {
    console.log('❌ Some performance targets not met');
    console.log('🔧 Review optimization recommendations');
  }
  
  console.log(`\n📈 Performance Score: ${allPassed ? 'A+' : 'B'}`);
  console.log(`📊 Bundle Efficiency: ${((1 - totalSize / totalThreshold) * 100).toFixed(1)}%`);
  
}, 100);
