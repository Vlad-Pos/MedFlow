# 🧪 **MANUAL TESTING GUIDE - MEDFLOW USER REGISTRATION & APPOINTMENT CREATION**

## **🎯 TESTING OBJECTIVE**

Verify that the complete user creation system works end-to-end and resolves all permission denied errors for appointment creation.

---

## **📋 PRE-TESTING SETUP**

### **Step 1: Clear Browser Data**
1. **Clear Authentication State**:
   - Sign out of any existing MedFlow account
   - Clear browser cookies and local storage for the MedFlow domain
   - Refresh the page to ensure clean state

2. **Verify Clean State**:
   - Navigate to `/calendar` page
   - Confirm no user is signed in
   - Check browser console for any existing authentication errors

### **Step 2: Start Development Server**
```bash
cd /Users/vladi/CursorProjects/MedFlow/medflow
npm run dev
```

3. **Verify Server Running**:
   - Navigate to `http://localhost:5173`
   - Confirm MedFlow loads without errors

---

## **🧪 TEST SCENARIO 1: NEW USER REGISTRATION**

### **Test Steps**
1. **Navigate to Sign Up Page**:
   - Go to `/signup` or click "Sign Up" button
   - Verify signup form loads correctly

2. **Fill Registration Form**:
   - **Display Name**: `Test User ${Date.now()}`
   - **Email**: `test-user-${Date.now()}@medflow-test.com`
   - **Password**: `TestPassword123!`
   - **Confirm Password**: `TestPassword123!`

3. **Submit Registration**:
   - Click "Sign Up" button
   - Monitor browser console for success messages

### **Expected Results**
- ✅ **Registration Success**: User account created successfully
- ✅ **Console Messages**:
  ```
  ✅ User document created successfully in Firestore
  ✅ User creation fully verified
  ```
- ✅ **Redirect**: User redirected to dashboard or calendar
- ✅ **No Errors**: No permission denied or Firebase errors

### **Success Indicators**
- [ ] Registration completes without errors
- [ ] User is signed in and redirected
- [ ] Console shows successful user document creation
- [ ] No Firebase permission errors

---

## **🧪 TEST SCENARIO 2: APPOINTMENT CREATION**

### **Test Steps**
1. **Navigate to Calendar**:
   - Go to `/calendar` page
   - Confirm user is signed in (check top navigation)

2. **Create New Appointment**:
   - Click "Programare Nouǎ" button
   - Verify modal opens correctly

3. **Fill Appointment Form**:
   - **Patient Name**: `Test Patient ${Date.now()}`
   - **CNP**: `1234567890123`
   - **Email**: `patient@test.com`
   - **Phone**: `0712345678`
   - **Date**: Tomorrow
   - **Start Time**: `10:00`
   - **End Time**: `11:00`
   - **Description**: `Test appointment for manual testing`

4. **Submit Appointment**:
   - Click "Create" or submit button
   - Monitor browser console for success messages

### **Expected Results**
- ✅ **Appointment Creation Success**: No permission denied errors
- ✅ **Console Messages**:
  ```
  🔍 Debug: Creating appointment with data: {patientName: "Test Patient...", ...}
  ✅ Appointment created successfully with ID: [generated-id]
  ```
- ✅ **Calendar Update**: Appointment appears in calendar
- ✅ **Enhanced Display**: Patient information visible in day view

### **Success Indicators**
- [ ] Appointment creation completes without errors
- [ ] No "permission denied" or Firebase errors
- [ ] Appointment appears in calendar immediately
- [ ] Enhanced patient information displays correctly

---

## **🧪 TEST SCENARIO 3: ENHANCED DISPLAY VERIFICATION**

### **Test Steps**
1. **View Day View**:
   - Switch to Day view in calendar
   - Locate the created appointment

2. **Verify Enhanced Information**:
   - Check if appointment shows enhanced patient details
   - Verify CNP, Email, Phone, and Birth Date are visible

3. **Open Event Detail Modal**:
   - Click on the appointment card
   - Verify modal opens with comprehensive patient information

### **Expected Results**
- ✅ **Day View Enhancement**: Patient information visible in day view
- ✅ **Modal Enhancement**: Comprehensive patient details in modal
- ✅ **Data Accuracy**: All entered information displays correctly

### **Success Indicators**
- [ ] Day view shows enhanced patient information
- [ ] Event modal displays all patient fields
- [ ] Week/Month views remain unchanged
- [ ] All patient data is accurate and complete

---

## **🧪 TEST SCENARIO 4: DATA PERSISTENCE VERIFICATION**

### **Test Steps**
1. **Navigate Away and Return**:
   - Go to different pages (Dashboard, Appointments, etc.)
   - Return to calendar page
   - Verify appointment still visible

2. **Page Refresh Test**:
   - Refresh the browser page
   - Verify appointment persists
   - Check all patient information intact

3. **Firebase Console Verification**:
   - Open Firebase Console
   - Navigate to Firestore Database
   - Check `appointments` collection for new document
   - Verify `users` collection has user document

### **Expected Results**
- ✅ **Navigation Persistence**: Appointment visible across page navigation
- ✅ **Refresh Persistence**: Appointment survives page refresh
- ✅ **Firebase Persistence**: Document exists in Firestore
- ✅ **Data Integrity**: All patient information maintained

### **Success Indicators**
- [ ] Appointment persists across navigation
- [ ] Appointment survives page refresh
- [ ] Firebase document exists and is correct
- [ ] All patient data is intact

---

## **🚨 TROUBLESHOOTING COMMON ISSUES**

### **Issue 1: Still Getting Permission Denied**
**Symptoms**: Firebase permission denied errors persist
**Possible Causes**:
- User document not created during signup
- Role assignment failed
- Permission assignment failed

**Debugging Steps**:
1. Check browser console for user creation messages
2. Verify user document exists in Firebase Console
3. Check user role and permissions in Firestore

**Solutions**:
1. Ensure user is properly signed up
2. Check if user document exists in `users` collection
3. Verify role is set to 'USER' and permissions are assigned

### **Issue 2: Appointment Not Appearing in Calendar**
**Symptoms**: Appointment creation succeeds but doesn't show in calendar
**Possible Causes**:
- Local state update failed
- Calendar filtering issues
- Display logic problems

**Debugging Steps**:
1. Check console for appointment creation success
2. Verify appointment exists in Firebase
3. Check calendar filtering logic

**Solutions**:
1. Refresh calendar view
2. Check appointment date/time settings
3. Verify calendar view mode (Day/Week/Month)

### **Issue 3: Enhanced Information Not Displaying**
**Symptoms**: Appointment shows but enhanced patient info missing
**Possible Causes**:
- Display components not updated
- Data mapping issues
- Component rendering problems

**Debugging Steps**:
1. Check if patient fields are saved in Firebase
2. Verify display components are updated
3. Check component props and data flow

**Solutions**:
1. Ensure all patient fields are filled during creation
2. Check if enhanced display components are implemented
3. Verify data mapping in calendar components

---

## **📊 TEST RESULTS DOCUMENTATION**

### **Test Execution Checklist**
- [ ] **User Registration**: ✅/❌
- [ ] **Appointment Creation**: ✅/❌
- [ ] **Enhanced Display**: ✅/❌
- [ ] **Data Persistence**: ✅/❌
- [ ] **No Permission Errors**: ✅/❌

### **Issues Found**
**Issue**: [Description]
**Severity**: High/Medium/Low
**Steps to Reproduce**: [Detailed steps]
**Expected vs Actual**: [What should happen vs what happened]

### **Overall Test Result**
- **Status**: ✅ PASSED / ❌ FAILED
- **Critical Issues**: [List any blocking issues]
- **Minor Issues**: [List any non-blocking issues]
- **Recommendations**: [Next steps or improvements]

---

## **🎯 SUCCESS CRITERIA**

### **Functional Requirements**
- [ ] New user registration creates complete user profile
- [ ] Appointment creation works without permission errors
- [ ] Enhanced patient information displays correctly
- [ ] Data persists across sessions and navigation

### **Technical Requirements**
- [ ] User documents created in Firestore during signup
- [ ] Role and permissions properly assigned
- [ ] No Firebase permission denied errors
- [ ] All TypeScript types properly defined

### **User Experience Requirements**
- [ ] Registration process is seamless
- [ ] Appointment creation is intuitive
- [ ] Enhanced information provides value
- [ ] No error messages or broken functionality

---

## **🚀 NEXT STEPS AFTER TESTING**

### **If All Tests Pass**
1. **Deploy to Production**: System is ready for production use
2. **User Training**: Train users on enhanced functionality
3. **Monitor Performance**: Track system performance and usage

### **If Tests Fail**
1. **Document Issues**: Record all problems found
2. **Debug Root Causes**: Investigate technical issues
3. **Implement Fixes**: Address identified problems
4. **Re-test**: Run tests again after fixes

---

**Status**: Ready for manual testing  
**Next Action**: Execute test scenarios in browser  
**Expected Outcome**: Complete user registration and appointment creation working without errors
