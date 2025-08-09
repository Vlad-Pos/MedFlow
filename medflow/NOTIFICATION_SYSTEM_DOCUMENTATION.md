# MedFlow Notification System Documentation

## Overview

The MedFlow notification system provides comprehensive appointment reminder functionality with multi-channel delivery, GDPR compliance, and Romanian localization. The system automatically schedules and sends appointment confirmations according to medical practice standards while respecting patient preferences and consent.

## Features

### Core Functionality
- **Multi-channel notifications**: Email, SMS, and in-app notifications
- **Automated scheduling**: 9 AM day before appointment and 3 PM same day
- **Patient preferences management**: Comprehensive UI for channel selection and consent
- **GDPR compliance**: Full consent tracking and withdrawal capabilities
- **Romanian localization**: All templates and messages in Romanian
- **Delivery tracking**: Complete audit trail of notification attempts and status
- **Error handling**: Robust retry mechanisms and failure notifications

### Notification Timing Rules
1. **First notification**: Sent at 9:00 AM, one day before the appointment
2. **Second notification**: Sent at 3:00 PM on the day of the appointment
3. **Maximum notifications**: Limited to 2 per appointment
4. **Smart skipping**: If patient confirms after first notification, second is automatically cancelled

## Architecture

### Data Models

#### Patient Notification Preferences (`PatientNotificationPreferences`)
```typescript
interface PatientNotificationPreferences {
  patientId: string
  email?: string
  phoneNumber?: string // Romanian format: +40XXXXXXXXX
  channels: {
    email: { enabled: boolean; verified: boolean }
    sms: { enabled: boolean; verified: boolean }
    inApp: { enabled: boolean }
  }
  language: 'ro' | 'en'
  timing: NotificationTiming
  gdprConsent: GDPRConsent
  globalOptOut: boolean
}
```

#### GDPR Consent Tracking (`GDPRConsent`)
```typescript
interface GDPRConsent {
  dataProcessing: boolean          // Required
  appointmentReminders: boolean    // Required for notifications
  marketingCommunications: boolean // Optional
  analytics: boolean              // Optional
  consentDate: Timestamp
  withdrawn?: boolean
  withdrawalDate?: Timestamp
}
```

#### Enhanced Appointment Model (`AppointmentWithNotifications`)
```typescript
interface AppointmentWithNotifications {
  // Standard appointment fields
  id: string
  patientName: string
  patientEmail?: string
  patientPhone?: string
  dateTime: Date | Timestamp
  
  // Notification tracking
  notifications: {
    firstNotification: {
      sent: boolean
      sentAt?: Timestamp
      channel?: NotificationChannel
      deliveryStatus?: 'delivered' | 'failed' | 'pending'
    }
    secondNotification: { ... }
    confirmationReceived: boolean
    confirmationDate?: Timestamp
    optedOut: boolean
  }
}
```

### Services

#### 1. Patient Notification Preferences Service (`NotificationPreferencesService`)
**Location**: `src/services/notificationPreferences.ts`

**Key Methods**:
- `getPatientPreferences(patientId)`: Retrieve patient preferences
- `upsertPatientPreferences(preferences)`: Create or update preferences
- `updateGDPRConsent(patientId, consent)`: Update consent settings
- `withdrawGDPRConsent(patientId, reason)`: Handle consent withdrawal
- `canReceiveNotifications(patientId)`: Check notification eligibility

**GDPR Compliance Features**:
- Explicit consent tracking for all processing activities
- Consent withdrawal with immediate effect
- Data minimization (only store necessary contact information)
- Audit trail for all consent changes

#### 2. Notification Scheduler Service (`NotificationSchedulerService`)
**Location**: `src/services/notificationScheduler.ts`

**Key Methods**:
- `scheduleAppointmentNotifications(appointment)`: Schedule notifications for new appointment
- `rescheduleAppointmentNotifications(appointmentId, newDateTime)`: Update notification timing
- `cancelAppointmentNotifications(appointmentId)`: Cancel pending notifications
- `executePendingNotifications()`: Process ready notifications (called by scheduler)

**Timing Logic**:
- Calculates optimal delivery times based on appointment date/time
- Respects Romanian business hours and practices
- Handles edge cases (past appointments, same-day bookings)
- Exponential backoff retry mechanism

#### 3. Notification Sender Service (`NotificationSenderService`)
**Location**: `src/services/notificationSender.ts`

**Key Methods**:
- `sendAppointmentNotification(appointment, channel, type)`: Send notification via specified channel
- `sendTestNotification(channel, recipient)`: Test notification delivery
- Template processing with placeholder replacement

**Channel Implementation**:
- **Email**: Integration-ready for SendGrid, AWS SES, or similar services
- **SMS**: Integration-ready for Twilio, Vonage, or Romanian SMS providers
- **In-app**: Creates notification records in Firestore

## Romanian Notification Templates

### First Notification (Day Before)
```
Subject: Confirmare programare - {clinicName}

Bună ziua {patientName},

Vă reamintim despre programarea dumneavoastră de mâine:

📅 Data și ora: {appointmentDate} la {appointmentTime}
🏥 Clinica: {clinicName}
📍 Adresa: {clinicAddress}
👨‍⚕️ Doctor: {doctorName}

Pentru a confirma prezența, accesați linkul de mai jos:
{confirmationLink}

Dacă doriți să reprogramați sau să anulați, vă rugăm să ne contactați.

Vă mulțumim!
Echipa {clinicName}
```

### Second Notification (Same Day)
```
Subject: Ultimă reamintire - Programarea de astăzi la {clinicName}

Bună ziua {patientName},

Aceasta este ultima reamintire pentru programarea dumneavoastră de astăzi:

📅 Data și ora: ASTĂZI la {appointmentTime}
🏥 Clinica: {clinicName}

Vă rugăm să confirmați prezența urgent:
{confirmationLink}

Ne vedem în curând!
Echipa {clinicName}
```

## User Interface Components

### 1. Notification Preferences Component (`NotificationPreferences.tsx`)
**Location**: `src/components/NotificationPreferences.tsx`

**Features**:
- Contact information management (email, phone)
- Channel selection with verification status
- GDPR consent management with clear explanations
- Real-time validation with Romanian error messages
- Mobile-responsive design

**Usage**:
```tsx
<NotificationPreferences 
  patientId="patient-email@example.com"
  onSaved={(preferences) => console.log('Saved:', preferences)}
/>
```

### 2. Notification Status Component (`NotificationStatus.tsx`)
**Location**: `src/components/NotificationStatus.tsx`

**Features**:
- Visual status indicators for notification delivery
- Expandable details with delivery timestamps
- Patient response tracking
- Error message display
- Action buttons for resending notifications

**Usage**:
```tsx
<NotificationStatus 
  appointment={appointmentWithNotifications}
  compact={false}
/>
```

### 3. Enhanced Appointment Form
**Location**: `src/components/AppointmentForm.tsx`

**New Features**:
- Patient email and phone number fields
- Automatic notification scheduling on appointment creation
- Notification rescheduling on appointment updates
- Integration with notification preferences validation

## Database Schema

### Collections

#### `patientNotificationPreferences`
```
{
  patientId: string (document ID)
  email?: string
  phoneNumber?: string
  channels: {
    email: { enabled: boolean, verified: boolean, verificationDate?: timestamp }
    sms: { enabled: boolean, verified: boolean, verificationDate?: timestamp }
    inApp: { enabled: boolean }
  }
  language: 'ro' | 'en'
  gdprConsent: {
    dataProcessing: boolean
    appointmentReminders: boolean
    marketingCommunications: boolean
    analytics: boolean
    consentDate: timestamp
    consentVersion: string
    withdrawn?: boolean
    withdrawalDate?: timestamp
  }
  globalOptOut: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `notificationSchedulerJobs`
```
{
  appointmentId: string
  notificationType: 'first' | 'second'
  scheduledFor: timestamp
  executeAt: timestamp
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'cancelled'
  retryCount: number
  maxRetries: number
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `notificationDeliveryStatus`
```
{
  appointmentId: string
  channel: 'email' | 'sms' | 'in_app'
  status: 'pending' | 'sent' | 'delivered' | 'failed'
  attemptNumber: number
  recipientEmail?: string
  recipientPhone?: string
  errorMessage?: string
  providerMessageId?: string
  createdAt: timestamp
  deliveredAt?: timestamp
}
```

#### Enhanced `appointments` collection
```
{
  // Existing fields...
  patientEmail?: string
  patientPhone?: string
  
  notifications: {
    firstNotification: {
      sent: boolean
      sentAt?: timestamp
      channel?: string
      deliveryStatus?: string
      errorMessage?: string
    }
    secondNotification: { ... }
    confirmationReceived: boolean
    confirmationDate?: timestamp
    confirmationMethod?: string
    optedOut: boolean
    optOutDate?: timestamp
  }
}
```

## GDPR Compliance

### Legal Requirements Met

1. **Lawful Basis for Processing**
   - Legitimate interest for appointment management
   - Explicit consent for marketing communications
   - Performance of contract for medical services

2. **Data Subject Rights**
   - ✅ Right to access (view preferences)
   - ✅ Right to rectification (edit preferences)
   - ✅ Right to erasure (account deletion)
   - ✅ Right to withdraw consent (opt-out functionality)
   - ✅ Right to data portability (export functionality ready)

3. **Consent Management**
   - Granular consent options for different processing purposes
   - Clear and plain language in Romanian
   - Easy withdrawal mechanism
   - Consent versioning and audit trail
   - Separate consent for marketing vs. essential communications

4. **Data Protection Measures**
   - Data minimization (only collect necessary information)
   - Purpose limitation (clear purpose for each data collection)
   - Storage limitation (automatic cleanup of old notification jobs)
   - Security measures (Firebase security rules, input validation)

### GDPR Compliance Checklist

- [x] **Privacy Notice**: Clear explanation of data processing
- [x] **Consent Mechanisms**: Granular consent options
- [x] **Opt-out Functionality**: Easy withdrawal of consent
- [x] **Data Access**: Patients can view their preferences
- [x] **Data Rectification**: Patients can update their information
- [x] **Data Deletion**: Account deletion removes all data
- [x] **Audit Trail**: All consent changes are logged
- [x] **Data Minimization**: Only essential data is collected
- [x] **Security**: Proper access controls and validation

## Integration Guide

### Setting Up Email Notifications

1. **Choose Email Provider** (SendGrid, AWS SES, etc.)
2. **Update Configuration**:
   ```typescript
   // In notificationSender.ts
   const emailConfig = {
     apiKey: process.env.SENDGRID_API_KEY,
     fromEmail: 'noreply@medflow.ro',
     fromName: 'MedFlow'
   }
   ```

3. **Replace Mock Implementation**:
   ```typescript
   // Replace simulation code with actual service calls
   const result = await sendgrid.send({
     to: recipientEmail,
     from: emailConfig.fromEmail,
     subject,
     html: body
   })
   ```

### Setting Up SMS Notifications

1. **Choose SMS Provider** (Twilio, Vonage, etc.)
2. **Configure Romanian SMS Gateway**
3. **Update SMS Implementation**:
   ```typescript
   // In notificationSender.ts
   const smsResult = await twilioClient.messages.create({
     body: smsText,
     from: '+40123456789', // Your Twilio number
     to: recipientPhone
   })
   ```

### Scheduler Deployment

The notification scheduler requires a cron job or cloud function to execute pending notifications:

```typescript
// Cloud Function example
export const executeNotifications = functions.pubsub
  .schedule('every 15 minutes')
  .onRun(async (context) => {
    await NotificationSchedulerService.executePendingNotifications()
  })
```

## Testing

### Unit Tests
- Validation functions for all form inputs
- GDPR consent logic
- Notification timing calculations
- Template placeholder replacement

### Integration Tests
- End-to-end notification flow
- Database operations
- Error handling scenarios
- GDPR compliance workflows

### Test Scenarios
1. **Happy Path**: Patient with all channels enabled receives notifications
2. **Partial Setup**: Patient with only email enabled
3. **Opt-out**: Patient withdraws consent
4. **Network Failures**: Service unavailable scenarios
5. **Invalid Data**: Malformed email/phone numbers
6. **Late Booking**: Same-day appointment scheduling

## Monitoring and Analytics

### Key Metrics to Track
- Notification delivery rates by channel
- Patient confirmation rates
- Opt-out rates and reasons
- System error rates
- Average delivery times

### Logging
All notification activities are logged with:
- Timestamp and patient ID (hashed for privacy)
- Delivery status and channel
- Error messages (without personal data)
- Performance metrics

## Security Considerations

### Data Protection
- All personal data encrypted at rest and in transit
- Access controls via Firebase security rules
- Input validation and sanitization
- Rate limiting on notification sending

### Privacy Measures
- Patient IDs are hashed in logs
- Email addresses stored only with explicit consent
- Phone numbers validated and formatted consistently
- Automatic cleanup of old notification records

## Future Enhancements

### Planned Features
1. **Smart Timing**: AI-powered optimal delivery time suggestions
2. **Advanced Templates**: Rich HTML email templates
3. **Multi-language**: Support for additional languages
4. **Push Notifications**: Mobile app integration
5. **Voice Calls**: Automated voice reminder option
6. **Analytics Dashboard**: Comprehensive reporting interface

### Technical Improvements
1. **Performance**: Notification batching and bulk operations
2. **Reliability**: Dead letter queue for failed notifications
3. **Scalability**: Message queue integration (RabbitMQ, etc.)
4. **Monitoring**: Real-time dashboard with Grafana/DataDog

## Support and Maintenance

### Regular Tasks
- Monitor delivery rates and success metrics
- Update notification templates for seasonal content
- Review and update GDPR compliance measures
- Clean up old notification scheduler jobs
- Update contact verification processes

### Troubleshooting Guide
1. **Notifications not sending**: Check scheduler job status and patient preferences
2. **Delivery failures**: Verify email/SMS provider configuration
3. **GDPR compliance issues**: Review consent audit trail
4. **Performance problems**: Check database query performance and indexes

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Next Review**: March 2025  

For technical support or questions about the notification system, contact the MedFlow development team.
