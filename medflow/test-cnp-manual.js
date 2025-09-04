/**
 * Manual CNP Testing Script
 * Run this to test CNP validation manually
 */

import { 
  validateCNP, 
  extractBirthDateFromCNP, 
  extractGenderFromCNP,
  analyzeCNP 
} from './src/utils/cnpValidation.ts';

console.log('🧪 Manual CNP Testing\n');

// Test cases
const testCases = [
  { cnp: '1900101000000', expected: '1900-01-01, male' },
  { cnp: '2850515000000', expected: '1985-05-15, female' },
  { cnp: '6080904000000', expected: '2008-09-04, female' },
  { cnp: '5060517000000', expected: '2006-05-17, male' },
  { cnp: '9999999999999', expected: 'invalid' },
  { cnp: '123', expected: 'invalid' }
];

testCases.forEach(({ cnp, expected }, index) => {
  console.log(`Test ${index + 1}: ${cnp}`);
  
  try {
    const validation = validateCNP(cnp);
    console.log(`  Validation: ${validation.isValid ? '✅ Valid' : '❌ Invalid'}`);
    
    if (validation.isValid) {
      const birthDate = extractBirthDateFromCNP(cnp);
      const gender = extractGenderFromCNP(cnp);
      console.log(`  Birth Date: ${birthDate?.toLocaleDateString() || 'null'}`);
      console.log(`  Gender: ${gender || 'null'}`);
    }
    
    const analysis = analyzeCNP(cnp);
    console.log(`  Analysis: ${analysis.isValid ? 'Valid' : 'Invalid'}`);
    if (analysis.error) {
      console.log(`  Error: ${analysis.error}`);
    }
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
  
  console.log('');
});

console.log('✅ Manual CNP testing complete!');
