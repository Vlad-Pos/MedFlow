#!/usr/bin/env node

/**
 * 🔍 **QUICK USER CHECK SCRIPT**
 * 
 * This script quickly checks if the current user has a Firestore document
 * and what their role/permissions are.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCV4-CXiwvn0H_v6ns1ZfeEmVWrff1sBSc",
  authDomain: "med-schedule-1.firebaseapp.com",
  projectId: "med-schedule-1",
  storageBucket: "med-schedule-1.appspot.com",
  messagingSenderId: "36397792612",
  appId: "1:36397792612:web:586dbda4c92caa43840e71"
};

console.log('🔍 **QUICK USER CHECK**\n');

async function quickUserCheck() {
  try {
    console.log('📡 Initializing Firebase...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          console.log('✅ User is authenticated');
          console.log('User ID:', user.uid);
          console.log('Email:', user.email);
          
          // Check Firestore user document
          try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
              const userData = userSnap.data();
              console.log('\n✅ User document exists in Firestore');
              console.log('Role:', userData.role);
              console.log('Permissions count:', userData.permissions?.length || 0);
              
              // Check appointment creation permission
              const hasAppointmentPermission = userData.permissions?.some(p => 
                p.resource === 'appointments' && p.action === 'write' && p.scope === 'own'
              );
              
              if (hasAppointmentPermission) {
                console.log('✅ User has appointment creation permission');
                console.log('💡 Security rules should now allow appointment creation');
              } else {
                console.log('❌ User does NOT have appointment creation permission');
              }
              
            } else {
              console.log('\n❌ User document does NOT exist in Firestore');
              console.log('💡 This explains the permission denied error!');
              console.log('💡 Run fixMedFlowUser() in browser console to fix this');
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
    console.error('❌ Check failed with error:', error.message);
  }
}

// Run the check
quickUserCheck().catch(console.error);
