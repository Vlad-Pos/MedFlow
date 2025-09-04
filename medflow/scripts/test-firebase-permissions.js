// Firebase Permissions Test Script - Post-Fix Verification
// Run this in browser console on /calendar page after the security rules fix

console.log('🧪 Testing Firebase Permissions After Security Rules Fix...')

// Test 1: Check current user and authentication
console.log('=== TEST 1: Authentication & User Status ===')
const auth = window.firebaseAuth
const db = window.firebaseDb

if (!auth || !db) {
  console.error('❌ Firebase instances not found. Make sure you\'re on the calendar page and Firebase is loaded.')
  console.log('Stopping tests due to missing Firebase instances.')
} else {
  console.log('✅ Firebase instances found')
  console.log('Auth User:', auth.currentUser)
  console.log('User ID:', auth.currentUser?.uid)
  console.log('Is Authenticated:', !!auth.currentUser)

  // Test 2: Check user role in Firestore
  console.log('\n=== TEST 2: User Role Check ===')
  if (auth.currentUser) {
    const userRef = db.collection('users').doc(auth.currentUser.uid)
    userRef.get().then(doc => {
      if (doc.exists) {
        const userData = doc.data()
        console.log('✅ User document found')
        console.log('User Role:', userData.role)
        console.log('User Email:', userData.email)
        console.log('User Display Name:', userData.displayName)
      } else {
        console.log('⚠️ User document not found - may need to be created')
      }
    }).catch(error => {
      console.log('❌ Error reading user document:', error.code, error.message)
    })
  }

  // Test 3: Test appointment creation permission
  console.log('\n=== TEST 3: Appointment Creation Permission ===')
  const testAppointmentData = {
    patientName: 'Test Patient',
    patientEmail: 'test@example.com',
    dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    symptoms: 'Test symptoms',
    status: 'scheduled',
    userId: auth.currentUser?.uid,
    createdBy: auth.currentUser?.uid,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  console.log('Test appointment data:', testAppointmentData)
  
  // Try to create a test appointment
  db.collection('appointments').add(testAppointmentData).then(docRef => {
    console.log('✅ APPOINTMENT CREATION SUCCESS!')
    console.log('Created appointment ID:', docRef.id)
    
    // Test 4: Test appointment read permission
    console.log('\n=== TEST 4: Appointment Read Permission ===')
    return docRef.get()
  }).then(doc => {
    if (doc.exists) {
      console.log('✅ APPOINTMENT READ SUCCESS!')
      console.log('Appointment data:', doc.data())
      
      // Test 5: Test appointment update permission
      console.log('\n=== TEST 5: Appointment Update Permission ===')
      const updateData = {
        symptoms: 'Updated test symptoms',
        updatedAt: new Date()
      }
      return doc.ref.update(updateData)
    } else {
      console.log('❌ Created appointment not found')
    }
  }).then(() => {
    console.log('✅ APPOINTMENT UPDATE SUCCESS!')
    
    // Test 6: Test appointment delete permission
    console.log('\n=== TEST 6: Appointment Delete Permission ===')
    return db.collection('appointments').doc(docRef.id).delete()
  }).then(() => {
    console.log('✅ APPOINTMENT DELETE SUCCESS!')
    console.log('All CRUD operations working correctly!')
  }).catch(error => {
    console.log('❌ Error during appointment operations:', error.code, error.message)
    console.log('Full error:', error)
  })

  // Test 7: Test collection access permissions
  console.log('\n=== TEST 7: Collection Access Permissions ===')
  
  // Test users collection access
  db.collection('users').limit(1).get().then(snapshot => {
    if (!snapshot.empty) {
      console.log('✅ USERS COLLECTION ACCESS SUCCESS')
      console.log('Users count:', snapshot.size)
    } else {
      console.log('⚠️ Users collection empty or access restricted')
    }
  }).catch(error => {
    console.log('❌ Users collection access error:', error.code, error.message)
  })

  // Test documents collection access
  db.collection('documents').limit(1).get().then(snapshot => {
    if (!snapshot.empty) {
      console.log('✅ DOCUMENTS COLLECTION ACCESS SUCCESS')
      console.log('Documents count:', snapshot.size)
    } else {
      console.log('⚠️ Documents collection empty or access restricted')
    }
  }).catch(error => {
    console.log('❌ Documents collection access error:', error.code, error.message)
  })

  // Test patient reports collection access
  db.collection('reports').limit(1).get().then(snapshot => {
    if (!snapshot.empty) {
      console.log('✅ REPORTS COLLECTION ACCESS SUCCESS')
      console.log('Reports count:', snapshot.size)
    } else {
      console.log('⚠️ Reports collection empty or access restricted')
    }
  }).catch(error => {
    console.log('❌ Reports collection access error:', error.code, error.message)
  })
}

console.log('\n🧪 Tests completed. Check console for results.')
console.log('💡 If all tests pass, the Firebase permissions are working correctly!')
console.log('💡 If any tests fail, check the error codes and messages for debugging.')


