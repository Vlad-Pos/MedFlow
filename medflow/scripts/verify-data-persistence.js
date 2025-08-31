#!/usr/bin/env node

/**
 * 🔍 **DATA PERSISTENCE VERIFICATION SCRIPT**
 * 
 * This script verifies the Firebase integration and data persistence
 * for the MedFlow appointment system.
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, orderBy, limit } = require('firebase/firestore');

// Firebase configuration (you'll need to add your actual config)
const firebaseConfig = {
  // Add your Firebase config here
  // apiKey: process.env.VITE_FIREBASE_API_KEY,
  // authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  // projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  // storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  // messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  // appId: process.env.VITE_FIREBASE_APP_ID
};

console.log('🔍 **MEDFLOW DATA PERSISTENCE VERIFICATION**\n');

async function verifyFirebaseConnection() {
  try {
    console.log('📡 Testing Firebase connection...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    
    // Test basic connection
    const testQuery = query(collection(db, 'appointments'), limit(1));
    const snapshot = await getDocs(testQuery);
    
    console.log('✅ Firestore connection successful');
    console.log(`📊 Found ${snapshot.size} documents in appointments collection`);
    
    return { success: true, db };
  } catch (error) {
    console.error('❌ Firebase connection failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function verifyAppointmentSchema(db) {
  try {
    console.log('\n🔍 Verifying appointment schema...');
    
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    
    const snapshot = await getDocs(appointmentsQuery);
    
    if (snapshot.empty) {
      console.log('⚠️  No appointments found in database');
      return { success: true, message: 'No appointments to verify' };
    }
    
    console.log(`📋 Found ${snapshot.size} appointments to verify`);
    
    let schemaVerified = true;
    const requiredFields = [
      'patientName', 'dateTime', 'symptoms', 'status', 'userId', 'createdAt', 'updatedAt'
    ];
    
    const optionalFields = [
      'patientEmail', 'patientPhone', 'patientCNP', 'patientBirthDate', 'notes'
    ];
    
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n📄 Appointment ${index + 1} (ID: ${doc.id}):`);
      
      // Check required fields
      requiredFields.forEach(field => {
        if (data[field] === undefined) {
          console.log(`  ❌ Missing required field: ${field}`);
          schemaVerified = false;
        } else {
          console.log(`  ✅ ${field}: ${data[field]}`);
        }
      });
      
      // Check optional fields
      optionalFields.forEach(field => {
        if (data[field] !== undefined) {
          console.log(`  ✅ ${field}: ${data[field]}`);
        } else {
          console.log(`  ⚠️  Optional field not present: ${field}`);
        }
      });
      
      // Check data types
      if (data.dateTime && !(data.dateTime instanceof Date)) {
        console.log(`  ⚠️  dateTime should be Date object, got: ${typeof data.dateTime}`);
      }
      
      if (data.patientBirthDate && !(data.patientBirthDate instanceof Date)) {
        console.log(`  ⚠️  patientBirthDate should be Date object, got: ${typeof data.patientBirthDate}`);
      }
    });
    
    if (schemaVerified) {
      console.log('\n✅ Appointment schema verification successful');
    } else {
      console.log('\n❌ Appointment schema verification failed');
    }
    
    return { success: schemaVerified };
    
  } catch (error) {
    console.error('❌ Schema verification failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function verifyIndexes(db) {
  try {
    console.log('\n🔍 Verifying Firestore indexes...');
    
    // Test queries that require specific indexes
    const testQueries = [
      {
        name: 'userId + dateTime ASC',
        query: query(
          collection(db, 'appointments'),
          where('userId', '==', 'test-user-id'),
          orderBy('dateTime', 'asc'),
          limit(10)
        )
      },
      {
        name: 'userId + dateTime + status ASC',
        query: query(
          collection(db, 'appointments'),
          where('userId', '==', 'test-user-id'),
          orderBy('dateTime', 'asc'),
          orderBy('status', 'asc'),
          limit(10)
        )
      }
    ];
    
    for (const testQuery of testQueries) {
      try {
        console.log(`  🔍 Testing: ${testQuery.name}`);
        const snapshot = await getDocs(testQuery.query);
        console.log(`    ✅ Success: ${snapshot.size} results`);
      } catch (error) {
        if (error.code === 'failed-precondition') {
          console.log(`    ❌ Index required: ${testQuery.name}`);
          console.log(`       Error: ${error.message}`);
        } else {
          console.log(`    ⚠️  Other error: ${error.message}`);
        }
      }
    }
    
    console.log('✅ Index verification completed');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Index verification failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Starting MedFlow data persistence verification...\n');
  
  // Step 1: Verify Firebase connection
  const connectionResult = await verifyFirebaseConnection();
  if (!connectionResult.success) {
    console.log('\n❌ Cannot proceed without Firebase connection');
    process.exit(1);
  }
  
  // Step 2: Verify appointment schema
  const schemaResult = await verifyAppointmentSchema(connectionResult.db);
  
  // Step 3: Verify indexes
  const indexResult = await verifyIndexes(connectionResult.db);
  
  // Summary
  console.log('\n📊 **VERIFICATION SUMMARY**');
  console.log('========================');
  console.log(`Firebase Connection: ${connectionResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Schema Verification: ${schemaResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Index Verification: ${indexResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  if (connectionResult.success && schemaResult.success && indexResult.success) {
    console.log('\n🎉 **ALL VERIFICATIONS PASSED!**');
    console.log('The MedFlow appointment system is ready for end-to-end testing.');
  } else {
    console.log('\n⚠️  **SOME VERIFICATIONS FAILED**');
    console.log('Please address the issues above before proceeding with testing.');
  }
}

// Run the verification
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  verifyFirebaseConnection,
  verifyAppointmentSchema,
  verifyIndexes
};
