// Simple Firebase Test - Just check what's accessible
// Run this in browser console on /calendar page

console.log('🧪 Simple Firebase Test - Checking Access...')

// Test 1: Check what Firebase instances are available
console.log('=== TEST 1: Available Firebase Instances ===')
console.log('window.firebaseAuth:', window.firebaseAuth)
console.log('window.firebaseDb:', window.firebaseDb)
console.log('window.firebaseStorageInstance:', window.firebaseStorageInstance)

// Test 2: Check if we can access the appointments collection
console.log('\n=== TEST 2: Collection Access Test ===')
if (window.firebaseDb) {
  try {
    console.log('✅ Firestore instance available')
    console.log('Firestore type:', typeof window.firebaseDb)
    console.log('Firestore methods:', Object.getOwnPropertyNames(window.firebaseDb))
  } catch (error) {
    console.log('❌ Error accessing Firestore:', error)
  }
} else {
  console.log('❌ Firestore instance not available')
}

// Test 3: Check authentication status
console.log('\n=== TEST 3: Authentication Status ===')
if (window.firebaseAuth) {
  console.log('✅ Auth instance available')
  console.log('Current user:', window.firebaseAuth.currentUser)
  console.log('Is authenticated:', !!window.firebaseAuth.currentUser)
} else {
  console.log('❌ Auth instance not available')
}

console.log('\n🧪 Simple test completed. Check console for results.')
