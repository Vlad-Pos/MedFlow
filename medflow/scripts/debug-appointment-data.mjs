#!/usr/bin/env node

/**
 * 🔍 **APPOINTMENT DATA DEBUG SCRIPT**
 * 
 * This script helps debug exactly what data is being sent
 * when creating appointments to understand why security rules fail.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, addDoc } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCV4-CXiwvn0H_v6ns1ZfeEmVWrff1sBSc",
  authDomain: "med-schedule-1.firebaseapp.com",
  projectId: "med-schedule-1",
  storageBucket: "med-schedule-1.appspot.com",
  messagingSenderId: "36397792612",
  appId: "1:36397792612:web:586dbda4c92caa43840e71"
};

console.log('🔍 **APPOINTMENT DATA DEBUG**\n');

async function debugAppointmentData() {
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    
    // Test 1: Check authentication
    console.log('\n🧪 TEST 1: Authentication State');
    console.log('===============================');
    
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          console.log('✅ User is authenticated');
          console.log('User ID:', user.uid);
          console.log('Email:', user.email);
          
          // Test 2: Test with EXACT same data structure as the app
          console.log('\n🧪 TEST 2: Test with App Data Structure');
          console.log('==========================================');
          
          try {
            // Recreate the EXACT data structure from the app
            const testAppointmentData = {
              patientName: 'Debug Test Patient',
              patientEmail: undefined,  // Exactly as app sends
              patientPhone: undefined,  // Exactly as app sends
              patientCNP: undefined,    // Exactly as app sends
              patientBirthDate: undefined, // Exactly as app sends
              dateTime: new Date(),     // This might be the issue - Date vs Timestamp
              symptoms: 'Debug symptoms',
              notes: undefined,         // Exactly as app sends
              status: 'scheduled',
              userId: user.uid,
              createdBy: user.uid
            };
            
            console.log('🔍 Testing with EXACT app data structure:');
            console.log(JSON.stringify(testAppointmentData, null, 2));
            
            // Test 2a: Check data types
            console.log('\n🔍 Data Type Analysis:');
            console.log('=====================');
            console.log('patientName type:', typeof testAppointmentData.patientName);
            console.log('dateTime type:', typeof testAppointmentData.dateTime);
            console.log('dateTime constructor:', testAppointmentData.dateTime.constructor.name);
            console.log('symptoms type:', typeof testAppointmentData.symptoms);
            console.log('status type:', typeof testAppointmentData.status);
            console.log('userId type:', typeof testAppointmentData.userId);
            console.log('createdBy type:', typeof testAppointmentData.createdBy);
            
            // Test 2b: Check field existence
            console.log('\n🔍 Field Existence Check:');
            console.log('========================');
            const requiredFields = ['patientName', 'dateTime', 'symptoms', 'status', 'userId', 'createdBy'];
            requiredFields.forEach(field => {
              const exists = testAppointmentData.hasOwnProperty(field);
              const value = testAppointmentData[field];
              const type = typeof value;
              console.log(`${field}: ${exists ? '✅' : '❌'} (${type}) = ${value}`);
            });
            
            // Test 2c: Try to create appointment
            console.log('\n🧪 TEST 2c: Attempt Appointment Creation');
            console.log('=========================================');
            
            try {
              const appointmentsRef = collection(db, 'appointments');
              const docRef = await addDoc(appointmentsRef, testAppointmentData);
              
              console.log('✅ Test appointment created successfully!');
              console.log('Document ID:', docRef.id);
              
              // Verify the document was created
              const createdDoc = await getDoc(docRef);
              if (createdDoc.exists()) {
                console.log('✅ Document exists in database');
                console.log('Stored data:', createdDoc.data());
              }
              
            } catch (error) {
              console.log('❌ Test appointment creation failed');
              console.log('Error code:', error.code);
              console.log('Error message:', error.message);
              
              if (error.code === 'permission-denied') {
                console.log('\n🚨 PERMISSION DENIED ANALYSIS:');
                console.log('============================');
                console.log('This confirms the security rules are rejecting the request');
                console.log('Possible causes:');
                console.log('1. Field validation failing');
                console.log('2. Data type mismatches');
                console.log('3. Required field missing');
                console.log('4. Security rule syntax error');
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
    console.error('❌ Debug failed with error:', error.message);
  }
}

// Run the debug
debugAppointmentData().catch(console.error);
