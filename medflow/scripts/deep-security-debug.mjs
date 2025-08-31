#!/usr/bin/env node

/**
 * 🔍 **DEEP SECURITY DEBUG SCRIPT**
 * 
 * This script helps identify why security rule comparisons are failing
 * by examining the exact data being sent and received.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, addDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCV4-CXiwvn0H_v6ns1ZfeEmVWrff1sBSc",
  authDomain: "med-schedule-1.firebaseapp.com",
  projectId: "med-schedule-1",
  storageBucket: "med-schedule-1.appspot.com",
  messagingSenderId: "36397792612",
  appId: "1:36397792612:web:586dbda4c92caa43840e71"
};

console.log('🔍 **DEEP SECURITY DEBUG**\n');

async function deepSecurityDebug() {
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    
    // Test 1: Check authentication and user ID
    console.log('\n🧪 TEST 1: Authentication and User ID Analysis');
    console.log('===============================================');
    
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          console.log('✅ User is authenticated');
          console.log('User ID:', user.uid);
          console.log('User ID type:', typeof user.uid);
          console.log('User ID length:', user.uid.length);
          console.log('User ID sample:', user.uid.substring(0, 10) + '...');
          
          // Test 2: Create test data with EXACT same structure
          console.log('\n🧪 TEST 2: Data Structure Analysis');
          console.log('===================================');
          
          try {
            // Create test data that EXACTLY matches what the app sends
            const testData = {
              patientName: 'Debug Test Patient',
              patientEmail: 'test@example.com',
              patientPhone: 'RO123456789',
              patientCNP: '1234567890123',
              patientBirthDate: new Date('1990-01-01'),
              dateTime: new Date(),
              symptoms: 'Debug symptoms',
              notes: 'Debug notes',
              status: 'scheduled',
              userId: user.uid,        // This is the key field
              createdBy: user.uid      // This is the key field
            };
            
            console.log('🔍 Test data structure:');
            console.log(JSON.stringify(testData, null, 2));
            
            // Test 2a: Analyze key fields
            console.log('\n🔍 Key Field Analysis:');
            console.log('=====================');
            console.log('userId value:', testData.userId);
            console.log('userId type:', typeof testData.userId);
            console.log('userId === user.uid:', testData.userId === user.uid);
            console.log('createdBy value:', testData.createdBy);
            console.log('createdBy type:', typeof testData.createdBy);
            console.log('createdBy === user.uid:', testData.createdBy === user.uid);
            
            // Test 2b: Check for hidden characters or encoding issues
            console.log('\n🔍 Data Integrity Check:');
            console.log('========================');
            console.log('userId char codes:', Array.from(testData.userId).map(c => c.charCodeAt(0)));
            console.log('user.uid char codes:', Array.from(user.uid).map(c => c.charCodeAt(0)));
            console.log('userId.trim() === user.uid.trim():', testData.userId.trim() === user.uid.trim());
            
            // Test 2c: Try to create appointment
            console.log('\n🧪 TEST 2c: Attempt Appointment Creation');
            console.log('=========================================');
            
            try {
              const appointmentsRef = collection(db, 'appointments');
              const docRef = await addDoc(appointmentsRef, testData);
              
              console.log('✅ Test appointment created successfully!');
              console.log('Document ID:', docRef.id);
              
              // Verify the document was created
              const createdDoc = await getDoc(docRef);
              if (createdDoc.exists()) {
                console.log('✅ Document exists in database');
                const storedData = createdDoc.data();
                console.log('Stored userId:', storedData.userId);
                console.log('Stored createdBy:', storedData.createdBy);
                console.log('Stored userId type:', typeof storedData.userId);
                console.log('Stored createdBy type:', typeof storedData.createdBy);
              }
              
            } catch (error) {
              console.log('❌ Test appointment creation failed');
              console.log('Error code:', error.code);
              console.log('Error message:', error.message);
              
              if (error.code === 'permission-denied') {
                console.log('\n🚨 PERMISSION DENIED ANALYSIS:');
                console.log('============================');
                console.log('This confirms the security rules are rejecting the request');
                console.log('The issue is likely:');
                console.log('1. userId field mismatch');
                console.log('2. createdBy field mismatch');
                console.log('3. Data type conversion issues');
                console.log('4. Security rule evaluation problems');
              }
            }
            
          } catch (error) {
            console.log('❌ Test setup failed:', error.message);
          }
          
        } else {
          console.log('❌ No user is currently authenticated');
          console.log('💡 User needs to sign in first');
        }
        
        resolve();
      });
    });
    
  } catch (error) {
    console.error('❌ Deep security debug failed with error:', error.message);
  }
}

// Run the debug
deepSecurityDebug().catch(console.error);
