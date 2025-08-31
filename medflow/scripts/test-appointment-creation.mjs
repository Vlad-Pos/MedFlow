#!/usr/bin/env node

/**
 * 🧪 **APPOINTMENT CREATION TEST SCRIPT**
 * 
 * This script tests the exact appointment creation process
 * to identify why permission denied errors persist.
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

console.log('🧪 **APPOINTMENT CREATION TEST**\n');

async function testAppointmentCreation() {
  try {
    console.log('📡 Initializing Firebase...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    console.log('Project ID:', firebaseConfig.projectId);
    
    // Test 1: Authentication State
    console.log('\n🧪 TEST 1: Authentication State');
    console.log('===============================');
    
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          console.log('✅ User is authenticated');
          console.log('User ID:', user.uid);
          console.log('Email:', user.email);
          
          // Test 2: User Document and Role
          console.log('\n🧪 TEST 2: User Document and Role');
          console.log('==================================');
          
          try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
              const userData = userSnap.data();
              console.log('✅ User document exists');
              console.log('Role:', userData.role);
              console.log('Permissions count:', userData.permissions?.length || 0);
              
              // Test 3: Test Appointment Creation
              console.log('\n🧪 TEST 3: Test Appointment Creation');
              console.log('=====================================');
              
              try {
                // Create test appointment with EXACT same data structure as the app
                const testAppointmentData = {
                  patientName: 'Test Patient',
                  patientEmail: 'test@example.com',
                  patientPhone: '+40123456789',
                  patientCNP: '1234567890123',
                  patientBirthDate: new Date('1990-01-01'),
                  dateTime: new Date(),
                  symptoms: 'Test symptoms',
                  notes: 'Test notes',
                  status: 'scheduled',
                  userId: user.uid,
                  createdBy: user.uid
                };
                
                console.log('🔍 Testing appointment creation with data:');
                console.log(JSON.stringify(testAppointmentData, null, 2));
                
                // Test 3a: Minimal data (required fields only)
                console.log('\n🧪 TEST 3a: Minimal Required Data');
                console.log('====================================');
                
                const minimalData = {
                  patientName: 'Minimal Patient',
                  dateTime: new Date(),
                  status: 'scheduled',
                  userId: user.uid,
                  createdBy: user.uid
                };
                
                console.log('Minimal data:', JSON.stringify(minimalData, null, 2));
                
                try {
                  const appointmentsRef = collection(db, 'appointments');
                  const docRef = await addDoc(appointmentsRef, minimalData);
                  console.log('✅ Minimal appointment created successfully!');
                  console.log('Document ID:', docRef.id);
                } catch (error) {
                  console.log('❌ Minimal appointment creation failed');
                  console.log('Error code:', error.code);
                  console.log('Error message:', error.message);
                  
                  if (error.code === 'permission-denied') {
                    console.log('💡 This confirms the security rules are still rejecting the request');
                  }
                }
                
                // Test 3b: Full data (all fields)
                console.log('\n🧪 TEST 3b: Full Data with All Fields');
                console.log('=====================================');
                
                try {
                  const docRef = await addDoc(collection(db, 'appointments'), testAppointmentData);
                  console.log('✅ Full appointment created successfully!');
                  console.log('Document ID:', docRef.id);
                } catch (error) {
                  console.log('❌ Full appointment creation failed');
                  console.log('Error code:', error.code);
                  console.log('Error message:', error.message);
                  
                  if (error.code === 'permission-denied') {
                    console.log('💡 This confirms the security rules are rejecting the full data');
                  }
                }
                
              } catch (error) {
                console.log('❌ Test appointment creation failed');
                console.log('Error:', error.message);
              }
              
            } else {
              console.log('❌ User document does NOT exist');
              console.log('💡 This explains the permission denied error');
            }
            
          } catch (error) {
            console.error('❌ Error checking user document:', error.message);
          }
          
        } else {
          console.log('❌ No user is currently authenticated');
          console.log('💡 User needs to sign in first');
        }
        
        resolve();
      });
    });
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testAppointmentCreation().catch(console.error);
