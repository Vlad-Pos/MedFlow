#!/usr/bin/env node

/**
 * 🏥 MedFlow - Firebase Validation Script
 * 
 * Validates Firebase configuration and connectivity before deployment
 * Ensures Firebase services are accessible and properly configured
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

function validateFirebase() {
  console.log('🔍 Validating Firebase configuration...');
  
  try {
    // Check if Firebase CLI is installed
    const firebaseVersion = execSync('firebase --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Firebase CLI version: ${firebaseVersion}`);
  } catch (error) {
    console.error('❌ Firebase CLI not found!');
    console.error('   Please install Firebase CLI: npm install -g firebase-tools');
    process.exit(1);
  }
  
  try {
    // Check if user is logged in
    const userInfo = execSync('firebase login:list', { encoding: 'utf8' });
    if (userInfo.includes('No authorized users')) {
      console.error('❌ Not logged into Firebase!');
      console.error('   Please run: firebase login');
      process.exit(1);
    }
    console.log('✅ Firebase authentication verified');
  } catch (error) {
    console.error('❌ Firebase authentication check failed:', error.message);
    process.exit(1);
  }
  
  try {
    // Check current project
    const projectInfo = execSync('firebase projects:list', { encoding: 'utf8' });
    const currentProject = projectInfo.match(/med-schedule-1\s+\(current\)/);
    
    if (!currentProject) {
      console.error('❌ Not in correct Firebase project!');
      console.error('   Current project should be: med-schedule-1');
      console.error('   Please run: firebase use med-schedule-1');
      process.exit(1);
    }
    console.log('✅ Firebase project verified: med-schedule-1');
  } catch (error) {
    console.error('❌ Firebase project check failed:', error.message);
    process.exit(1);
  }
  
  // Validate firebase.json configuration
  const firebaseConfigPath = join(process.cwd(), 'firebase.json');
  if (!existsSync(firebaseConfigPath)) {
    console.error('❌ firebase.json not found!');
    process.exit(1);
  }
  
  try {
    const firebaseConfig = JSON.parse(readFileSync(firebaseConfigPath, 'utf8'));
    
    // Check hosting configuration
    if (!firebaseConfig.hosting) {
      console.error('❌ Firebase hosting configuration missing!');
      process.exit(1);
    }
    
    if (firebaseConfig.hosting.public !== 'dist') {
      console.error('❌ Firebase hosting public directory should be "dist"');
      process.exit(1);
    }
    
    // Check rewrites configuration
    const hasRewrites = firebaseConfig.hosting.rewrites && 
                       firebaseConfig.hosting.rewrites.length > 0;
    
    if (!hasRewrites) {
      console.error('❌ Firebase hosting rewrites configuration missing!');
      process.exit(1);
    }
    
    console.log('✅ Firebase configuration validated');
  } catch (error) {
    console.error('❌ Firebase configuration validation failed:', error.message);
    process.exit(1);
  }
  
  // Check hosting sites
  try {
    const hostingSites = execSync('firebase hosting:sites:list', { encoding: 'utf8' });
    if (!hostingSites.includes('med-schedule-1')) {
      console.error('❌ Hosting site "med-schedule-1" not found!');
      process.exit(1);
    }
    console.log('✅ Firebase hosting site verified');
  } catch (error) {
    console.error('❌ Firebase hosting sites check failed:', error.message);
    process.exit(1);
  }
  
  console.log('\n🎯 Firebase validation passed! Ready for deployment.');
}

// Run validation
try {
  validateFirebase();
} catch (error) {
  console.error('❌ Firebase validation failed:', error.message);
  process.exit(1);
}
