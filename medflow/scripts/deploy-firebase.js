#!/usr/bin/env node

/**
 * 🏥 MedFlow - Firebase Deployment Script
 * 
 * Comprehensive deployment script with validation and error handling
 * Ensures reliable Firebase hosting deployments
 */

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

const DEPLOYMENT_STEPS = [
  { name: 'Environment Validation', command: 'npm run validate:env' },
  { name: 'Build Process', command: 'npm run build:clean' },
  { name: 'Build Validation', command: 'npm run validate:build' },
  { name: 'Firebase Validation', command: 'npm run validate:firebase' },
  { name: 'Firebase Deployment', command: 'firebase deploy --only hosting' }
];

function logStep(step, status, message = '') {
  const icon = status === 'start' ? '🚀' : status === 'success' ? '✅' : '❌';
  const statusText = status === 'start' ? 'STARTING' : status === 'success' ? 'COMPLETED' : 'FAILED';
  console.log(`${icon} ${step}: ${statusText}${message ? ` - ${message}` : ''}`);
}

function cleanup() {
  console.log('\n🧹 Cleaning up...');
  
  // Clean up any temporary files
  const tempFiles = [
    '.firebase-deploy.log',
    'deployment-error.log'
  ];
  
  tempFiles.forEach(file => {
    const filePath = join(process.cwd(), file);
    if (existsSync(filePath)) {
      rmSync(filePath);
    }
  });
}

function deploy() {
  console.log('🏥 MedFlow Firebase Deployment');
  console.log('================================\n');
  
  const startTime = Date.now();
  let currentStep = 0;
  
  try {
    for (const step of DEPLOYMENT_STEPS) {
      currentStep++;
      logStep(step.name, 'start');
      
      try {
        execSync(step.command, { 
          stdio: 'inherit',
          cwd: process.cwd()
        });
        
        logStep(step.name, 'success');
        
        // Add small delay between steps
        if (currentStep < DEPLOYMENT_STEPS.length) {
          console.log('   ⏳ Waiting 2 seconds before next step...\n');
          setTimeout(() => {}, 2000);
        }
        
      } catch (error) {
        logStep(step.name, 'failed', error.message);
        console.error(`\n❌ Deployment failed at step: ${step.name}`);
        console.error('   Please check the error above and try again');
        process.exit(1);
      }
    }
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n🎉 Deployment completed successfully!');
    console.log(`⏱️  Total time: ${duration} seconds`);
    console.log('\n🌐 Your MedFlow app is now live at:');
    console.log('   https://med-schedule-1.web.app');
    console.log('\n📊 Firebase Console:');
    console.log('   https://console.firebase.google.com/project/med-schedule-1/hosting');
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  } finally {
    cleanup();
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Deployment interrupted by user');
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n⚠️  Deployment terminated');
  cleanup();
  process.exit(0);
});

// Run deployment
deploy();
