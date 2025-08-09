# MedFlow Patient Flagging System

## Overview

The Patient Flagging System is a comprehensive solution for automatically tracking and alerting medical professionals about patients who fail to respond to appointment notifications or exhibit problematic appointment behaviors. The system is designed with full GDPR compliance and Romanian medical practice requirements in mind.

## Core Features

### Automatic Patient Flagging
- **Intelligent Detection**: Automatically flags patients who don't respond to appointment confirmation notifications
- **Multiple Criteria**: Supports flagging for various reasons including no-shows, late cancellations, and non-response
- **Configurable Rules**: Doctors can customize flagging thresholds and criteria
- **Grace Periods**: Respects appropriate time windows before flagging patients

### Doctor Alert System
- **Real-Time Notifications**: Immediate alerts when patients are flagged
- **Severity Levels**: Different alert levels (info, warning, urgent) based on patient behavior
- **Action-Oriented**: Alerts include suggested actions and deadlines
- **Dashboard Integration**: Seamlessly integrated into the main dashboard

### Visual Patient Indicators
- **Color-Coded System**: Red highlighting for flagged patients in all views
- **Flag Counts**: Display number of flags next to patient names
- **Risk Levels**: Visual indicators for patient risk assessment
- **Tooltip Details**: Hover tooltips with flag history and statistics

### GDPR Compliance
- **Data Minimization**: Only stores necessary information for medical practice
- **Consent Tracking**: Comprehensive consent management system
- **Patient Rights**: Full implementation of GDPR patient rights
- **Audit Trails**: Complete logging of all flagging actions
- **Data Retention**: Automatic cleanup of expired flags

## System Architecture

### Data Models

#### PatientFlag
```typescript
interface PatientFlag {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  reason: FlagReason
  severity: FlagSeverity
  status: FlagStatus
  description: string
  appointmentId?: string
  appointmentDateTime?: Timestamp
  notificationsSent: number
  lastNotificationSent?: Timestamp
  responseDeadline: Timestamp
  resolvedAt?: Timestamp
  resolvedBy?: string
  resolutionNotes?: string
  dataRetentionExpiry: Timestamp
  patientNotified: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: 'system' | 'doctor'
}
```

#### PatientFlagSummary
```typescript
interface PatientFlagSummary {
  patientId: string
  patientName: string
  totalFlags: number
  activeFlags: number
  resolvedFlags: number
  flagsBySeverity: {
    low: number
    medium: number
    high: number
  }
  lastFlagDate?: Timestamp
  riskLevel: 'none' | 'low' | 'medium' | 'high'
  consentToTracking: boolean
  canBeContacted: boolean
  lastUpdated: Timestamp
}
```

#### DoctorAlert
```typescript
interface DoctorAlert {
  id: string
  doctorId: string
  type: 'patient_flagged' | 'high_risk_patient' | 'repeated_offender'
  severity: 'info' | 'warning' | 'urgent'
  title: string
  message: string
  patientId: string
  patientName: string
  flagId?: string
  appointmentId?: string
  read: boolean
  acknowledged: boolean
  dismissed: boolean
  requiresAction: boolean
  actionDeadline?: Timestamp
  createdAt: Timestamp
}
```

### Services

#### PatientFlaggingService
**Location**: `src/services/patientFlagging.ts`

**Core Functions**:
- `checkAppointmentsForFlagging()`: Automated flagging check
- `getPatientFlags(patientId)`: Retrieve patient flag history
- `getPatientFlagSummary(patientId)`: Get patient statistics
- `getDoctorAlerts(doctorId)`: Retrieve doctor alerts
- `resolvePatientFlag(flagId, notes)`: Resolve a flag
- `markAlertAsRead(alertId)`: Mark alert as read

#### FlaggingIntegrationService
**Location**: `src/services/flaggingIntegration.ts`

**Core Functions**:
- `initialize()`: Start automated flagging system
- `checkAppointmentForImediateFlagging()`: Check specific appointment
- `triggerManualFlaggingCheck()`: Manual flagging trigger
- `getFlaggingStatistics()`: System statistics
- `handleAppointmentStatusChange()`: React to appointment changes

### UI Components

#### PatientFlagIndicator
**Location**: `src/components/PatientFlagIndicator.tsx`

**Features**:
- Three display modes: badge, inline, full
- Hover tooltips with detailed information
- Risk level color coding
- Integration with flag history viewing

**Usage**:
```tsx
<PatientFlagIndicator 
  patientId={patient.id}
  patientName={patient.name}
  mode="badge"
  showTooltip={true}
  onViewDetails={(patientId) => navigate(`/patients/${patientId}/flags`)}
/>
```

#### DoctorAlerts
**Location**: `src/components/DoctorAlerts.tsx`

**Features**:
- Compact and full display modes
- Real-time alert updates
- Action buttons for alert management
- Filtering and search capabilities

**Usage**:
```tsx
<DoctorAlerts 
  showUnreadOnly={true}
  maxItems={5}
  compact={true}
/>
```

#### PatientFlaggingHistory
**Location**: `src/components/PatientFlaggingHistory.tsx`

**Features**:
- Complete flag history for patients
- Flag resolution interface
- Statistics and analytics
- Search and filtering
- GDPR compliance tools

#### GDPRComplianceManager
**Location**: `src/components/GDPRComplianceManager.tsx`

**Features**:
- Patient data access requests
- Data rectification tools
- Right to be forgotten implementation
- Data portability exports
- Consent management

## Flagging Rules and Logic

### Automatic Flagging Triggers

1. **No Response to Notifications**:
   - Both first and second notifications sent
   - No patient response after 2 hours past appointment time
   - Patient hasn't opted out of notifications
   - No existing flag for this appointment

2. **Multiple No-Shows**:
   - Patient marked as no-show for appointment
   - Pattern of previous no-shows detected
   - Grace period expired

3. **Late Cancellations**:
   - Appointment cancelled within 24 hours
   - Pattern of late cancellations
   - Affects clinic scheduling efficiency

### Severity Levels

**Low Severity** (Yellow):
- First-time offense
- Minor scheduling issues
- Single missed notification response

**Medium Severity** (Orange):
- Multiple missed appointments (2-3)
- Repeated late cancellations
- Pattern of non-communication

**High Severity** (Red):
- Chronic no-show pattern (4+ times)
- Disruptive appointment behavior
- Multiple high-priority flags

### Flag Resolution Process

1. **Doctor Review**: Doctor receives alert about flagged patient
2. **Investigation**: Review patient history and flag details
3. **Contact Patient**: Attempt to resolve underlying issues
4. **Resolution**: Mark flag as resolved with notes
5. **Follow-up**: Monitor for future flag patterns

## GDPR Compliance Features

### Legal Basis for Processing
- **Legitimate Interest**: Primary basis for medical practice management
- **Consent**: Where applicable for specific flagging purposes
- **Legal Obligation**: For medical record keeping requirements

### Patient Rights Implementation

#### Right to Access (Article 15)
- Complete data export functionality
- Structured data format (JSON)
- Includes all flagging data and processing history
- Available on-demand through UI

#### Right to Rectification (Article 16)
- Patient can request data corrections
- Doctor notification system for rectification requests
- Audit trail of all corrections made
- Verification process for requested changes

#### Right to Erasure (Article 17)
- "Right to be forgotten" implementation
- Complete data deletion including backups
- Verification of erasure completion
- Exceptions for legal obligations preserved

#### Right to Data Portability (Article 20)
- Structured data export in JSON format
- Machine-readable format for data transfer
- Includes all patient flagging data
- Preserves data relationships and metadata

#### Right to Restrict Processing (Article 18)
- Temporary suspension of flagging for patient
- Data preserved but not actively processed
- Clear indicators in UI for restricted patients
- Reversible restriction process

### Data Protection Measures

#### Data Minimization
- Only essential data stored for flagging purposes
- Automatic cleanup of expired flags
- Regular review of data necessity
- Minimal personal information in flags

#### Purpose Limitation
- Flagging data used only for appointment management
- Clear purpose definitions in system
- Restricted access based on medical necessity
- No secondary use without consent

#### Storage Limitation
- Default 24-month retention period
- Configurable retention per doctor/clinic
- Automatic deletion of expired data
- Clear retention policy communication

#### Security Measures
- Encrypted storage of all flagging data
- Access logging and audit trails
- Role-based access control
- Regular security assessments

### Consent Management

#### Explicit Consent Collection
- Clear consent forms for flagging system
- Granular consent for different processing purposes
- Easy consent withdrawal mechanism
- Consent status tracking and history

#### Consent Withdrawal
- One-click consent withdrawal
- Immediate cessation of flagging
- Data retention for legal obligations only
- Clear communication of withdrawal effects

## Integration Points

### Notification System Integration
The flagging system integrates seamlessly with the existing notification system:

```typescript
// Automatic flagging triggers after notification timeout
await FlaggingIntegrationService.checkAppointmentForImediateFlagging(appointment)

// Integration with notification scheduling
if (patientFlagged) {
  // Adjust notification frequency or content
  await NotificationSchedulerService.updateNotificationStrategy(appointment)
}
```

### Appointment Management Integration
Flagging status affects appointment handling:

```tsx
// Visual indicators in appointment lists
<PatientFlagIndicator 
  patientId={appointment.patientEmail || appointment.patientName}
  patientName={appointment.patientName}
  mode="badge"
/>

// Enhanced appointment details
{patient.flagged && (
  <div className="bg-red-50 border border-red-200 rounded p-3">
    <p className="text-red-700 text-sm">
      Acest pacient are {patient.flagCount} semnalizări active
    </p>
  </div>
)}
```

### Dashboard Integration
Real-time alerts and statistics:

```tsx
// Doctor alerts widget
<DoctorAlerts 
  showUnreadOnly={true}
  maxItems={5}
  compact={true}
/>

// Flagging statistics
const stats = await FlaggingIntegrationService.getFlaggingStatistics()
```

## Configuration Options

### Doctor-Level Configuration
Each doctor can customize flagging behavior:

```typescript
interface FlaggingConfiguration {
  enableAutoFlagging: boolean
  flagAfterMissedNotifications: number // Default: 2
  flagSeverityForNoResponse: FlagSeverity // Default: 'medium'
  responseTimeoutHours: number // Default: 2
  appointmentGracePeriodMinutes: number // Default: 15
  enableRealTimeAlerts: boolean
  enableEmailAlerts: boolean
  alertForSeverities: FlagSeverity[]
  highlightFlaggedPatients: boolean
  showFlagCountInLists: boolean
  flagDisplayColor: string // Default: '#dc2626'
  flagRetentionMonths: number // Default: 24
  autoResolveOldFlags: boolean
}
```

### System-Level Settings
Global configuration for the flagging system:

```typescript
const DEFAULT_FLAGGING_CONFIG = {
  enableAutoFlagging: true,
  flagAfterMissedNotifications: 2,
  flagSeverityForNoResponse: 'medium',
  responseTimeoutHours: 2,
  appointmentGracePeriodMinutes: 15,
  enableRealTimeAlerts: true,
  enableEmailAlerts: true,
  alertForSeverities: ['medium', 'high'],
  highlightFlaggedPatients: true,
  showFlagCountInLists: true,
  flagDisplayColor: '#dc2626',
  flagRetentionMonths: 24,
  autoResolveOldFlags: true
}
```

## Database Schema

### Firestore Collections

#### `patientFlags`
```javascript
{
  // Document ID: auto-generated
  patientId: "patient@email.com",
  patientName: "Ion Popescu",
  doctorId: "doctor_uid",
  reason: "no_response_to_notifications",
  severity: "medium",
  status: "active",
  description: "Pacientul nu a răspuns la notificările pentru programarea din 15 decembrie 2024",
  appointmentId: "appointment_123",
  appointmentDateTime: timestamp,
  notificationsSent: 2,
  lastNotificationSent: timestamp,
  responseDeadline: timestamp,
  dataRetentionExpiry: timestamp,
  patientNotified: false,
  createdAt: timestamp,
  updatedAt: timestamp,
  createdBy: "system"
}
```

#### `patientFlagSummaries`
```javascript
{
  // Document ID: patientId
  patientId: "patient@email.com",
  patientName: "Ion Popescu",
  totalFlags: 3,
  activeFlags: 1,
  resolvedFlags: 2,
  flagsBySeverity: {
    low: 1,
    medium: 2,
    high: 0
  },
  lastFlagDate: timestamp,
  riskLevel: "medium",
  consentToTracking: true,
  canBeContacted: true,
  lastUpdated: timestamp
}
```

#### `doctorAlerts`
```javascript
{
  // Document ID: auto-generated
  doctorId: "doctor_uid",
  type: "patient_flagged",
  severity: "warning",
  title: "Pacient semnalizat pentru lipsa de răspuns",
  message: "Ion Popescu a fost semnalizat pentru că nu a răspuns la notificările pentru programarea din 15 decembrie 2024.",
  patientId: "patient@email.com",
  patientName: "Ion Popescu",
  flagId: "flag_123",
  appointmentId: "appointment_123",
  read: false,
  acknowledged: false,
  dismissed: false,
  requiresAction: true,
  actionDeadline: timestamp,
  createdAt: timestamp
}
```

#### `flaggingConfigurations`
```javascript
{
  // Document ID: doctorId
  doctorId: "doctor_uid",
  enableAutoFlagging: true,
  flagAfterMissedNotifications: 2,
  flagSeverityForNoResponse: "medium",
  responseTimeoutHours: 2,
  appointmentGracePeriodMinutes: 15,
  enableRealTimeAlerts: true,
  enableEmailAlerts: true,
  alertForSeverities: ["medium", "high"],
  highlightFlaggedPatients: true,
  showFlagCountInLists: true,
  flagDisplayColor: "#dc2626",
  flagRetentionMonths: 24,
  autoResolveOldFlags: true,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `flagAuditLogs`
```javascript
{
  // Document ID: auto-generated
  flagId: "flag_123",
  patientId: "patient@email.com",
  doctorId: "doctor_uid",
  action: "created",
  performedBy: "system",
  performedByType: "system",
  oldValue: null,
  newValue: { /* flag data */ },
  changeReason: "Automatic flag for no_response_to_notifications",
  legalBasis: "legitimate_interest",
  patientConsent: true,
  ipAddress: "127.0.0.1",
  userAgent: "Mozilla/5.0...",
  timestamp: timestamp
}
```

### Required Firestore Indexes

```javascript
// patientFlags collection
{
  collectionGroup: "patientFlags",
  queryScope: "COLLECTION",
  fields: [
    { fieldPath: "doctorId", order: "ASCENDING" },
    { fieldPath: "status", order: "ASCENDING" },
    { fieldPath: "createdAt", order: "DESCENDING" }
  ]
}

{
  collectionGroup: "patientFlags",
  queryScope: "COLLECTION",
  fields: [
    { fieldPath: "patientId", order: "ASCENDING" },
    { fieldPath: "status", order: "ASCENDING" },
    { fieldPath: "createdAt", order: "DESCENDING" }
  ]
}

// doctorAlerts collection
{
  collectionGroup: "doctorAlerts",
  queryScope: "COLLECTION",
  fields: [
    { fieldPath: "doctorId", order: "ASCENDING" },
    { fieldPath: "read", order: "ASCENDING" },
    { fieldPath: "createdAt", order: "DESCENDING" }
  ]
}

// appointments collection (for flagging check)
{
  collectionGroup: "appointments",
  queryScope: "COLLECTION",
  fields: [
    { fieldPath: "status", order: "ASCENDING" },
    { fieldPath: "dateTime", order: "ASCENDING" }
  ]
}
```

## Performance Considerations

### Optimization Strategies

#### Efficient Queries
- Compound indexes for common query patterns
- Pagination for large result sets
- Caching of frequently accessed data
- Batch operations for bulk updates

#### Real-Time Updates
- Firestore real-time listeners for live updates
- Optimistic UI updates for better UX
- Debounced updates to prevent excessive calls
- Selective listening based on current view

#### Memory Management
- Lazy loading of flag details
- Component-level state management
- Proper cleanup of listeners
- Efficient re-rendering strategies

### Scalability Measures

#### Data Partitioning
- Patient flags partitioned by doctor
- Time-based partitioning for historical data
- Separate collections for different data types
- Archived data migration strategies

#### Background Processing
- Cloud Functions for automated flagging
- Scheduled jobs for data cleanup
- Batch processing for analytics
- Asynchronous notification delivery

## Testing Strategy

### Unit Tests
- Service method validation
- Component behavior testing
- GDPR compliance verification
- Data transformation accuracy

### Integration Tests
- End-to-end flagging workflow
- Real-time update propagation
- Database consistency checks
- API integration validation

### Manual Testing Scenarios

#### Flagging Workflow
1. Create appointment with patient contact info
2. Send notifications and wait for timeout
3. Verify automatic flag creation
4. Check doctor alert generation
5. Test flag resolution process

#### GDPR Compliance
1. Test data access request
2. Verify data rectification process
3. Test right to erasure
4. Validate consent withdrawal
5. Check audit trail completeness

#### UI Integration
1. Verify flag indicators in appointment lists
2. Test tooltip functionality
3. Check alert notifications
4. Validate responsive design
5. Test accessibility features

## Deployment Checklist

### Database Setup
- [ ] Create required Firestore collections
- [ ] Set up necessary indexes
- [ ] Configure security rules
- [ ] Test database connections

### Configuration
- [ ] Set default flagging configuration
- [ ] Configure retention policies
- [ ] Set up monitoring alerts
- [ ] Test notification integration

### Security
- [ ] Verify access controls
- [ ] Test GDPR compliance features
- [ ] Validate data encryption
- [ ] Check audit logging

### Testing
- [ ] Run unit test suite
- [ ] Execute integration tests
- [ ] Perform manual testing
- [ ] Validate real-time updates

### Documentation
- [ ] Update API documentation
- [ ] Create user guides
- [ ] Document configuration options
- [ ] Prepare troubleshooting guides

## Monitoring and Analytics

### Key Metrics
- **Flag Creation Rate**: Number of new flags per day/week
- **Resolution Rate**: Percentage of flags resolved within SLA
- **Patient Response Rate**: Improvement in notification responses
- **Alert Response Time**: Doctor response time to alerts
- **GDPR Request Volume**: Number of data access/deletion requests

### Dashboards
- Real-time flagging statistics
- Doctor performance metrics
- Patient behavior analytics
- System health monitoring
- GDPR compliance tracking

### Alerting
- High flag creation volume
- Unresolved critical flags
- System errors or failures
- GDPR compliance issues
- Performance degradation

## Support and Maintenance

### Regular Maintenance
- **Weekly**: Review flagging patterns and adjust thresholds
- **Monthly**: Analyze flag resolution effectiveness
- **Quarterly**: GDPR compliance audit
- **Annually**: System performance review and optimization

### Troubleshooting Common Issues

#### Flags Not Being Created
1. Check notification system integration
2. Verify appointment status updates
3. Review flagging configuration
4. Check database connectivity

#### Alerts Not Appearing
1. Verify doctor alert subscription
2. Check real-time listener setup
3. Review alert creation logic
4. Test notification delivery

#### GDPR Compliance Issues
1. Verify consent tracking
2. Check data retention policies
3. Review audit log completeness
4. Test patient rights implementation

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Next Review**: March 2025

For technical support or questions about the patient flagging system, contact the MedFlow development team.
