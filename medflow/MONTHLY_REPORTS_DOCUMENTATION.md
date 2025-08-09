# Monthly Report Review & Amendment System Documentation

## Overview

The Monthly Report Review & Amendment System is a comprehensive feature for MedFlow that enables doctors to efficiently review, amend, and prepare finalized patient reports for government submission. This system ensures compliance with Romanian health data regulations while maintaining complete audit trails and data integrity.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [User Workflows](#user-workflows)
3. [Amendment Management](#amendment-management)
4. [Submission Process](#submission-process)
5. [Data Integrity & Compliance](#data-integrity--compliance)
6. [API Reference](#api-reference)
7. [Security Implementation](#security-implementation)
8. [Troubleshooting](#troubleshooting)

---

## System Architecture

### Core Components

#### 1. Monthly Aggregation Engine
- **Purpose**: Aggregates finalized reports by month for efficient review
- **Features**: 
  - Automatic monthly categorization using `YYYY-MM` format
  - Real-time statistics and progress tracking
  - Submission deadline management
- **Performance**: Optimized queries with Firebase indexing

#### 2. Amendment Workflow System
- **Purpose**: Manages report modifications with full version control
- **Features**:
  - Create amendment requests with detailed reasoning
  - Approval/rejection workflow
  - Complete change tracking
  - Audit trail compliance
- **Security**: Role-based access with comprehensive validation

#### 3. Submission Management
- **Purpose**: Prepares and tracks report submissions to government
- **Features**:
  - Batch creation for group submissions
  - Submission status tracking
  - Government reference management
  - Deadline monitoring

### Data Architecture

#### Core Collections

##### patient_reports (Enhanced)
```typescript
interface PatientReport {
  // ... existing fields ...
  
  // Monthly Aggregation
  reportMonth: string        // YYYY-MM format
  reportYear: number         // Year for aggregation
  currentVersion: number     // Version control
  
  // Amendment Management
  amendmentStatus: AmendmentStatus
  amendmentRequests?: string[]
  versions?: ReportVersion[]
  
  // Submission Workflow
  submissionStatus: SubmissionStatus
  reviewedBy?: string
  reviewedAt?: Timestamp
  submittedAt?: Timestamp
  submissionDeadline?: Timestamp
  governmentReference?: string
  isReadyForSubmission: boolean
  submissionBatch?: string
}
```

##### monthly_summaries
```typescript
interface MonthlyReportSummary {
  month: string              // YYYY-MM format
  totalReports: number
  finalizedReports: number
  readyForSubmission: number
  submittedReports: number
  pendingAmendments: number
  overdueReviews: number
  submissionDeadline?: Date
  completionRate: number
  reviewProgress: number
  lastUpdated: Timestamp
}
```

##### amendment_requests
```typescript
interface AmendmentRequest {
  id: string
  reportId: string
  requestedBy: string
  requestedByRole: 'doctor' | 'nurse' | 'admin'
  requestDate: Timestamp
  reason: string
  proposedChanges: Record<string, any>
  status: AmendmentStatus
  reviewedBy?: string
  reviewDate?: Timestamp
  reviewComments?: string
  deadline?: Timestamp
}
```

##### submission_batches
```typescript
interface SubmissionBatch {
  id: string
  month: string              // YYYY-MM format
  createdBy: string
  createdAt: Timestamp
  reportIds: string[]
  status: 'preparing' | 'ready' | 'submitted' | 'accepted' | 'rejected'
  submittedAt?: Timestamp
  governmentReference?: string
  notes?: string
  rejectionReason?: string
}
```

##### report_versions
```typescript
interface ReportVersion {
  id: string
  versionNumber: number
  timestamp: Timestamp
  createdBy: string
  createdByRole: 'doctor' | 'nurse' | 'admin'
  changes: Record<string, { from: any; to: any }>
  reason: string
  isActive: boolean
  parentVersionId?: string
}
```

---

## User Workflows

### 1. Monthly Review Workflow

#### Step 1: Access Monthly Review
1. Navigate to "Revizuire lunară" in the main menu
2. Select the month for review from the dropdown
3. View monthly summary statistics

#### Step 2: Filter and Review Reports
1. Use search and filters to find specific reports
2. Apply quick filters:
   - Only reports needing review
   - Only reports with amendments
   - Include/exclude submitted reports
3. View report details in expanded mode

#### Step 3: Bulk Operations
1. Select multiple reports using checkboxes
2. Perform bulk approval for submission readiness
3. Create submission batches for government submission

### 2. Individual Report Review

#### Review Process
1. **Expansion View**: Click on a report to see detailed information
2. **Status Check**: Verify report completion and quality
3. **Amendment Review**: Check for pending amendments
4. **Approval**: Mark as ready for submission if complete

#### Quality Assurance
- Verify all required fields are completed
- Check for consistency in diagnosis and treatment
- Ensure compliance with medical documentation standards
- Review amendment history if applicable

### 3. Amendment Workflow

#### Creating Amendments
1. Click the amendment button on a finalized report
2. Select the "Creează amendament" tab
3. Edit the required fields
4. Provide detailed reasoning for changes
5. Submit the amendment request

#### Processing Amendments
1. Review pending amendments in the "Amendamente în curs" tab
2. Compare proposed changes with current values
3. Approve or reject with comments
4. Apply approved amendments to update the report

#### Version Control
1. View complete version history in the "Istoric versiuni" tab
2. Track all changes with timestamps and user information
3. Maintain audit trail for compliance

---

## Amendment Management

### Amendment Types

#### 1. Content Corrections
- **Patient complaint corrections**
- **Diagnosis updates**
- **Treatment plan modifications**
- **Additional notes and observations**

#### 2. Compliance Updates
- **Missing required information**
- **Standard terminology corrections**
- **Format standardization**

### Amendment Process

#### Creation Requirements
- Report must be in 'final' or 'ready_for_submission' status
- Detailed reasoning required (minimum 10 characters)
- At least one field modification required
- Optional deadline setting

#### Approval Criteria
- Medical accuracy verification
- Compliance with regulations
- Documentation standards adherence
- Audit trail completeness

#### Version Management
- Automatic version incrementing
- Complete change tracking
- Parent-child version relationships
- Active version marking

### Audit Trail

#### Amendment Actions Tracked
- **Creation**: Who, when, why, what changed
- **Review**: Who reviewed, when, decision
- **Application**: When changes were applied
- **Access**: Who viewed amendment history

#### Compliance Features
- GDPR-compliant change logging
- Romanian health regulation adherence
- Complete user action tracking
- Timestamp verification

---

## Submission Process

### Submission Readiness

#### Automatic Checks
- All required fields completed
- Validation errors resolved
- GDPR consent obtained
- Medical coding compliance

#### Manual Review
- Doctor approval required
- Quality assurance verification
- Amendment status confirmation
- Deadline compliance check

### Batch Management

#### Batch Creation
1. Select reports ready for submission
2. Verify all reports are approved
3. Create submission batch with metadata
4. Generate batch reference number

#### Submission Tracking
- Batch status monitoring
- Government reference linking
- Submission confirmation
- Acceptance/rejection handling

### Government Interface

#### Submission Requirements
- Monthly deadline compliance (10th of following month)
- Standard format adherence
- Complete audit trail
- Digital signature support

#### Status Management
- **Preparing**: Batch being assembled
- **Ready**: Ready for government submission
- **Submitted**: Sent to government
- **Accepted**: Confirmed by government
- **Rejected**: Returned for corrections

---

## Data Integrity & Compliance

### Data Validation

#### Real-time Validation
- Field requirement checking
- Format validation
- Medical coding verification
- Cross-field consistency

#### Submission Validation
- Complete documentation verification
- Deadline compliance checking
- Batch integrity validation
- Government standard adherence

### Compliance Framework

#### GDPR Compliance
- **Data Minimization**: Only necessary medical data
- **Consent Management**: Explicit patient consent tracking
- **Access Control**: Role-based data access
- **Audit Logging**: Complete action tracking
- **Right to Rectification**: Amendment system support

#### Romanian Health Regulations
- **Medical Documentation Standards**: Compliant report structure
- **Submission Requirements**: Government format adherence
- **Retention Policies**: Proper data lifecycle management
- **Professional Standards**: Medical coding compliance

### Security Measures

#### Access Control
- Doctor-only report access
- Amendment permission management
- Batch creation authorization
- Government submission control

#### Data Protection
- Encrypted data storage
- Secure transmission protocols
- Audit log protection
- Version control security

---

## API Reference

### Monthly Reports Service (`monthlyReports.ts`)

#### Core Functions

##### getMonthlyReportSummary()
```typescript
getMonthlyReportSummary(
  doctorId: string,
  month: string
): Promise<MonthlyReportSummary>
```
Retrieves comprehensive monthly statistics for a doctor.

##### getMonthlyReports()
```typescript
getMonthlyReports(
  doctorId: string,
  filters: MonthlyReportFilters,
  limitCount?: number,
  lastDoc?: QueryDocumentSnapshot
): Promise<{
  reports: PatientReport[]
  hasMore: boolean
  lastDoc?: QueryDocumentSnapshot
}>
```
Gets paginated reports for a specific month with filtering.

##### subscribeToMonthlyReports()
```typescript
subscribeToMonthlyReports(
  doctorId: string,
  month: string,
  callback: (reports: PatientReport[]) => void
): () => void
```
Real-time subscription to monthly report updates.

#### Amendment Functions

##### createAmendmentRequest()
```typescript
createAmendmentRequest(
  reportId: string,
  reason: string,
  proposedChanges: Record<string, any>,
  requestedBy: string,
  userRole?: 'doctor' | 'nurse',
  deadline?: Date
): Promise<string>
```
Creates a new amendment request.

##### processAmendmentRequest()
```typescript
processAmendmentRequest(
  requestId: string,
  action: 'approve' | 'reject',
  reviewComments: string,
  reviewedBy: string,
  userRole?: 'doctor' | 'nurse'
): Promise<void>
```
Approves or rejects an amendment request.

##### applyAmendments()
```typescript
applyAmendments(
  reportId: string,
  amendmentRequestId: string,
  userId: string,
  userRole?: 'doctor' | 'nurse'
): Promise<void>
```
Applies approved amendments to a report.

#### Submission Functions

##### markReportReadyForSubmission()
```typescript
markReportReadyForSubmission(
  reportId: string,
  reviewedBy: string,
  userRole?: 'doctor' | 'nurse'
): Promise<void>
```
Marks a report as ready for government submission.

##### createSubmissionBatch()
```typescript
createSubmissionBatch(
  month: string,
  reportIds: string[],
  createdBy: string,
  notes?: string
): Promise<string>
```
Creates a batch for government submission.

##### submitBatchToGovernment()
```typescript
submitBatchToGovernment(
  batchId: string,
  governmentReference: string,
  submittedBy: string
): Promise<void>
```
Submits a batch to the government system.

#### Utility Functions

##### getMonthString()
```typescript
getMonthString(date: Date): string
```
Generates month string in YYYY-MM format.

##### getSubmissionDeadline()
```typescript
getSubmissionDeadline(month: string): Date
```
Gets the submission deadline for a given month.

##### isMonthOverdue()
```typescript
isMonthOverdue(month: string): boolean
```
Checks if a month is overdue for submission.

##### bulkApproveReports()
```typescript
bulkApproveReports(
  reportIds: string[],
  reviewedBy: string,
  userRole?: 'doctor' | 'nurse'
): Promise<void>
```
Bulk approve multiple reports for submission.

---

## Security Implementation

### Firestore Security Rules

#### Patient Reports Access
```javascript
// Enhanced patient reports with monthly fields
match /patient_reports/{reportId} {
  allow read: if isAuthenticated() && (
    isAppointmentDoctor(resource.data) ||
    (isNurse() && resource.data.status == 'final' && 
     clinicMatch(resource.data, getUserId()))
  );
  
  allow update: if isAuthenticated() && 
                   isDoctor() &&
                   isAppointmentDoctor(resource.data) &&
                   isValidReportUpdate(resource.data, request.data);
}
```

#### Monthly Summaries
```javascript
match /monthly_summaries/{summaryId} {
  allow read: if isAuthenticated() && isDoctor() && 
                 summaryId.matches('.*_.*') && 
                 summaryId.split('_')[0] == getUserId();
  
  allow create, update: if isAuthenticated() && isDoctor() && 
                          summaryId.split('_')[0] == getUserId() &&
                          isValidMonthlySummaryData(request.data);
}
```

#### Amendment Requests
```javascript
match /amendment_requests/{requestId} {
  allow read: if isAuthenticated() && isDoctor() && 
                 reportBelongsToDoctor(resource.data.reportId);
  
  allow create: if isAuthenticated() && isDoctor() &&
                   isValidAmendmentRequestData(request.data) &&
                   request.data.requestedBy == getUserId();
}
```

### Data Validation Rules

#### Amendment Request Validation
- Minimum reason length: 10 characters
- Maximum reason length: 1000 characters
- Valid proposed changes structure
- Recent timestamp validation
- Status transition validation

#### Submission Batch Validation
- Valid month format (YYYY-MM)
- Report ID list validation (1-500 reports)
- Status transition validation
- Creator ownership verification

#### Report Version Validation
- Sequential version numbering
- Valid change structure
- Reason requirement (5-500 characters)
- Creator verification

---

## Troubleshooting

### Common Issues

#### 1. Monthly Summary Not Loading
**Symptoms**: Empty or outdated statistics
**Solutions**:
1. Check month selection format (YYYY-MM)
2. Verify doctor has reports for the selected month
3. Clear cache and refresh
4. Check Firebase permissions

#### 2. Amendment Creation Fails
**Symptoms**: Cannot create amendment request
**Solutions**:
1. Verify report is in 'final' or 'ready_for_submission' status
2. Check minimum reason length (10 characters)
3. Ensure at least one field has changes
4. Verify Firebase permissions

#### 3. Bulk Operations Not Working
**Symptoms**: Bulk approval or batch creation fails
**Solutions**:
1. Check report selection (only eligible reports)
2. Verify user permissions
3. Check network connectivity
4. Reduce batch size if too large

#### 4. Submission Deadline Issues
**Symptoms**: Incorrect deadline calculation
**Solutions**:
1. Verify month format (YYYY-MM)
2. Check system date/time
3. Validate deadline calculation logic
4. Consider timezone differences

### Performance Optimization

#### Large Dataset Handling
- Use pagination for report lists
- Implement lazy loading for details
- Cache monthly summaries
- Optimize Firebase queries with indexes

#### Real-time Updates
- Use efficient subscription management
- Batch update notifications
- Implement connection retry logic
- Handle offline scenarios

### Data Recovery

#### Amendment History Recovery
1. Check report versions collection
2. Verify audit trail completeness
3. Restore from backup if necessary
4. Validate data integrity

#### Batch Submission Recovery
1. Check submission batch status
2. Verify government reference
3. Retry submission if failed
4. Contact support for assistance

---

## Best Practices

### Monthly Review Process

#### Recommended Workflow
1. **Week 1**: Review all finalized reports from previous month
2. **Week 2**: Process amendments and corrections
3. **Week 3**: Bulk approve ready reports
4. **Week 4**: Create and submit government batch

#### Quality Assurance
- Review reports systematically by patient type
- Check amendment reasoning for completeness
- Verify medical coding compliance
- Ensure all deadlines are met

### Amendment Management

#### Effective Amendment Practices
- Provide detailed reasoning for all changes
- Group related changes in single amendment
- Review amendments promptly
- Maintain professional communication

#### Version Control Best Practices
- Keep version history clean and organized
- Document all changes comprehensively
- Regularly review amendment patterns
- Use version control for compliance audits

### Compliance Maintenance

#### Regular Audits
- Monthly compliance checks
- Amendment pattern analysis
- Deadline adherence monitoring
- Security access reviews

#### Documentation Standards
- Maintain complete audit trails
- Document all process changes
- Keep compliance records updated
- Regular staff training on procedures

---

## Support and Maintenance

### Monitoring

#### System Health Checks
- Monthly summary accuracy
- Amendment processing times
- Submission success rates
- User access patterns

#### Performance Metrics
- Query response times
- Real-time update latency
- Batch processing efficiency
- Error rates and patterns

### Updates and Enhancements

#### Regular Maintenance
- Security rule updates
- Performance optimizations
- Bug fixes and improvements
- Feature enhancements

#### Compliance Updates
- Regulatory requirement changes
- Government submission format updates
- Security standard improvements
- Data protection enhancements

---

*This documentation is maintained by the MedFlow development team and updated regularly to reflect the latest features and requirements. For the most current version and additional support, please contact the technical support team.*

**Last Updated**: December 2024
**Version**: 1.0
**Document ID**: MEDFLOW-MONTHLY-DOC-2024
