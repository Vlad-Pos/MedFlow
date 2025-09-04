# MedFlow Secure Appointment Links & Rescheduling System

## Overview

The secure appointment links system provides time-limited, cryptographically secure confirmation and decline links that enable patients to interact with their appointments while maintaining data security and preventing unauthorized access. The system includes real-time appointment status updates and a comprehensive rescheduling interface.

## Features

### Core Security Features
- **Cryptographically secure tokens** with time-based expiration
- **Single-use links** that become invalid after use
- **IP address and user agent tracking** for audit purposes
- **Automatic cleanup** of expired links
- **Tamper-proof link validation** with comprehensive error handling

### Patient Response Handling
- **Instant confirmation** updates appointment status across all interfaces
- **Decline with rescheduling** presents available slot interface
- **Real-time sync** using Firebase for immediate dashboard updates
- **Comprehensive audit trail** for all patient interactions

### Rescheduling Interface
- **Real-time slot availability** based on doctor's current schedule
- **Romanian business hours** and medical practice considerations
- **Same-day booking** only if slots are available
- **User-friendly interface** with responsive design
- **Reason tracking** for rescheduling requests

## Architecture

### Service Layer

#### 1. Appointment Links Service (`AppointmentLinksService`)
**Location**: `src/services/appointmentLinks.ts`

**Core Functions**:
```typescript
// Generate secure links
generateAppointmentLinks(appointmentId, patientEmail, expiryHours): Promise<{
  confirmLink: string
  declineLink: string
  confirmToken: string
  declineToken: string
}>

// Validate link security
validateAppointmentLink(token): Promise<LinkValidationResult>

// Process confirmations
confirmAppointment(token, metadata): Promise<{ success: boolean; appointment?: Appointment }>

// Handle declines
declineAppointment(token, metadata): Promise<{ success: boolean; requiresRescheduling: boolean }>

// Reschedule appointments
rescheduleAppointment(appointmentId, newDateTime, reason, metadata): Promise<{ success: boolean }>
```

**Security Features**:
- **Token Generation**: Cryptographically secure random tokens with timestamp and appointment ID
- **Expiration Handling**: Default 72-hour expiration with configurable duration
- **Single-Use Protection**: Links become invalid after first use
- **Tamper Detection**: Validation checks for token integrity and appointment status
- **Audit Logging**: Complete trail of all patient interactions

#### 2. Available Slots Service (`AvailableSlotsService`)
**Location**: `src/services/availableSlots.ts`

**Core Functions**:
```typescript
// Get available slots for date range
getAvailableSlots(options: SlotAvailabilityOptions): Promise<AvailableSlot[]>

// Check specific slot availability
isSlotAvailable(doctorId, datetime, excludeAppointmentId?): Promise<boolean>

// Get today's available slots
getTodayAvailableSlots(doctorId): Promise<AvailableSlot[]>

// Get recommended slots
getRecommendedSlots(doctorId, patientEmail?, maxRecommendations?): Promise<AvailableSlot[]>
```

**Romanian Medical Practice Integration**:
- **Working Hours**: Default 8:00 AM - 6:00 PM, Monday-Friday
- **Lunch Break**: Configurable lunch break (default 12:00-13:00)
- **Slot Duration**: 30-minute appointments with 15-minute buffer
- **Advance Booking**: Maximum 90 days in advance
- **Same-Day Booking**: Available if slots remain and current time allows

### Frontend Components

#### 3. Appointment Response Page (`AppointmentResponse.tsx`)
**Location**: `src/pages/AppointmentResponse.tsx`

**Key Features**:
- **Link Validation**: Real-time token verification with user feedback
- **Status Display**: Clear appointment information and current status
- **Confirmation Flow**: One-click appointment confirmation
- **Rescheduling Interface**: Interactive slot selection with visual indicators
- **Error Handling**: Comprehensive error states for expired/invalid links
- **Romanian Localization**: All text and messages in Romanian

**User Flow**:
1. Patient clicks email/SMS link
2. System validates token and shows appointment details
3. For confirmation: Single click updates status immediately
4. For decline: Shows available slots for rescheduling
5. Patient selects new slot and optionally provides reason
6. System updates appointment and sends notifications

## Data Models

### Secure Link Storage (`appointmentLinks` collection)
```typescript
interface AppointmentLink {
  id: string              // Token used as document ID
  appointmentId: string   // Reference to appointment
  type: 'confirm' | 'decline'
  token: string          // Secure token
  expiresAt: Timestamp   // Link expiration
  used: boolean          // Single-use tracking
  usedAt?: Timestamp     // Usage timestamp
  patientEmail?: string  // Patient identifier
  createdAt: Timestamp   // Creation tracking
  ipAddress?: string     // Security metadata
  userAgent?: string     // Browser information
}
```

### Patient Response Audit (`patientResponses` collection)
```typescript
interface PatientResponse {
  appointmentId: string
  action: 'confirmed' | 'declined' | 'rescheduled'
  timestamp: Timestamp
  newDateTime?: Date     // For rescheduling
  reason?: string        // Rescheduling reason
  ipAddress?: string     // Security audit
  userAgent?: string     // Browser tracking
}
```

### Available Slot Information
```typescript
interface AvailableSlot {
  datetime: Date
  duration: number       // minutes
  available: boolean
  reason?: string        // why not available
  displayText: string    // Romanian formatted display
  isPeak: boolean        // busy time indicator
}
```

### Doctor Schedule Configuration
```typescript
interface DoctorSchedule {
  doctorId: string
  workingDays: number[]  // 1-7, Monday to Sunday
  workingHours: {
    start: string        // "08:00"
    end: string         // "18:00"
    lunchBreak?: {
      start: string      // "12:00"
      end: string       // "13:00"
    }
  }
  slotDuration: number   // minutes, default 30
  bufferTime: number     // minutes between appointments
  maxAdvanceBooking: number // days, default 90
}
```

## Real-Time Synchronization

### Firebase Integration
The system leverages Firebase Firestore's real-time capabilities to ensure appointment status changes are immediately reflected across all interfaces:

**Appointment Status Updates**:
```typescript
// Confirmation updates
await updateDoc(appointmentRef, {
  status: 'confirmed',
  'notifications.confirmationReceived': true,
  'notifications.confirmationDate': serverTimestamp(),
  'notifications.confirmationMethod': 'email_link'
})

// Rescheduling updates  
await updateDoc(appointmentRef, {
  dateTime: Timestamp.fromDate(newDateTime),
  status: 'scheduled',
  'notifications.rescheduledAt': serverTimestamp(),
  'notifications.rescheduleReason': reason
})
```

**Real-Time Listeners**:
- Dashboard components automatically receive appointment updates
- Calendar views refresh with new status indicators
- Notification system cancels pending reminders for confirmed appointments

## Security Considerations

### Link Security
1. **Token Generation**: 
   - Cryptographically secure random tokens
   - Timestamp-based components for uniqueness
   - Appointment ID binding for validation

2. **Expiration Management**:
   - Default 72-hour expiration (configurable)
   - Automatic cleanup of expired links
   - Grace period handling for timezone differences

3. **Usage Protection**:
   - Single-use enforcement with database tracking
   - Tamper detection through token validation
   - Audit logging for security monitoring

### Data Protection
1. **Personal Data Minimization**:
   - Only store necessary patient contact information
   - Automatic cleanup of old response records
   - Anonymized logging for audit purposes

2. **Access Control**:
   - Public routes for link access (no authentication required)
   - Validation ensures only valid tokens can access data
   - IP address logging for security audit trails

## Integration with Notification System

### Automatic Link Generation
When notifications are sent, the system automatically generates secure links:

```typescript
// In NotificationSenderService
const links = await AppointmentLinksService.generateAppointmentLinks(
  appointment.id,
  appointment.patientEmail,
  72 // 3 days expiry
)

// Links are embedded in notification templates
const confirmationLink = links.confirmLink
const declineLink = links.declineLink
```

### Notification Template Integration
Romanian notification templates include both confirmation and decline options:

```
Pentru a confirma prezența: {confirmationLink}
Pentru a reprograma: {declineLink}
```

### Status Synchronization
Patient responses automatically update the notification system:

- **Confirmation**: Cancels pending second notification
- **Decline**: Triggers rescheduling flow but maintains notification preferences
- **Rescheduling**: Generates new notification schedule for updated appointment time

## Error Handling

### Link Validation Errors
```typescript
interface LinkValidationResult {
  valid: boolean
  expired: boolean
  used: boolean
  appointment?: AppointmentWithNotifications
  error?: string
}
```

**Error States**:
- **Invalid Token**: Link doesn't exist or is malformed
- **Expired Link**: Past expiration time with contact information
- **Already Used**: Link has been used previously
- **Appointment Not Found**: Referenced appointment no longer exists
- **Status Conflict**: Appointment is no longer in valid state for response

### User-Friendly Error Messages
All error messages are provided in Romanian with clear instructions:

- **Expired**: "Acest link a expirat. Pentru a confirma programarea, vă rugăm să contactați direct clinica."
- **Used**: "Acest link a fost deja utilizat. Dacă aveți întrebări, contactați clinica."
- **Invalid**: "Link invalid sau inexistent. Verificați linkul primit prin email/SMS."

### Fallback Handling
- **Service Unavailable**: Graceful degradation with contact information
- **Network Issues**: Retry mechanisms with user feedback
- **Slot Conflicts**: Real-time validation with alternative suggestions

## Monitoring and Analytics

### Key Metrics
- **Link Generation Rate**: Number of links created per day
- **Response Rate**: Percentage of patients who respond to links
- **Confirmation Rate**: Percentage of confirmations vs. declines
- **Rescheduling Rate**: Frequency of appointment changes
- **Link Expiration Rate**: Links that expire without use
- **Error Rate**: Failed validations and system errors

### Audit Logging
All patient interactions are logged for security and analytics:
```typescript
interface PatientResponse {
  appointmentId: string
  action: 'confirmed' | 'declined' | 'rescheduled'
  timestamp: Timestamp
  ipAddress?: string      // Anonymized for privacy
  userAgent?: string      // Browser/device information
  newDateTime?: Date      // For rescheduling
  reason?: string         // Patient-provided reason
}
```

## Development and Testing

### Testing Scenarios
1. **Happy Path**: Patient confirms appointment via email link
2. **Rescheduling Flow**: Patient declines and selects new slot
3. **Security Tests**: Invalid/expired/tampered links
4. **Concurrent Access**: Multiple patients accessing same slots
5. **Edge Cases**: Same-day appointments, weekend bookings, holidays

### Local Development Setup
```bash
# Start Firebase emulator for testing
firebase emulators:start

# Run with test appointment data
npm run dev -- --test-links=true
```

### Integration Testing
```typescript
// Example test for link validation
test('should validate secure appointment link', async () => {
  const links = await AppointmentLinksService.generateAppointmentLinks(
    'test-appointment-id',
    'patient@example.com'
  )
  
  const validation = await AppointmentLinksService.validateAppointmentLink(
    links.confirmToken
  )
  
  expect(validation.valid).toBe(true)
  expect(validation.appointment).toBeDefined()
})
```

## Production Deployment

### Environment Configuration
```env
# Base URLs for link generation
REACT_APP_BASE_URL=https://medflow.ro
REACT_APP_APPOINTMENT_RESPONSE_URL=https://medflow.ro/appointment-response

# Security settings
APPOINTMENT_LINK_EXPIRY_HOURS=72
APPOINTMENT_LINK_CLEANUP_DAYS=30

# Monitoring
LINK_ANALYTICS_ENABLED=true
AUDIT_LOGGING_LEVEL=info
```

### Cloud Function Deployment
```typescript
// Scheduled cleanup function
export const cleanupExpiredLinks = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    await AppointmentLinksService.cleanupExpiredLinks()
  })
```

### Database Indexes
Required Firestore indexes for optimal performance:
```
appointmentLinks:
- expiresAt (ascending)
- used (ascending) + expiresAt (ascending)
- appointmentId (ascending)

appointments:
- doctorId (ascending) + dateTime (ascending) + status (ascending)
- status (ascending) + dateTime (ascending)
```

## Future Enhancements

### Planned Features
1. **SMS Fallback Links**: Shorter links for SMS notifications
2. **Calendar Integration**: iCal/Google Calendar event updates
3. **Multi-Language**: Support for English and other languages
4. **Advanced Analytics**: Patient behavior analysis and optimization
5. **API Webhooks**: Integration with external systems

### Security Enhancements
1. **Two-Factor Verification**: Optional SMS verification for rescheduling
2. **Rate Limiting**: Prevent abuse of link generation
3. **Geographic Restrictions**: IP-based access controls
4. **Advanced Encryption**: JWT tokens with signing and verification

## Support and Troubleshooting

### Common Issues
1. **Links Not Working**: Check expiration and Firebase connection
2. **Slot Conflicts**: Verify real-time slot calculation logic
3. **Missing Appointments**: Confirm appointment exists and status is valid
4. **Notification Integration**: Verify link generation in templates

### Debug Tools
```typescript
// Enable debug logging
localStorage.setItem('medflow-debug-links', 'true')

// Test link generation
AppointmentLinksService.generateAppointmentLinks('test-id', 'test@email.com')
  .then(links => console.log('Generated links:', links))
```

### Monitoring Dashboard
Key metrics to monitor in production:
- Link generation success rate
- Patient response rates by channel (email vs SMS)
- Average response time from link send to patient action
- Error rates by error type
- Slot availability accuracy

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Next Review**: March 2025

For technical support or questions about the secure links system, contact the MedFlow development team.
