#!/usr/bin/env node

/**
 * 🔍 **COMPREHENSIVE DEBUG SCRIPT**
 * 
 * This script performs a complete analysis of all possible issues
 * that could cause permission denied errors.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, addDoc, setDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCV4-CXiwvn0H_v6ns1ZfeEmVWrff1sBSc",
  authDomain: "med-schedule-1.firebaseapp.com",
  projectId: "med-schedule-1",
  storageBucket: "med-schedule-1.appspot.com",
  messagingSenderId: "36397792612",
  appId: "1:36397792612:web:586dbda4c92caa43840e71"
};

console.log('🔍 **COMPREHENSIVE DEBUG ANALYSIS**\n');

async function comprehensiveDebug() {
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
          console.log('Display Name:', user.displayName);
          
          // Test 2: User Document Existence
          console.log('\n🧪 TEST 2: User Document Existence');
          console.log('====================================');
          
          try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
              const userData = userSnap.data();
              console.log('✅ User document exists in Firestore');
              console.log('Document data:', {
                uid: userData.uid,
                email: userData.email,
                displayName: userData.displayName,
                role: userData.role,
                permissions: userData.permissions,
                verified: userData.verified,
                createdAt: userData.createdAt,
                lastActivity: userData.lastActivity
              });
              
              // Test 3: Role and Permissions Analysis
              console.log('\n🧪 TEST 3: Role and Permissions Analysis');
              console.log('==========================================');
              
              if (userData.role) {
                console.log('✅ User has role:', userData.role);
                
                if (userData.permissions && Array.isArray(userData.permissions)) {
                  console.log('✅ User has permissions:', userData.permissions.length);
                  
                  // Check appointment creation permission
                  const hasAppointmentPermission = userData.permissions.some(p => 
                    p.resource === 'appointments' && p.action === 'write' && p.scope === 'own'
                  );
                  
                  if (hasAppointmentPermission) {
                    console.log('✅ User has appointment creation permission');
                  } else {
                    console.log('❌ User does NOT have appointment creation permission');
                    console.log('💡 This explains the permission denied error!');
                  }
                  
                  // List all permissions
                  userData.permissions.forEach((perm, index) => {
                    console.log(`  ${index + 1}. ${perm.resource}:${perm.action}:${perm.scope}`);
                  });
                } else {
                  console.log('❌ User has NO permissions array');
                  console.log('💡 This explains the permission denied error!');
                }
              } else {
                console.log('❌ User has NO role assigned');
                console.log('💡 This explains the permission denied error!');
              }
              
              // Test 4: Test Appointment Creation Permission
              console.log('\n🧪 TEST 4: Test Appointment Creation Permission');
              console.log('================================================');
              
              try {
                // Create a test appointment document (this will test the security rules)
                const testAppointmentData = {
                  patientName: 'Test Patient',
                  dateTime: new Date(),
                  status: 'scheduled',
                  userId: user.uid,
                  createdBy: user.uid,
                  patientEmail: 'test@example.com',
                  patientPhone: '+40123456789',
                  patientCNP: '1234567890123',
                  patientBirthDate: new Date('1990-01-01'),
                  symptoms: 'Test symptoms',
                  notes: 'Test notes'
                };
                
                console.log('🔍 Testing appointment creation with data:', testAppointmentData);
                
                const appointmentsRef = collection(db, 'appointments');
                const docRef = await addDoc(appointmentsRef, testAppointmentData);
                
                console.log('✅ Test appointment created successfully!');
                console.log('Document ID:', docRef.id);
                console.log('💡 This means the security rules are working correctly');
                
                // Clean up test document
                // Note: We can't delete it without proper permissions, but that's okay for testing
                
              } catch (error) {
                console.log('❌ Test appointment creation failed');
                console.log('Error details:', error.message);
                console.log('Error code:', error.code);
                
                if (error.code === 'permission-denied') {
                  console.log('💡 This confirms the permission denied error');
                  console.log('💡 The issue is likely with user permissions or security rules');
                } else {
                  console.log('💡 This is a different type of error, not permission related');
                }
              }
              
            } else {
              console.log('❌ User document does NOT exist in Firestore');
              console.log('💡 This explains the permission denied error!');
              console.log('💡 The user signed up before our fixes were implemented');
              
              // Test 5: Create User Document
              console.log('\n🧪 TEST 5: Create User Document');
              console.log('================================');
              
              try {
                console.log('🔧 Attempting to create user document...');
                
                const userData = {
                  uid: user.uid,
                  email: user.email,
                  displayName: user.displayName,
                  role: 'USER',
                  permissions: [
                    { resource: 'appointments', action: 'read', scope: 'own' },
                    { resource: 'appointments', action: 'write', scope: 'own' },
                    { resource: 'patients', action: 'read', scope: 'own' },
                    { resource: 'patients', action: 'write', scope: 'own' },
                    { resource: 'reports', action: 'read', scope: 'own' },
                    { resource: 'reports', action: 'write', scope: 'own' }
                  ],
                  verified: false,
                  lastActivity: new Date(),
                  aiPreferences: {
                    smartSuggestions: true,
                    autoComplete: true,
                    medicalAssistance: true
                  },
                  createdAt: new Date()
                };
                
                await setDoc(userRef, userData);
                console.log('✅ User document created successfully');
                console.log('💡 Now try creating an appointment - it should work!');
                
              } catch (error) {
                console.log('❌ Failed to create user document');
                console.log('Error:', error.message);
                console.log('💡 This suggests a deeper issue with Firestore permissions');
              }
            }
            
          } catch (error) {
            console.error('❌ Error checking user document:', error.message);
            console.log('Error code:', error.code);
          }
          
        } else {
          console.log('❌ No user is currently authenticated');
          console.log('💡 User needs to sign in first');
        }
        
        resolve();
      });
    });
    
  } catch (error) {
    console.error('❌ Comprehensive debug failed with error:', error.message);
  }
}

// Run the comprehensive debug
comprehensiveDebug().catch(console.error);
