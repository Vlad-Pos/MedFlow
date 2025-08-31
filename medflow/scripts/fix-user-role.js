// Quick fix for user role issue
// Run this in your browser console while signed into your app

async function fixUserRole() {
  try {
    // Get the current user from Firebase Auth
    const user = firebase.auth().currentUser;
    if (!user) {
      console.log('❌ No user signed in');
      return;
    }
    
    console.log('🔐 Current user:', user.email);
    console.log('🆔 User UID:', user.uid);
    
    // Get Firestore instance
    const db = firebase.firestore();
    
    // Update user role to doctor
    await db.collection('users').doc(user.uid).update({
      role: 'doctor',
      permissions: ['create:appointments', 'read:appointments', 'update:appointments', 'delete:appointments'],
      roleUpdatedAt: new Date(),
      roleUpdatedBy: 'browser-console-fix',
      updatedAt: new Date()
    });
    
    console.log('✅ User role updated to DOCTOR');
    console.log('🔄 Please refresh the page and try again');
    
  } catch (error) {
    console.error('❌ Error updating user role:', error);
  }
}

// Run the fix
fixUserRole();


