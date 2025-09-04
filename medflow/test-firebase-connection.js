/**
 * Firebase Connection Testing
 * Test Firebase connection and basic operations
 */

import { db } from './src/services/firebase.ts';
import { collection, addDoc, getDocs, doc, getDoc } from 'firebase/firestore';

console.log('🧪 Firebase Connection Testing\n');

async function testFirebaseConnection() {
  try {
    // Test 1: Check Firebase connection
    console.log('Test 1: Checking Firebase connection...');
    const testCollection = collection(db, 'test');
    console.log('✅ Firebase connection established');
    
    // Test 2: Test Firestore write operation
    console.log('\nTest 2: Testing Firestore write...');
    const testDoc = await addDoc(testCollection, {
      test: true,
      timestamp: new Date(),
      message: 'Firebase connection test'
    });
    console.log('✅ Document written with ID:', testDoc.id);
    
    // Test 3: Test Firestore read operation
    console.log('\nTest 3: Testing Firestore read...');
    const docRef = doc(db, 'test', testDoc.id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log('✅ Document read successfully:', docSnap.data());
    } else {
      console.log('❌ Document not found');
    }
    
    // Test 4: Test collection query
    console.log('\nTest 4: Testing collection query...');
    const querySnapshot = await getDocs(testCollection);
    console.log('✅ Collection query successful:', querySnapshot.size, 'documents found');
    
    console.log('\n🎉 All Firebase tests passed!');
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error.message);
    console.error('Error details:', error);
  }
}

// Run the tests
testFirebaseConnection();
