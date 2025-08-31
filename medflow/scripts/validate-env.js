#!/usr/bin/env node

/**
 * 🏥 MedFlow - Environment Validation Script
 * 
 * Validates all required Firebase environment variables before deployment
 * Prevents deployment failures due to missing configuration
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const REQUIRED_ENV_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const OPTIONAL_ENV_VARS = [
  'VITE_DEMO_MODE',
  'VITE_PERFORMANCE_MONITORING',
  'VITE_ANALYTICS_ENABLED',
  'VITE_ENVIRONMENT'
];

function validateEnvironment() {
  console.log('🔍 Validating MedFlow environment configuration...');
  
  // Check if .env.local exists
  const envPath = join(process.cwd(), '.env.local');
  if (!existsSync(envPath)) {
    console.error('❌ .env.local file not found!');
    console.error('   Please create .env.local with required Firebase configuration');
    process.exit(1);
  }
  
  // Read and parse .env.local
  const envContent = readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  // Validate required variables
  const missingVars = [];
  const emptyVars = [];
  
  REQUIRED_ENV_VARS.forEach(varName => {
    if (!envVars[varName]) {
      missingVars.push(varName);
    } else if (envVars[varName] === 'YOUR_API_KEY' || envVars[varName] === 'YOUR_AUTH_DOMAIN') {
      emptyVars.push(varName);
    }
  });
  
  // Report validation results
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    process.exit(1);
  }
  
  if (emptyVars.length > 0) {
    console.error('❌ Environment variables contain placeholder values:');
    emptyVars.forEach(varName => console.error(`   - ${varName}`));
    process.exit(1);
  }
  
  // Check optional variables
  const optionalStatus = OPTIONAL_ENV_VARS.map(varName => {
    const value = envVars[varName];
    if (value) {
      return `✅ ${varName}: ${value}`;
    } else {
      return `⚠️  ${varName}: not set (optional)`;
    }
  });
  
  console.log('✅ All required environment variables are configured:');
  REQUIRED_ENV_VARS.forEach(varName => {
    const value = envVars[varName];
    const maskedValue = varName.includes('API_KEY') || varName.includes('APP_ID') 
      ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
      : value;
    console.log(`   - ${varName}: ${maskedValue}`);
  });
  
  if (optionalStatus.length > 0) {
    console.log('\n📋 Optional environment variables:');
    optionalStatus.forEach(status => console.log(`   ${status}`));
  }
  
  console.log('\n🎯 Environment validation passed! Ready for deployment.');
}

// Run validation
try {
  validateEnvironment();
} catch (error) {
  console.error('❌ Environment validation failed:', error.message);
  process.exit(1);
}
