# MedFlow Utilities

This directory contains centralized utility functions organized by functionality for the MedFlow application.

## 📁 **Module Structure**

### **Core Utilities**
- **`dateUtils.ts`** - Date formatting and manipulation utilities
- **`validation.ts`** - Form validation and field validation utilities
- **`errorHandling.ts`** - Error handling and error boundary utilities
- **`performance.ts`** - Performance optimization utilities
- **`animations.ts`** - Animation and transition utilities
- **`responsive.ts`** - Responsive design utilities
- **`formatNumbers.ts`** - Number formatting utilities
- **`fetchData.ts`** - Data fetching and API utilities
- **`i18n.ts`** - Internationalization utilities

### **New Modular Utilities**
- **`patientUtils.ts`** - Patient-specific utility functions
- **`timeUtils.ts`** - Time-related utility functions
- **`medicalUtils.ts`** - Medical and healthcare utility functions

## 🚀 **Usage Examples**

### **Patient Utilities**
```typescript
import { calculateAge, formatLastVisit, validatePatientData } from '../utils/patientUtils'

// Calculate patient age
const age = calculateAge('1985-03-15')

// Format last visit in relative terms
const lastVisit = formatLastVisit(new Date('2024-01-15'))

// Validate patient data
const validation = validatePatientData({
  firstName: 'Ana',
  lastName: 'Popescu',
  dateOfBirth: '1985-03-15'
})
```

### **Time Utilities**
```typescript
import { formatTimeAgo, formatTimestamp, getTimeDifference } from '../utils/timeUtils'

// Format time ago in Romanian
const timeAgo = formatTimeAgo(new Date('2024-01-15'))

// Format timestamp
const formatted = formatTimestamp(1705315200000)

// Get time difference
const diff = getTimeDifference(startDate, endDate)
```

### **Medical Utilities**
```typescript
import { 
  getAppointmentStatusColor, 
  validateAppointmentData,
  calculatePatientRiskScore 
} from '../utils/medicalUtils'

// Get status color for UI
const color = getAppointmentStatusColor('confirmed')

// Validate appointment data
const validation = validateAppointmentData({
  patientName: 'Ana Popescu',
  dateTime: '2024-02-01T10:00',
  duration: 60
})

// Calculate risk score
const riskScore = calculatePatientRiskScore(45, ['diabetes', 'hypertension'])
```

## 🔧 **Import Patterns**

### **Individual Imports (Recommended)**
```typescript
import { calculateAge } from '../utils/patientUtils'
import { formatTimeAgo } from '../utils/timeUtils'
import { getAppointmentStatusColor } from '../utils/medicalUtils'
```

### **Barrel Exports (Available)**
```typescript
import { calculateAge, formatTimeAgo, getAppointmentStatusColor } from '../utils'
```

## 📋 **Function Categories**

### **Patient Management**
- Age calculations
- Visit formatting
- Patient data validation
- Patient ID generation
- Name formatting

### **Time & Date**
- Relative time formatting
- Timestamp formatting
- Time difference calculations
- Time string conversions
- Recent time checking

### **Medical & Healthcare**
- Appointment status colors
- Urgency level colors
- Alert type icons
- Duration calculations
- Medical data validation
- Risk scoring
- Romanian medical terminology

## 🎯 **Benefits of Centralization**

1. **Code Reusability** - Functions available across all components
2. **Maintainability** - Single source of truth for utility functions
3. **Consistency** - Standardized behavior across the application
4. **Testing** - Easier to test utility functions in isolation
5. **Performance** - Reduced bundle size through tree shaking
6. **Documentation** - Centralized documentation and examples

## 🚨 **Important Notes**

- **All utility functions preserve exact behavior** from original implementations
- **No breaking changes** to existing functionality
- **Type safety maintained** with full TypeScript support
- **Romanian language support** for medical applications
- **Medical-grade quality standards** maintained throughout

## 🔄 **Migration Guide**

If you have utility functions scattered in components:

1. **Identify the function** and its purpose
2. **Choose appropriate module** (patient, time, medical, or core)
3. **Move function** to the appropriate utility file
4. **Update imports** in the component
5. **Test functionality** to ensure no changes in behavior
6. **Remove old function** from component

## 📚 **Related Documentation**

- **`BRAND_IDENTITY.md`** - Brand guidelines and colors
- **`DEVELOPMENT_GUIDE.md`** - Technical standards and architecture
- **`FEATURES_DOCUMENTATION.md`** - Feature implementation guides
