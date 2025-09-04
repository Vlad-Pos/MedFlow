// Firebase Rules Test - Direct Rule Testing
// Run this in browser console on /calendar page

console.log('🔒 Testing Firebase Rules Directly...')

// Test 1: Check if we can access Firebase directly
console.log('=== TEST 1: Firebase Access ===')
const auth = window.firebaseAuth
const db = window.firebaseDb

if (!auth || !db) {
  console.error('❌ Firebase instances not found. Make sure you\'re on the calendar page and Firebase is loaded.')
  console.log('Stopping tests due to missing Firebase instances.')
} else {
  console.log('Firestore instance:', db)
  console.log('Auth instance:', auth)
  console.log('Current user:', auth.currentUser)

  // Test 2: Test collection access
  console.log('\n=== TEST 2: Collection Access ===')
  const appointmentsRef = window.firebaseCollection(db, 'appointments')
  console.log('Appointments collection:', appointmentsRef)

  // Test 3: Test document access with different IDs
  console.log('\n=== TEST 3: Document Access Test ===')
  const testIds = ['1', '2', '3'] // Test multiple document IDs

  testIds.forEach(async (id) => {
    try {
      const docRef = window.firebaseDoc(db, 'appointments', id)
      const docSnap = await window.firebaseGetDoc(docRef)
      
      if (docSnap.exists()) {
        console.log(`✅ Document ${id} exists:`, docSnap.data())
        console.log(`  - userId: ${docSnap.data()?.userId}`)
        console.log(`  - Matches current user: ${docSnap.data()?.userId === auth.currentUser?.uid}`)
      } else {
        console.log(`❌ Document ${id} does not exist`)
      }
    } catch (error) {
      console.log(`❌ Error accessing document ${id}:`, error.code, error.message)
    }
  })

  // Test 4: Test write operations
  console.log('\n=== TEST 4: Write Permission Test ===')
  const testWriteDoc = window.firebaseDoc(db, 'appointments', 'TEST_WRITE_' + Date.now())
  const testData = {
    testField: 'test value',
    userId: auth.currentUser?.uid,
    createdAt: new Date()
  }

  window.firebaseSetDoc(testWriteDoc, testData).then(() => {
    console.log('✅ WRITE SUCCESS - Created test document')
    // Clean up
    return window.firebaseDeleteDoc(testWriteDoc)
  }).then(() => {
    console.log('✅ DELETE SUCCESS - Cleaned up test document')
  }).catch(error => {
    console.log('❌ WRITE FAILED:', error.code, error.message)
    console.log('Full error:', error)
  })
}

console.log('\n🔒 Rules tests completed. Check console for results.')
