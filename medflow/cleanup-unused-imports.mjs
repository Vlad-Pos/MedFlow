#!/usr/bin/env node

/**
 * MEDFLOW UNUSED IMPORTS CLEANUP SCRIPT
 * This script systematically removes unused imports and variables
 * to fix the majority of ESLint errors efficiently.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Files with known unused imports to clean up
const cleanupTargets = [
  {
    file: 'src/components/AIChat.tsx',
    unusedImports: ['Clock', 'Star', 'AlertTriangle', 'CheckCircle', 'Copy', 'RefreshCw'],
    unusedVars: ['user', 'setConfig', 'setConversationSummary']
  },
  {
    file: 'src/components/Accessibility.tsx',
    unusedImports: ['Volume2', 'VolumeX', 'Moon']
  },
  {
    file: 'src/components/AmendmentManager.tsx',
    unusedImports: ['Edit', 'MessageSquare', 'User', 'Calendar', 'Save']
  },
  {
    file: 'src/components/AppointmentForm.tsx',
    unusedImports: ['Calendar'],
    unusedVars: ['showAISuggestions', 'setShowAISuggestions']
  },
  {
    file: 'src/components/AppointmentFormInput.tsx',
    unusedImports: ['useEffect', 'User', 'FileText', 'Eye', 'EyeOff', 'ValidationResult'],
    unusedVars: ['isFocused']
  },
  {
    file: 'src/components/AppointmentTemplates.tsx',
    unusedImports: ['AnimatePresence', 'Trash2', 'Filter'],
    unusedVars: ['onCreateFromTemplate', 'user', 'showCreateForm', 'editingTemplate']
  },
  {
    file: 'src/components/ChatbotInterface.tsx',
    unusedImports: ['MessageCircle', 'Calendar', 'FileText', 'Paperclip', 'ChevronDown', 'Clock', 'ChatbotResponse'],
    unusedVars: ['onAppointmentRequest', 'patientId', 'conversationStage', 'patientData', 'setPatientData']
  },
  {
    file: 'src/components/DesignGuidance/DesignGuidancePanel.tsx',
    unusedVars: ['complianceConfirmed', 'understandingDemonstrated', 'index']
  },
  {
    file: 'src/components/DoctorAlerts.tsx',
    unusedImports: ['X']
  },
  {
    file: 'src/components/DocumentManager.tsx',
    unusedImports: ['Share2', 'Lock', 'MoreVertical'],
    unusedVars: ['analyzeDocument', 'document']
  },
  {
    file: 'src/components/DocumentUpload.tsx',
    unusedImports: ['Trash2'],
    unusedVars: ['getFileIcon']
  },
  {
    file: 'src/components/EarlyAccessForm.tsx',
    unusedVars: ['err']
  },
  {
    file: 'src/components/GDPRComplianceManager.tsx',
    unusedImports: ['Clock', 'User']
  },
  {
    file: 'src/components/LazyImage.tsx',
    unusedVars: ['quality']
  },
  {
    file: 'src/components/ModernCalendar.tsx',
    unusedVars: ['loading']
  },
  {
    file: 'src/components/NotificationPreferences.tsx',
    unusedImports: ['X', 'GDPRConsent', 'NotificationChannel']
  },
  {
    file: 'src/components/NotificationStatus.tsx',
    unusedImports: ['useEffect', 'NotificationChannel']
  },
  {
    file: 'src/components/PatientFlagIndicator.tsx',
    unusedImports: ['User', 'Calendar', 'PatientFlag']
  },
  {
    file: 'src/components/PatientFlaggingHistory.tsx',
    unusedImports: ['User', 'XCircle', 'FileText', 'Filter', 'Download']
  },
  {
    file: 'src/components/PatientReportForm.tsx',
    unusedImports: ['Activity', 'Calendar', 'Plus', 'Trash2', 'VitalSigns', 'PhysicalExamination', 'MedicalDiagnosis', 'TreatmentPlan', 'ValidationErrors'],
    unusedVars: ['props']
  },
  {
    file: 'src/components/PatientSearch.tsx',
    unusedImports: ['Search']
  },
  {
    file: 'src/components/QuickInputFeatures.tsx',
    unusedImports: ['useCallback', 'Volume2', 'VolumeX', 'Settings'],
    unusedVars: ['onTemplateApply', 'placeholder', 'timeRange', 'user']
  },
  {
    file: 'src/components/ReportValidationIndicator.tsx',
    unusedImports: ['AnimatePresence', 'TrendingUp', 'ValidationStatus'],
    unusedVars: ['hasWarnings']
  },
  {
    file: 'src/components/ScrollGradientBackground.tsx',
    unusedVars: ['SCROLL_THROTTLE_MS', 'isScrolling']
  },
  {
    file: 'src/components/SmartAppointmentSuggestions.tsx',
    unusedImports: ['Users']
  },
  {
    file: 'src/components/SmartRecommendations.tsx',
    unusedImports: ['Zap'],
    unusedVars: ['timeRange', 'user']
  },
  {
    file: 'src/components/SubmissionStatusManager.tsx',
    unusedImports: ['Zap', 'Shield', 'Server', 'Settings', 'Pause', 'Info', 'SubmissionBatch', 'SubmissionQueue'],
    unusedVars: ['queueSubmissionBatch', 'onClose', 'isRetrying', 'setIsRetrying']
  },
  {
    file: 'src/components/TouchGestures.tsx',
    unusedImports: ['useEffect'],
    unusedVars: ['tapCount']
  },
  {
    file: 'src/components/auth/PasswordStrengthIndicator.tsx',
    unusedImports: ['AlertCircle', 'PasswordStrength']
  },
  {
    file: 'src/pages/Analytics.tsx',
    unusedImports: []
  },
  {
    file: 'src/pages/AppointmentResponse.tsx',
    unusedImports: ['ThumbsDown'],
    unusedVars: ['err']
  },
  {
    file: 'src/pages/Appointments.tsx',
    unusedVars: ['creatingAt', 'template']
  },
  {
    file: 'src/pages/Dashboard.tsx',
    unusedImports: ['XCircle']
  },
  {
    file: 'src/pages/LandingEnhanced.tsx',
    unusedImports: ['Star', 'Download'],
    unusedVars: ['activeFeature', 'featuresY', 'features', 'stats', 'testimonials', 'featureShowcase']
  },
  {
    file: 'src/pages/MonthlyReportReview.tsx',
    unusedImports: ['useCallback', 'Users', 'TrendingUp', 'Archive', 'Flag', 'MessageSquare', 'Settings', 'SubmissionBatch', 'AmendmentRequest', 'AmendmentStatus'],
    unusedVars: ['getSubmissionDeadline', 'getSubmissionStatistics']
  },
  {
    file: 'src/pages/PatientReports.tsx',
    unusedImports: ['Filter', 'Edit', 'Trash2', 'Printer', 'Mail', 'Clock'],
    unusedVars: ['user', 'setReports', 'setLoading', 'showCreateForm', 'fadeInVariants']
  },
  {
    file: 'src/pages/Patients.tsx',
    unusedVars: ['selectedPatient']
  },
  {
    file: 'src/pages/ProfileEnhanced.tsx',
    unusedImports: ['Mail', 'Check', 'MapPin', 'Phone', 'Calendar', 'Building', 'GraduationCap']
  },
  {
    file: 'src/pages/WebsiteLanding.tsx',
    unusedImports: ['Star', 'ChevronDown', 'Heart'],
    unusedVars: ['N8nButton', 'NeonIconSet', 'headerOpacity', 'parallaxY1', 'parallaxY2', 'parallaxY3']
  },
  {
    file: 'src/providers/ThemeProvider.tsx',
    unusedVars: ['setSystemTheme']
  },
  {
    file: 'src/services/aiService.ts',
    unusedVars: ['patientHistory', 'currentMedications', 'conversationHistory']
  },
  {
    file: 'src/services/appointmentLinks.ts',
    unusedImports: ['deleteDoc', 'collection'],
    unusedVars: ['data', 'now', 'doctorId', 'startDate', 'endDate']
  },
  {
    file: 'src/services/governmentSubmission.ts',
    unusedImports: ['deleteDoc', 'writeBatch'],
    unusedVars: ['showNotification', 'data', 'batchData']
  },
  {
    file: 'src/services/monthlyReports.ts',
    unusedImports: ['deleteDoc', 'AmendmentStatus'],
    unusedVars: ['submittedBy', 'userRole']
  },
  {
    file: 'src/services/notificationPreferences.ts',
    unusedImports: []
  },
  {
    file: 'src/services/notificationScheduler.ts',
    unusedImports: ['NotificationDeliveryRequest']
  },
  {
    file: 'src/services/notificationSender.ts',
    unusedImports: ['RomanianNotificationContent'],
    unusedVars: ['language', 'deliveryStatusId']
  },
  {
    file: 'src/components/PatientFlaggingHistory.tsx',
    unusedImports: ['User', 'XCircle', 'FileText', 'Filter', 'Download']
  },
  {
    file: 'src/services/patientFlagging.ts',
    unusedImports: ['writeBatch', 'FlagSeverity', 'FlagStatus', 'PatientFlagGDPRData'],
    unusedVars: ['reason', 'patientId', 'doctorId']
  },
  {
    file: 'src/services/patientReports.ts',
    unusedImports: ['updateDoc', 'deleteDoc', 'ReportSearchQuery', 'VoiceTranscription', 'ReportError'],
    unusedVars: ['filters', 'q', 'userRole', 'doctorId']
  },
  {
    file: 'src/services/submissionNotifications.ts',
    unusedImports: ['SubmissionLogEntry', 'SubmissionBatch']
  },
  {
    file: 'src/utils/appointmentLinksTest.ts',
    unusedImports: []
  },
  {
    file: 'src/utils/appointmentValidation.ts',
    unusedVars: ['patientHistory']
  },
  {
    file: 'src/utils/authValidation.ts',
    unusedImports: []
  },
  {
    file: 'src/utils/demo.ts',
    unusedImports: []
  },
  {
    file: 'src/utils/errorHandling.ts',
    unusedVars: ['anonymizedError']
  },
  {
    file: 'src/utils/n8nAnimations.ts',
    unusedVars: ['error']
  },
  {
    file: 'src/utils/performance.ts',
    unusedImports: []
  },
  {
    file: 'src/utils/validation.ts',
    unusedImports: []
  }
];

function cleanFile(filePath, unusedImports, unusedVars) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Remove unused imports
  unusedImports.forEach(importName => {
    const importRegex = new RegExp(`\\b${importName}\\b\\s*,?\\s*`, 'g');
    if (importRegex.test(content)) {
      content = content.replace(importRegex, '');
      modified = true;
      console.log(`  ✅ Removed unused import: ${importName}`);
    }
  });

  // Remove unused variables
  unusedVars.forEach(varName => {
    const varRegex = new RegExp(`\\b${varName}\\b\\s*=`, 'g');
    if (varRegex.test(content)) {
      content = content.replace(varRegex, '');
      modified = true;
      console.log(`  ✅ Removed unused variable: ${varName}`);
    }
  });

  // Clean up empty import statements
  content = content.replace(/import\s*{\s*}\s*from\s*['"][^'"]+['"];?\s*/g, '');
  content = content.replace(/import\s*{\s*,\s*}\s*from\s*['"][^'"]+['"];?\s*/g, '');

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`  📝 Updated: ${filePath}`);
  }

  return modified;
}

function main() {
  console.log('🚀 MEDFLOW UNUSED IMPORTS CLEANUP STARTING...\n');
  
  let totalCleaned = 0;
  let totalFiles = 0;

  cleanupTargets.forEach(target => {
    console.log(`🔍 Processing: ${target.file}`);
    totalFiles++;
    
    if (cleanFile(target.file, target.unusedImports || [], target.unusedVars || [])) {
      totalCleaned++;
    }
    console.log('');
  });

  console.log(`\n🎉 CLEANUP COMPLETED!`);
  console.log(`📊 Files processed: ${totalFiles}`);
  console.log(`🧹 Files cleaned: ${totalCleaned}`);
  console.log(`\n📋 Next steps:`);
  console.log(`   1. Run 'npm run lint' to check remaining issues`);
  console.log(`   2. Run 'npm run build' to verify no breaking changes`);
  console.log(`   3. Test the application functionality`);
}

main();




