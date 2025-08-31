const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, getDoc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCV4-CXiwvn0H_v6ns1ZfeEmVWrff1sBSc",
  authDomain: "med-schedule-1.firebaseapp.com",
  projectId: "med-schedule-1",
  storageBucket: "med-schedule-1.appspot.com",
  messagingSenderId: "36397792612",
  appId: "1:36397792612:web:586dbda4c92caa43840e71"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function upgradeUserRole(userEmail, userPassword) {
  try {
    console.log('🔐 Signing in user...');
    
    // Sign in the user
    const userCredential = await signInWithEmailAndPassword(auth, userEmail, userPassword);
    const user = userCredential.user;
    
    console.log('✅ User signed in:', user.email);
    console.log('🆔 User UID:', user.uid);
    
    // Get current user data
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      console.log('❌ User document not found');
      return;
    }
    
    const userData = userSnap.data();
    console.log('📊 Current user data:', {
      role: userData.role,
      email: userData.email,
      displayName: userData.displayName
    });
    
    // Update user role to doctor
    await updateDoc(userRef, {
      role: 'doctor',
      permissions: ['create:appointments', 'read:appointments', 'update:appointments', 'delete:appointments'],
      roleUpdatedAt: new Date(),
      roleUpdatedBy: 'system-upgrade-script',
      updatedAt: new Date()
    });
    
    console.log('✅ User role upgraded to DOCTOR');
    console.log('🔑 New permissions granted');
    
    // Verify the update
    const updatedSnap = await getDoc(userRef);
    const updatedData = updatedSnap.data();
    console.log('📊 Updated user data:', {
      role: updatedData.role,
      permissions: updatedData.permissions
    });
    
  } catch (error) {
    console.error('❌ Error upgrading user role:', error);
  }
}

// Usage instructions
console.log('🚀 User Role Upgrade Script');
console.log('============================');
console.log('');
console.log('To use this script:');
console.log('1. Replace YOUR_EMAIL with your actual email');
console.log('2. Replace YOUR_PASSWORD with your actual password');
console.log('3. Run: node scripts/upgrade-user-role.js');
console.log('');
console.log('Example:');
console.log('upgradeUserRole("your.email@example.com", "yourpassword");');
console.log('');

// Uncomment and modify the line below with your actual credentials
// upgradeUserRole("YOUR_EMAIL", "YOUR_PASSWORD");


