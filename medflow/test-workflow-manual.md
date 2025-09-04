# Manual End-to-End Workflow Testing

## Test 5.2: Complete Patient Management Workflow

### Scenario: Create a new patient and schedule an appointment

#### Step 1: Access the Application
1. Start the development server: `npm run dev`
2. Navigate to the calendar/appointment page
3. Click "New Appointment" or similar button

#### Step 2: Test Patient Search (Existing Patient)
1. In the patient search field, type: "John"
2. **Expected**: Should show existing patients named John
3. Select an existing patient
4. **Expected**: Should display "Pacient selectat: John [LastName]"

#### Step 3: Test Patient Creation (New Patient)
1. Click "Pacient Nou" button
2. Fill in the form:
   - **First Name**: "Maria"
   - **Last Name**: "Popescu"
   - **CNP**: "2850515000000"
   - **Email**: "maria.popescu@example.com"
   - **Phone**: "+40712345678"
3. **Expected**: 
   - Gender should auto-fill as "female" (from CNP)
   - Birth date should auto-fill as "1985-05-15" (from CNP)
4. Click "Create Patient"
5. **Expected**: Patient should be created and selected

#### Step 4: Test Appointment Creation
1. With patient selected, fill appointment details:
   - **Date & Time**: Select future date/time
   - **Symptoms**: "Headache and fever"
   - **Notes**: "Patient reports symptoms for 2 days"
2. Click "Create Appointment"
3. **Expected**: 
   - Appointment should be created
   - Should link to the selected patient
   - Should show success message

#### Step 5: Verify Data Persistence
1. Refresh the page
2. Navigate to patients list
3. **Expected**: Should see the newly created patient
4. Navigate to appointments
5. **Expected**: Should see the newly created appointment with patient link

### Success Criteria:
- ✅ Patient search works
- ✅ Patient creation works with CNP auto-fill
- ✅ Appointment creation works
- ✅ Data persists after page refresh
- ✅ Patient and appointment are linked
- ✅ No console errors
- ✅ All forms validate correctly

### Common Issues to Check:
- ❌ CNP not auto-filling gender/birth date
- ❌ Patient not being created
- ❌ Appointment not linking to patient
- ❌ Data not persisting
- ❌ Validation errors not working
- ❌ Firebase connection issues
