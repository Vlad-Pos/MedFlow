#!/usr/bin/env node

/**
 * 🔍 **REAL-TIME APPOINTMENT DEBUG SCRIPT**
 * 
 * This script provides real-time debugging information
 * to identify the exact cause of permission denied errors.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, addDoc, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCV4-CXiwvn0H_v6ns1ZfeEmVWrff1sBSc",
  authDomain: "med-schedule-1.firebaseapp.com",
  projectId: "med-schedule-1",
  storageBucket: "med-schedule-1.appspot.com",
  messagingSenderId: "36397792612",
  appId: "1:36397792612:web:586dbda4c92caa43840e71"
};

console.log('🔍 **REAL-TIME APPOINTMENT DEBUG**\n');
console.log('📡 Firebase Config:');
console.log('  Project ID:', firebaseConfig.projectId);
console.log('  Auth Domain:', firebaseConfig.authDomain);
console.log('  API Key:', firebaseConfig.apiKey.substring(0, 10) + '...\n');

async function realTimeDebug() {
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    
    // Test 1: Check if we can connect to Firestore
    console.log('\n🧪 TEST 1: Firestore Connection');
    console.log('===============================');
    
    try {
      // Try to read a document to test connection
      const testRef = doc(db, 'users', 'test-connection');
      await getDoc(testRef);
      console.log('✅ Firestore connection successful');
    } catch (error) {
      console.log('❌ Firestore connection failed');
      console.log('Error code:', error.code);
      console.log('Error message:', error.message);
      
      if (error.code === 'permission-denied') {
        console.log('💡 Permission denied on basic connection - this is a major issue');
      }
    }
    
    // Test 2: Authentication State
    console.log('\n🧪 TEST 2: Authentication State');
    console.log('===============================');
    
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          console.log('✅ User is authenticated');
          console.log('User ID:', user.uid);
          console.log('Email:', user.email);
          console.log('Email Verified:', user.emailVerified);
          
          // Test 3: User Document Access
          console.log('\n🧪 TEST 3: User Document Access');
          console.log('================================');
          
          try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
              const userData = userSnap.data();
              console.log('✅ User document exists and is accessible');
              console.log('Role:', userData.role);
              console.log('Permissions:', userData.permissions?.length || 0);
              
              // Test 4: Test Appointment Creation
              console.log('\n🧪 TEST 4: Test Appointment Creation');
              console.log('=====================================');
              
              try {
                const testAppointment = {
                  patientName: 'Debug Test Patient',
                  dateTime: new Date(),
                  status: 'scheduled',
                  userId: user.uid,
                  createdBy: user.uid
                };
                
                console.log('🔍 Creating test appointment with data:');
                console.log(JSON.stringify(testAppointment, null, 2));
                
                const appointmentsRef = collection(db, 'appointments');
                const docRef = await addDoc(appointmentsRef, testAppointment);
                
                console.log('✅ Test appointment created successfully!');
                console.log('Document ID:', docRef.id);
                
                // Test 5: Verify the appointment was actually created
                console.log('\n🧪 TEST 5: Verify Appointment Creation');
                console.log('=======================================');
                
                const createdDoc = await getDoc(docRef);
                if (createdDoc.exists()) {
                  console.log('✅ Appointment document exists in database');
                  console.log('Data:', createdDoc.data());
                } else {
                  console.log('❌ Appointment document does not exist after creation');
                }
                
              } catch (error) {
                console.log('❌ Test appointment creation failed');
                console.log('Error code:', error.code);
                console.log('Error message:', error.message);
                console.log('Full error:', error);
                
                if (error.code === 'permission-denied') {
                  console.log('\n🚨 PERMISSION DENIED ANALYSIS:');
                  console.log('============================');
                  console.log('1. User is authenticated:', !!user);
                  console.log('2. User document exists:', userSnap.exists());
                  console.log('3. User role:', userData.role);
                  console.log('4. Security rules should allow this operation');
                  console.log('5. Possible causes:');
                  console.log('   - Security rules not deployed correctly');
                  console.log('   - Field validation failing');
                  console.log('   - Authentication context issue');
                  console.log('   - Firebase project configuration problem');
                }
              }
              
            } else {
              console.log('❌ User document does NOT exist');
              console.log('💡 This explains the permission denied error');
            }
            
          } catch (error) {
            console.error('❌ Error accessing user document:', error.message);
            console.log('Error code:', error.code);
          }
          
        } else {
          console.log('❌ No user is currently authenticated');
          console.log('💡 User needs to sign in first');
          
          // Test 2a: Try to sign in with credentials
          console.log('\n🧪 TEST 2a: Attempt Sign In');
          console.log('============================');
          
          const email = process.env.TEST_EMAIL || 'vlad.postoroanca@gmail.com';
          const password = process.env.TEST_PASSWORD;
          
          if (password) {
            try {
              console.log('🔐 Attempting sign in with:', email);
              const userCredential = await signInWithEmailAndPassword(auth, email, password);
              console.log('✅ Sign in successful');
              console.log('User ID:', userCredential.user.uid);
            } catch (error) {
              console.log('❌ Sign in failed:', error.message);
            }
          } else {
            console.log('💡 Set TEST_PASSWORD environment variable to test sign in');
          }
        }
        
        resolve();
      });
    });
    
  } catch (error) {
    console.error('❌ Real-time debug failed with error:', error.message);
    console.log('Full error:', error);
  }
}

// Run the debug
realTimeDebug().catch(console.error);
