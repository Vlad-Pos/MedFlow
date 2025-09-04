// Firebase Permissions Test Script - CORRECTED VERSION
// Run this in browser console on /calendar page after the security rules fix

console.log('🧪 Testing Firebase Permissions After Security Rules Fix...')

// Step 1: Access Firebase instances from the React component
console.log('=== STEP 1: Accessing Firebase Instances ===')

// Method 1: Try to access from React DevTools
let auth = null
let db = null

// Look for Firebase instances in the React component tree
console.log('🔍 Searching for Firebase instances in React components...')

// Method 2: Try to access from the window object if available
if (window.firebaseAuth && window.firebaseDb) {
  console.log('✅ Found Firebase instances on window object')
  auth = window.firebaseAuth
  db = window.firebaseDb
} else {
  console.log('⚠️ Firebase instances not on window object')
  
  // Method 3: Try to access from React DevTools
  console.log('💡 Try this:')
  console.log('1. Open React DevTools (F12 → Components tab)')
  console.log('2. Find the SchedulingCalendar component')
  console.log('3. Look for auth and db in the component state')
  console.log('4. Copy the values and paste them here')
  
  // Method 4: Manual Firebase instance creation
  console.log('\n💡 Alternative: Create Firebase instances manually')
  console.log('Copy and paste this in the console:')
  
  const manualFirebaseCode = `
// Manual Firebase setup for testing
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'

// You'll need to get your Firebase config from the app
// Check the Network tab in DevTools for Firebase requests
// Or look in the React component state

console.log('Please provide your Firebase config to continue testing')
  `
  
  console.log(manualFirebaseCode)
  
  // Method 5: Check if we can access the component's Firebase instances
  console.log('\n🔍 Checking if we can access component Firebase instances...')
  
  // Try to find the component in the DOM and access its props
  const calendarElement = document.querySelector('[data-testid="scheduling-calendar"]') || 
                         document.querySelector('.calendar') ||
                         document.querySelector('[class*="calendar"]')
  
  if (calendarElement) {
    console.log('✅ Found calendar element:', calendarElement)
    console.log('💡 Try accessing Firebase from React DevTools on this element')
  } else {
    console.log('⚠️ Calendar element not found')
  }
}

// Step 2: If we have Firebase instances, run the tests
if (auth && db) {
  console.log('\n=== STEP 2: Running Firebase Tests ===')
  
  // Test 1: Check current user and authentication
  console.log('--- TEST 1: Authentication & User Status ---')
  console.log('Auth User:', auth.currentUser)
  console.log('User ID:', auth.currentUser?.uid)
  console.log('Is Authenticated:', !!auth.currentUser)

  if (auth.currentUser) {
    // Test 2: Check user role in Firestore
    console.log('\n--- TEST 2: User Role Check ---')
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

    // Test 3: Test appointment creation permission
    console.log('\n--- TEST 3: Appointment Creation Permission ---')
    const testAppointmentData = {
      patientName: 'Test Patient',
      patientEmail: 'test@example.com',
      dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      symptoms: 'Test symptoms',
      status: 'scheduled',
      userId: auth.currentUser.uid,
      createdBy: auth.currentUser.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    console.log('Test appointment data:', testAppointmentData)
    
    // Try to create a test appointment
    db.collection('appointments').add(testAppointmentData).then(docRef => {
      console.log('✅ APPOINTMENT CREATION SUCCESS!')
      console.log('Created appointment ID:', docRef.id)
      
      // Test 4: Test appointment read permission
      console.log('\n--- TEST 4: Appointment Read Permission ---')
      return docRef.get()
    }).then(doc => {
      if (doc.exists) {
        console.log('✅ APPOINTMENT READ SUCCESS!')
        console.log('Appointment data:', doc.data())
        
        // Test 5: Test appointment update permission
        console.log('\n--- TEST 5: Appointment Update Permission ---')
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
      console.log('\n--- TEST 6: Appointment Delete Permission ---')
      return db.collection('appointments').doc(docRef.id).delete()
    }).then(() => {
      console.log('✅ APPOINTMENT DELETE SUCCESS!')
      console.log('All CRUD operations working correctly!')
    }).catch(error => {
      console.log('❌ Error during appointment operations:', error.code, error.message)
      console.log('Full error:', error)
    })
  }
} else {
  console.log('\n❌ Cannot run tests without Firebase instances')
  console.log('💡 Please follow the instructions above to access Firebase')
}

console.log('\n🧪 Test script completed.')
console.log('💡 If you get Firebase instances working, the tests will run automatically!')
console.log('💡 Check the console above for instructions on how to access Firebase.')


