// Quick Firebase Permission Test - Direct Testing
// Run this in browser console on /calendar page

console.log('🧪 Testing Firebase Permissions Directly...')

// Test 1: Check current user
console.log('=== TEST 1: Current User ===')
const auth = window.firebaseAuth
const db = window.firebaseDb

if (!auth || !db) {
  console.error('❌ Firebase instances not found. Make sure you\'re on the calendar page and Firebase is loaded.')
  console.log('Stopping tests due to missing Firebase instances.')
} else {
  console.log('Auth User:', auth.currentUser)
  console.log('User ID:', auth.currentUser?.uid)
  console.log('Is Authenticated:', !!auth.currentUser)

  // Test 2: Check appointment document directly
  console.log('\n=== TEST 2: Appointment Document ===')
  // Use Firebase functions directly from the app's imports
  const testDoc = db.collection('appointments').doc('1')
  console.log('Document Reference:', testDoc)

  // Test 3: Try to read the document
  console.log('\n=== TEST 3: Read Permission Test ===')
  testDoc.get().then(doc => {
    console.log('✅ READ SUCCESS:', doc.data())
    console.log('Document Data:', doc.data())
    console.log('userId field:', doc.data()?.userId)
    console.log('Matches current user?', doc.data()?.userId === auth.currentUser?.uid)
  }).catch(error => {
    console.log('❌ READ FAILED:', error.code, error.message)
  })

  // Test 4: Try to update the document
  console.log('\n=== TEST 4: Update Permission Test ===')
  const updateData = {
    testField: 'test value',
    updatedAt: new Date()
  }
  testDoc.update(updateData).then(() => {
    console.log('✅ UPDATE SUCCESS')
  }).catch(error => {
    console.log('❌ UPDATE FAILED:', error.code, error.message)
    console.log('Full error:', error)
  })
}

console.log('\n🧪 Tests completed. Check console for results.')
