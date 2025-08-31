#!/usr/bin/env node

/**
 * 🔍 **AUTHENTICATION STATE DEBUG SCRIPT**
 * 
 * This script helps debug the current authentication state and user role
 * for the MedFlow appointment system.
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCV4-CXiwvn0H_v6ns1ZfeEmVWrff1sBSc",
  authDomain: "med-schedule-1.firebaseapp.com",
  projectId: "med-schedule-1",
  storageBucket: "med-schedule-1.appspot.com",
  messagingSenderId: "36397792612",
  appId: "1:36397792612:web:586dbda4c92caa43840e71"
};

console.log('🔍 **MEDFLOW AUTHENTICATION DEBUG**\n');

async function debugAuthState() {
  try {
    console.log('📡 Initializing Firebase...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    
    // Check if user is signed in
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.log('❌ No user currently signed in');
      console.log('💡 To test with a specific user, you can:');
      console.log('   1. Sign in through the web app first');
      console.log('   2. Or provide email/password to test with');
      return;
    }
    
    console.log('✅ User is signed in:', {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName
    });
    
    // Check user document in Firestore
    console.log('\n🔍 Checking user document in Firestore...');
    
    const userRef = doc(db, 'users', currentUser.uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      console.log('✅ User document found:', {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        permissions: userData.permissions,
        verified: userData.verified,
        createdAt: userData.createdAt?.toDate?.() || userData.createdAt,
        lastActivity: userData.lastActivity?.toDate?.() || userData.lastActivity
      });
      
      // Check if role is properly set
      if (userData.role) {
        console.log(`✅ User role is set to: ${userData.role}`);
        
        if (userData.role === 'ADMIN') {
          console.log('🔑 User has ADMIN privileges');
        } else if (userData.role === 'USER') {
          console.log('👤 User has USER privileges');
        } else {
          console.log(`⚠️  Unknown role: ${userData.role}`);
        }
      } else {
        console.log('❌ User role is NOT set - this could be the problem!');
        console.log('💡 The user document should have a role field set to either "ADMIN" or "USER"');
      }
      
      // Check permissions
      if (userData.permissions && userData.permissions.length > 0) {
        console.log(`✅ User has ${userData.permissions.length} permissions`);
        userData.permissions.forEach((perm, index) => {
          console.log(`   ${index + 1}. ${perm.resource}:${perm.action}:${perm.scope}`);
        });
      } else {
        console.log('❌ User has no permissions - this could be the problem!');
      }
      
    } else {
      console.log('❌ User document does NOT exist in Firestore');
      console.log('💡 This means the user was created in Firebase Auth but not in Firestore');
      console.log('💡 The signUp process should create this document automatically');
    }
    
    // Test appointment creation permission
    console.log('\n🔍 Testing appointment creation permission...');
    
    const testAppointmentData = {
      patientName: "Test Patient",
      dateTime: new Date(),
      status: "scheduled",
      userId: currentUser.uid,
      createdBy: currentUser.uid,
      symptoms: "Test symptoms",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('📋 Test appointment data:', testAppointmentData);
    
    // Check if user has permission to create appointments
    if (userData.role === 'USER') {
      const hasAppointmentPermission = userData.permissions?.some(p => 
        p.resource === 'appointments' && p.action === 'write' && p.scope === 'own'
      );
      
      if (hasAppointmentPermission) {
        console.log('✅ User has permission to create appointments');
      } else {
        console.log('❌ User does NOT have permission to create appointments');
        console.log('💡 This could be the root cause of the permission denied error');
      }
    } else if (userData.role === 'ADMIN') {
      console.log('✅ Admin users have full permissions');
    }
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
}

// Run the debug function
debugAuthState().catch(console.error);
