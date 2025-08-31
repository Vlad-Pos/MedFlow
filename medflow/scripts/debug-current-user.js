#!/usr/bin/env node

/**
 * 🔍 **CURRENT USER DEBUG SCRIPT**
 * 
 * This script checks the current user's authentication state and Firestore document
 * to identify why permission denied errors are still occurring.
 */

const { initializeApp } = require('firebase/app');
const { getAuth, onAuthStateChanged } = require('firebase/auth');
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

console.log('🔍 **CURRENT USER DEBUG ANALYSIS**\n');

async function debugCurrentUser() {
  try {
    console.log('📡 Initializing Firebase...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    
    // Check authentication state
    console.log('\n🔐 **AUTHENTICATION STATE ANALYSIS**');
    console.log('=====================================');
    
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          console.log('✅ User is authenticated');
          console.log('User ID:', user.uid);
          console.log('Email:', user.email);
          console.log('Display Name:', user.displayName);
          
          // Check Firestore user document
          console.log('\n📄 **FIRESTORE USER DOCUMENT ANALYSIS**');
          console.log('========================================');
          
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
              
              // Analyze role and permissions
              console.log('\n🎭 **ROLE & PERMISSIONS ANALYSIS**');
              console.log('==================================');
              
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
              
            } else {
              console.log('❌ User document does NOT exist in Firestore');
              console.log('💡 This explains the permission denied error!');
              console.log('💡 The user signed up before our fixes were implemented');
              
              // Check if this is an existing user without a document
              console.log('\n🔧 **SOLUTION FOR EXISTING USERS**');
              console.log('==================================');
              console.log('This user needs a Firestore document created manually or');
              console.log('they need to sign out and sign up again to trigger our new logic.');
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
    console.error('❌ Debug failed with error:', error.message);
  }
}

// Run the debug analysis
if (require.main === module) {
  debugCurrentUser().catch(console.error);
}

module.exports = {
  debugCurrentUser
};
