/**
 * Firebase Rules Validation Script
 * 
 * Validates that Firebase security rules are properly configured
 * for the patient management system.
 * 
 * @author MedFlow Team
 * @version 2.0
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Firebase Security Rules...\n');

// Read the firestore.rules file
const rulesPath = path.join(__dirname, '..', 'firestore.rules');
let rulesContent = '';

try {
  rulesContent = fs.readFileSync(rulesPath, 'utf8');
  console.log('✅ Successfully read firestore.rules file');
} catch (error) {
  console.error('❌ Failed to read firestore.rules file:', error.message);
  process.exit(1);
}

// Validate required collections and rules
const requiredCollections = [
  'patients',
  'patientReports', 
  'medicalDocuments',
  'appointments'
];

const requiredRules = [
  'match /patients/{patientId}',
  'match /patientReports/{reportId}',
  'match /medicalDocuments/{documentId}',
  'match /appointments/{appointmentId}',
  'request.auth != null',
  'resource.data.doctorId == request.auth.uid'
];

console.log('\n📋 Validating Required Collections:');
let collectionsValid = true;

requiredCollections.forEach(collection => {
  if (rulesContent.includes(`/${collection}/`)) {
    console.log(`✅ Collection '${collection}' found in rules`);
  } else {
    console.log(`❌ Collection '${collection}' NOT found in rules`);
    collectionsValid = false;
  }
});

console.log('\n🔒 Validating Security Rules:');
let rulesValid = true;

requiredRules.forEach(rule => {
  if (rulesContent.includes(rule)) {
    console.log(`✅ Rule '${rule}' found`);
  } else {
    console.log(`❌ Rule '${rule}' NOT found`);
    rulesValid = false;
  }
});

// Check for common security patterns
console.log('\n🛡️ Validating Security Patterns:');

const securityPatterns = [
  { pattern: 'request.auth != null', description: 'Authentication required' },
  { pattern: 'request.auth.uid', description: 'User ID validation' },
  { pattern: 'resource.data.doctorId', description: 'Doctor ID field validation' },
  { pattern: 'allow read, write', description: 'Read/Write permissions' },
  { pattern: 'allow create', description: 'Create permissions' },
  { pattern: 'allow update', description: 'Update permissions' },
  { pattern: 'allow delete', description: 'Delete permissions' }
];

securityPatterns.forEach(({ pattern, description }) => {
  if (rulesContent.includes(pattern)) {
    console.log(`✅ ${description}: Found '${pattern}'`);
  } else {
    console.log(`⚠️  ${description}: '${pattern}' not found`);
  }
});

// Check for potential security issues
console.log('\n🚨 Checking for Potential Security Issues:');

const securityIssues = [
  { pattern: 'allow read, write: if true', description: 'Overly permissive rule' },
  { pattern: 'allow *', description: 'Wildcard permissions' },
  { pattern: 'allow read, write: if false', description: 'Blocking all access' }
];

let hasSecurityIssues = false;
securityIssues.forEach(({ pattern, description }) => {
  if (rulesContent.includes(pattern)) {
    console.log(`❌ ${description}: Found '${pattern}'`);
    hasSecurityIssues = true;
  }
});

if (!hasSecurityIssues) {
  console.log('✅ No obvious security issues detected');
}

// Summary
console.log('\n📊 Validation Summary:');
console.log(`Collections Valid: ${collectionsValid ? '✅' : '❌'}`);
console.log(`Rules Valid: ${rulesValid ? '✅' : '❌'}`);
console.log(`Security Issues: ${hasSecurityIssues ? '❌' : '✅'}`);

if (collectionsValid && rulesValid && !hasSecurityIssues) {
  console.log('\n🎉 Firebase Rules Validation PASSED!');
  console.log('All required collections and security rules are properly configured.');
} else {
  console.log('\n⚠️  Firebase Rules Validation FAILED!');
  console.log('Please review and fix the issues above.');
  process.exit(1);
}

// Additional validation: Check rule structure
console.log('\n🔍 Rule Structure Analysis:');

const ruleLines = rulesContent.split('\n').filter(line => line.trim());
const matchStatements = ruleLines.filter(line => line.includes('match /'));
const allowStatements = ruleLines.filter(line => line.includes('allow'));

console.log(`Total rule lines: ${ruleLines.length}`);
console.log(`Match statements: ${matchStatements.length}`);
console.log(`Allow statements: ${allowStatements.length}`);

if (matchStatements.length >= 4 && allowStatements.length >= 4) {
  console.log('✅ Rule structure looks good');
} else {
  console.log('⚠️  Rule structure may need review');
}

console.log('\n✨ Firebase Rules Validation Complete!');
