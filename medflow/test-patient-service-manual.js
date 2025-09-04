/**
 * Manual Patient Service Testing
 * Test patient CRUD operations manually
 */

import { patientService } from './src/services/patientService.ts';

console.log('🧪 Manual Patient Service Testing\n');

async function testPatientService() {
  try {
    // Test 1: Create a new patient
    console.log('Test 1: Creating a new patient...');
    const newPatient = {
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
        cnp: '1900101000000'
      },
      contactInfo: {
        email: 'john.doe@example.com',
        phone: '+40123456789'
      }
    };
    
    const createdPatient = await patientService.createPatient(newPatient);
    console.log('✅ Patient created:', createdPatient?.id);
    
    // Test 2: Retrieve the patient
    console.log('\nTest 2: Retrieving patient...');
    const retrievedPatient = await patientService.getPatient(createdPatient.id);
    console.log('✅ Patient retrieved:', retrievedPatient?.personalInfo?.fullName);
    
    // Test 3: Search patients
    console.log('\nTest 3: Searching patients...');
    const searchResults = await patientService.searchPatients({
      query: 'John',
      filters: { isActive: true },
      limit: 10
    });
    console.log('✅ Search results:', searchResults.patients.length, 'patients found');
    
    // Test 4: Update patient
    console.log('\nTest 4: Updating patient...');
    const updateData = {
      personalInfo: {
        firstName: 'Jane'
      }
    };
    const updatedPatient = await patientService.updatePatient(createdPatient.id, updateData);
    console.log('✅ Patient updated:', updatedPatient?.personalInfo?.fullName);
    
    // Test 5: Get patient statistics
    console.log('\nTest 5: Getting patient statistics...');
    const stats = await patientService.getPatientStatistics();
    console.log('✅ Statistics:', stats.totalPatients, 'total patients');
    
    console.log('\n🎉 All patient service tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
testPatientService();
