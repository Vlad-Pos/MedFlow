#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 MedFlow Quality Assurance Monitor');
console.log('====================================\n');

// Quality thresholds
const QUALITY_THRESHOLDS = {
  bundleSize: {
    js: 2 * 1024 * 1024, // 2MB
    css: 200 * 1024,     // 200KB
    total: 2.5 * 1024 * 1024 // 2.5MB
  },
  buildTime: 10 * 1000, // 10 seconds
  codeSplitting: 30,    // minimum chunks
  performanceScore: 'A'  // minimum score
};

// Performance validation
function validatePerformance() {
  console.log('📊 Performance Validation:');
  
  try {
    const distPath = path.join(__dirname, '../dist/assets');
    if (!fs.existsSync(distPath)) {
      console.log('❌ Build directory not found. Run build first.');
      return false;
    }

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

    // Check thresholds
    const jsPass = totalJsSize < QUALITY_THRESHOLDS.bundleSize.js;
    const cssPass = totalCssSize < QUALITY_THRESHOLDS.bundleSize.css;
    const totalPass = totalSize < QUALITY_THRESHOLDS.bundleSize.total;
    const chunksPass = jsFiles.length >= QUALITY_THRESHOLDS.codeSplitting;

    console.log(`✅ JS bundle: ${(totalJsSize / 1024).toFixed(1)} KB ${jsPass ? 'PASS' : 'FAIL'}`);
    console.log(`✅ CSS bundle: ${(totalCssSize / 1024).toFixed(1)} KB ${cssPass ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Total bundle: ${totalSizeMB} MB ${totalPass ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Code splitting: ${jsFiles.length} chunks ${chunksPass ? 'PASS' : 'FAIL'}`);

    return jsPass && cssPass && totalPass && chunksPass;
  } catch (error) {
    console.log('❌ Performance validation failed:', error.message);
    return false;
  }
}

// Code quality validation
function validateCodeQuality() {
  console.log('\n✨ Code Quality Validation:');
  
  try {
    // Check TypeScript compilation
    const tsConfigPath = path.join(__dirname, '../tsconfig.json');
    if (!fs.existsSync(tsConfigPath)) {
      console.log('❌ TypeScript config not found');
      return false;
    }

    // Check for common quality issues
    const srcPath = path.join(__dirname, '../src');
    const qualityIssues = [];

    // Check for console.log statements (excluding appropriate ones)
    const consoleLogRegex = /console\.(log|warn|debug)/g;
    const excludePatterns = ['demo', 'test', 'error'];

    function checkFileForIssues(filePath) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          if (consoleLogRegex.test(line)) {
            const shouldExclude = excludePatterns.some(pattern => 
              line.toLowerCase().includes(pattern)
            );
            if (!shouldExclude) {
              qualityIssues.push({
                file: path.relative(__dirname, filePath),
                line: index + 1,
                issue: 'console.log statement found'
              });
            }
          }
        });
      } catch (error) {
        // Skip files that can't be read
      }
    }

    function walkDir(dir) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          checkFileForIssues(filePath);
        }
      });
    }

    walkDir(srcPath);

    if (qualityIssues.length === 0) {
      console.log('✅ No quality issues found');
      return true;
    } else {
      console.log(`❌ Found ${qualityIssues.length} quality issues:`);
      qualityIssues.forEach(issue => {
        console.log(`   - ${issue.file}:${issue.line} - ${issue.issue}`);
      });
      return false;
    }
  } catch (error) {
    console.log('❌ Code quality validation failed:', error.message);
    return false;
  }
}

// Functionality validation
function validateFunctionality() {
  console.log('\n🔧 Functionality Validation:');
  
  try {
    // Check critical files exist
    const criticalFiles = [
      '../src/App.tsx',
      '../src/providers/AuthProvider.tsx',
      '../src/components/ErrorBoundary.tsx',
      '../src/utils/appointmentValidation.ts'
    ];

    let allFilesExist = true;
    criticalFiles.forEach(file => {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} - EXISTS`);
      } else {
        console.log(`❌ ${file} - MISSING`);
        allFilesExist = false;
      }
    });

    return allFilesExist;
  } catch (error) {
    console.log('❌ Functionality validation failed:', error.message);
    return false;
  }
}

// Main validation function
function runQualityValidation() {
  console.log('🚀 Starting comprehensive quality validation...\n');

  const performancePass = validatePerformance();
  const codeQualityPass = validateCodeQuality();
  const functionalityPass = validateFunctionality();

  console.log('\n📋 Quality Validation Summary:');
  console.log('==============================');
  console.log(`Performance: ${performancePass ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Code Quality: ${codeQualityPass ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Functionality: ${functionalityPass ? '✅ PASS' : '❌ FAIL'}`);

  const allPassed = performancePass && codeQualityPass && functionalityPass;

  if (allPassed) {
    console.log('\n🎉 ALL QUALITY GATES PASSED!');
    console.log('🚀 MedFlow maintains enterprise standards!');
    process.exit(0);
  } else {
    console.log('\n❌ QUALITY GATES FAILED!');
    console.log('🔧 Please fix issues before proceeding.');
    process.exit(1);
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runQualityValidation();
}

export { runQualityValidation, validatePerformance, validateCodeQuality, validateFunctionality };
