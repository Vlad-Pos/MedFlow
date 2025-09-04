# Manual UI Component Testing Guide

## Test 3.2: Manual UI Testing

### Step 1: Start Development Server
```bash
npm run dev
```

### Step 2: Test Patient Search Component
1. Navigate to the appointment form
2. Look for the patient search input
3. **Test Cases:**
   - Type a patient name → Should show search results
   - Type a CNP → Should show matching patient
   - Type an email → Should show matching patient
   - Clear the search → Should clear selection
   - Select a patient → Should display "Pacient selectat: [Name]"

### Step 3: Test Patient Creation Form
1. Click "Pacient Nou" button
2. **Test Cases:**
   - Enter valid patient data → Should create patient
   - Enter CNP → Should auto-fill gender and birth date
   - Leave required fields empty → Should show validation errors
   - Enter invalid email → Should show email validation error
   - Enter invalid phone → Should show phone validation error

### Step 4: Test Enhanced Appointment Form
1. **Test Cases:**
   - Select existing patient → Should populate patient info
   - Create new patient → Should create and select patient
   - Fill appointment details → Should validate required fields
   - Submit form → Should create appointment with patient link

### Expected Results:
- ✅ All components render without errors
- ✅ Patient search works correctly
- ✅ CNP auto-fills gender and birth date
- ✅ Form validation shows appropriate errors
- ✅ Patient creation works
- ✅ Appointment creation links to patient

### Common Issues to Check:
- ❌ Components not rendering
- ❌ Search not working
- ❌ CNP not auto-filling data
- ❌ Validation errors not showing
- ❌ Form submission failing
