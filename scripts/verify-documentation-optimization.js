#!/usr/bin/env node

/**
 * 🔍 Documentation Optimization Verification Script
 * 
 * This script verifies that the documentation optimization plan
 * was implemented with maximum precision across all .md files.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CORE_DIR = './CORE';
const MD_FILES = [
  './README.md',
  './MAIN_GUIDE.md',
  './QUICK_REFERENCE.md',
  './WELCOME_AI_AGENTS.md',
  './BRAND_IDENTITY.md',
  './DEVELOPMENT_GUIDE.md',
  './CORE/BRAND_CORE.md',
  './CORE/TECHNICAL_CORE.md',
  './CORE/PLATFORM_CORE.md'
];

// Test patterns for redundancy detection
const REDUNDANCY_PATTERNS = {
  sacredColors: [
    '#8A7A9F',
    '#000000', 
    '#100B1A',
    '#7A48BF',
    '#804AC8',
    '#25153A',
    '#FFFFFF',
    '#CCCCCC',
    '#231A2F',
    '#BFBFBF',
    '#A6A6A6',
    '#737373'
  ],
  targetAudience: [
    'Middle-aged doctors (35-65 years old)',
    '5+ years in medical practice',
    'Romanian healthcare professionals'
  ],
  performanceStandards: [
    'Bundle size < 2.5 MB',
    'Load time < 2 seconds',
    'Code splitting > 30 chunks',
    'Build time < 10 seconds'
  ],
  technologyStack: [
    'React 19',
    'TypeScript',
    'Firebase',
    'Tailwind CSS'
  ]
};

// Expected references to core files
const EXPECTED_CORE_REFERENCES = {
  './CORE/BRAND_CORE.md': ['brand', 'colors', 'voice', 'tone'],
  './CORE/TECHNICAL_CORE.md': ['technical', 'architecture', 'performance', 'standards'],
  './CORE/PLATFORM_CORE.md': ['platform', 'mission', 'vision', 'target audience']
};

function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  const emoji = type === 'ERROR' ? '❌' : type === 'SUCCESS' ? '✅' : type === 'WARNING' ? '⚠️' : 'ℹ️';
  console.log(`${emoji} [${timestamp}] ${type}: ${message}`);
}

function checkFileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    log(`Error checking file ${filePath}: ${error.message}`, 'ERROR');
    return false;
  }
}

function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    log(`Error reading file ${filePath}: ${error.message}`, 'ERROR');
    return '';
  }
}

function checkRedundancy(content, filePath) {
  const issues = [];
  
  // For CORE files, allow more repetition as they are the source of truth
  const isCoreFile = filePath.includes('/CORE/');
  const maxAllowedRepetitions = isCoreFile ? 3 : 2;
  
  // Check for sacred colors repetition (these should be minimal)
  REDUNDANCY_PATTERNS.sacredColors.forEach(color => {
    const matches = (content.match(new RegExp(color, 'g')) || []).length;
    if (matches > 1) {
      issues.push(`Sacred color ${color} appears ${matches} times`);
    }
  });
  
  // Check for target audience repetition (allow contextually different usage)
  REDUNDANCY_PATTERNS.targetAudience.forEach(phrase => {
    const matches = (content.match(new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    if (matches > maxAllowedRepetitions) {
      issues.push(`Target audience phrase "${phrase}" appears ${matches} times`);
    }
  });
  
  // Check for performance standards repetition (allow contextually different usage)
  REDUNDANCY_PATTERNS.performanceStandards.forEach(standard => {
    const matches = (content.match(new RegExp(standard.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    if (matches > maxAllowedRepetitions) {
      issues.push(`Performance standard "${standard}" appears ${matches} times`);
    }
  });
  
  // Check for technology stack repetition (allow contextually different usage)
  REDUNDANCY_PATTERNS.technologyStack.forEach(tech => {
    const matches = (content.match(new RegExp(tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    if (matches > maxAllowedRepetitions) {
      issues.push(`Technology "${tech}" appears ${matches} times`);
    }
  });
  
  return issues;
}

function checkCoreReferences(content, filePath) {
  const issues = [];
  
  // Skip core files from cross-reference checks
  if (filePath.includes('/CORE/')) {
    return issues;
  }
  
  Object.entries(EXPECTED_CORE_REFERENCES).forEach(([coreFile, keywords]) => {
    const hasReference = content.includes(coreFile);
    if (!hasReference) {
      issues.push(`Missing reference to ${coreFile}`);
    }
    
    // Check if content has relevant keywords that should be in core files
    keywords.forEach(keyword => {
      const keywordMatches = (content.match(new RegExp(keyword, 'gi')) || []).length;
      if (keywordMatches > 0 && !hasReference) {
        issues.push(`Content contains "${keyword}" but doesn't reference ${coreFile}`);
      }
    });
  });
  
  return issues;
}

function verifyCoreFiles() {
  log('Verifying CORE directory structure...', 'INFO');
  
  if (!checkFileExists(CORE_DIR)) {
    log('CORE directory does not exist', 'ERROR');
    return false;
  }
  
  const coreFiles = ['BRAND_CORE.md', 'TECHNICAL_CORE.md', 'PLATFORM_CORE.md'];
  let allExist = true;
  
  coreFiles.forEach(file => {
    const filePath = path.join(CORE_DIR, file);
    if (checkFileExists(filePath)) {
      log(`✓ ${file} exists`, 'SUCCESS');
    } else {
      log(`✗ ${file} missing`, 'ERROR');
      allExist = false;
    }
  });
  
  return allExist;
}

function verifyFileOptimization(filePath) {
  log(`Verifying optimization of ${filePath}...`, 'INFO');
  
  if (!checkFileExists(filePath)) {
    log(`File ${filePath} does not exist`, 'ERROR');
    return { optimized: false, issues: ['File not found'] };
  }
  
  const content = readFileContent(filePath);
  const redundancyIssues = checkRedundancy(content, filePath);
  const coreReferenceIssues = checkCoreReferences(content, filePath);
  
  const allIssues = [...redundancyIssues, ...coreReferenceIssues];
  const isOptimized = allIssues.length === 0;
  
  if (isOptimized) {
    log(`✓ ${filePath} is properly optimized`, 'SUCCESS');
  } else {
    log(`⚠ ${filePath} has optimization issues:`, 'WARNING');
    allIssues.forEach(issue => log(`  - ${issue}`, 'WARNING'));
  }
  
  return { optimized: isOptimized, issues: allIssues };
}

function main() {
  log('Starting documentation optimization verification...', 'INFO');
  log('================================================', 'INFO');
  
  // Verify CORE directory structure
  const coreStructureValid = verifyCoreFiles();
  if (!coreStructureValid) {
    log('CORE directory verification failed. Stopping verification.', 'ERROR');
    process.exit(1);
  }
  
  log('', 'INFO');
  log('Verifying individual file optimization...', 'INFO');
  log('==========================================', 'INFO');
  
  let totalIssues = 0;
  let optimizedFiles = 0;
  
  MD_FILES.forEach(filePath => {
    const result = verifyFileOptimization(filePath);
    if (result.optimized) {
      optimizedFiles++;
    } else {
      totalIssues += result.issues.length;
    }
    log('', 'INFO');
  });
  
  // Summary
  log('==========================================', 'INFO');
  log('VERIFICATION SUMMARY:', 'INFO');
  log(`✓ Optimized files: ${optimizedFiles}/${MD_FILES.length}`, 'INFO');
  log(`⚠ Total issues found: ${totalIssues}`, 'INFO');
  
  if (totalIssues === 0) {
    log('🎉 All files are properly optimized!', 'SUCCESS');
    log('✅ Documentation optimization plan implemented with maximum precision', 'SUCCESS');
  } else {
    log('⚠️  Some optimization issues remain. Review the warnings above.', 'WARNING');
  }
  
  log('==========================================', 'INFO');
}

// Run verification
if (require.main === module) {
  main();
}

module.exports = {
  verifyFileOptimization,
  checkRedundancy,
  checkCoreReferences,
  verifyCoreFiles
};
