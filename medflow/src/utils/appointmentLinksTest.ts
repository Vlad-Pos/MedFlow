/**
 * Integration Test Utilities for MedFlow Appointment Links
 * 
 * Provides testing functions to verify the secure links and rescheduling
 * system works end-to-end with proper error handling.
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import AppointmentLinksService from '../services/appointmentLinks'
import AvailableSlotsService from '../services/availableSlots'
import NotificationSenderService from '../services/notificationSender'
import { AppointmentWithNotifications } from '../types/notifications'

/**
 * Test data and utilities for appointment links integration
 */
export class AppointmentLinksTestUtils {
  
  /**
   * Create a test appointment for link testing
   */
  static createTestAppointment(): AppointmentWithNotifications {
    const appointmentDate = new Date()
    appointmentDate.setDate(appointmentDate.getDate() + 1) // Tomorrow
    appointmentDate.setHours(14, 30, 0, 0) // 2:30 PM
    
    return {
      id: `test-appointment-${Date.now()}`,
      patientName: 'Ion Popescu Test',
      patientEmail: 'test.patient@medflow.ro',
      patientPhone: '+40123456789',
      dateTime: appointmentDate,
      symptoms: 'Control de rutină - test',
      notes: 'Programare de test pentru validarea sistemului',
      status: 'scheduled',
      doctorId: 'test-doctor-123',
      notifications: {
        firstNotification: { sent: false },
        secondNotification: { sent: false },
        confirmationReceived: false,
        optedOut: false
      },
      createdAt: new Date() as any,
      updatedAt: new Date() as any
    }
  }
  
  /**
   * Test secure link generation
   */
  static async testLinkGeneration(): Promise<{
    success: boolean
    links?: { confirmLink: string; declineLink: string }
    error?: string
  }> {
    try {
      console.log('🔗 Testing secure link generation...')
      
      const testAppointment = this.createTestAppointment()
      
      const links = await AppointmentLinksService.generateAppointmentLinks(
        testAppointment.id,
        testAppointment.patientEmail,
        24 // 24 hour expiry for testing
      )
      
      console.log('✅ Links generated successfully:', {
        confirmLink: links.confirmLink.substring(0, 50) + '...',
        declineLink: links.declineLink.substring(0, 50) + '...'
      })
      
      return { success: true, links }
    } catch (error) {
      console.error('❌ Link generation failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
  
  /**
   * Test link validation
   */
  static async testLinkValidation(token: string): Promise<{
    success: boolean
    valid?: boolean
    appointment?: AppointmentWithNotifications
    error?: string
  }> {
    try {
      console.log('🔍 Testing link validation...')
      
      const validation = await AppointmentLinksService.validateAppointmentLink(token)
      
      if (validation.valid) {
        console.log('✅ Link validation successful:', {
          appointmentId: validation.appointment?.id,
          patientName: validation.appointment?.patientName
        })
      } else {
        console.log('⚠️ Link validation failed:', validation.error)
      }
      
      return {
        success: true,
        valid: validation.valid,
        appointment: validation.appointment,
        error: validation.error
      }
    } catch (error) {
      console.error('❌ Link validation error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
  
  /**
   * Test appointment confirmation flow
   */
  static async testConfirmationFlow(confirmToken: string): Promise<{
    success: boolean
    confirmed?: boolean
    error?: string
  }> {
    try {
      console.log('✅ Testing appointment confirmation...')
      
      const result = await AppointmentLinksService.confirmAppointment(confirmToken, {
        ipAddress: '127.0.0.1',
        userAgent: 'Test-Agent/1.0'
      })
      
      if (result.success) {
        console.log('✅ Appointment confirmed successfully:', {
          appointmentId: result.appointment?.id,
          status: result.appointment?.status
        })
      } else {
        console.log('❌ Confirmation failed:', result.error)
      }
      
      return {
        success: result.success,
        confirmed: result.success,
        error: result.error
      }
    } catch (error) {
      console.error('❌ Confirmation flow error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
  
  /**
   * Test available slots functionality
   */
  static async testAvailableSlots(doctorId: string = 'test-doctor-123'): Promise<{
    success: boolean
    slotsCount?: number
    todaySlots?: number
    error?: string
  }> {
    try {
      console.log('📅 Testing available slots detection...')
      
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 7) // Next 7 days
      
      const slots = await AvailableSlotsService.getAvailableSlots({
        doctorId,
        startDate,
        endDate,
        maxSlots: 20
      })
      
      const todaySlots = await AvailableSlotsService.getTodayAvailableSlots(doctorId)
      
      console.log('✅ Available slots retrieved:', {
        weekSlots: slots.length,
        todaySlots: todaySlots.length,
        firstSlot: slots[0]?.displayText
      })
      
      return {
        success: true,
        slotsCount: slots.length,
        todaySlots: todaySlots.length
      }
    } catch (error) {
      console.error('❌ Available slots error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
  
  /**
   * Test rescheduling flow
   */
  static async testReschedulingFlow(
    appointmentId: string,
    doctorId: string = 'test-doctor-123'
  ): Promise<{
    success: boolean
    rescheduled?: boolean
    newDateTime?: Date
    error?: string
  }> {
    try {
      console.log('🔄 Testing rescheduling flow...')
      
      // Get available slots
      const slots = await AvailableSlotsService.getAvailableSlots({
        doctorId,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
        excludeAppointmentId: appointmentId,
        maxSlots: 5
      })
      
      if (slots.length === 0) {
        return {
          success: false,
          error: 'No available slots for rescheduling test'
        }
      }
      
      // Reschedule to first available slot
      const newSlot = slots[0]
      const result = await AppointmentLinksService.rescheduleAppointment(
        appointmentId,
        newSlot.datetime,
        'Test rescheduling - automated test',
        {
          ipAddress: '127.0.0.1',
          userAgent: 'Test-Agent/1.0'
        }
      )
      
      if (result.success) {
        console.log('✅ Appointment rescheduled successfully:', {
          appointmentId,
          newDateTime: newSlot.datetime.toISOString()
        })
      } else {
        console.log('❌ Rescheduling failed:', result.error)
      }
      
      return {
        success: result.success,
        rescheduled: result.success,
        newDateTime: newSlot.datetime,
        error: result.error
      }
    } catch (error) {
      console.error('❌ Rescheduling flow error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
  
  /**
   * Test notification integration
   */
  static async testNotificationIntegration(): Promise<{
    success: boolean
    emailSent?: boolean
    smsSent?: boolean
    error?: string
  }> {
    try {
      console.log('📧 Testing notification integration...')
      
      // Test email notification
      const emailResult = await NotificationSenderService.sendTestNotification(
        'email',
        'test@medflow.ro'
      )
      
      // Test SMS notification  
      const smsResult = await NotificationSenderService.sendTestNotification(
        'sms',
        '+40123456789'
      )
      
      console.log('✅ Notification integration tested:', {
        email: emailResult ? 'sent' : 'failed',
        sms: smsResult ? 'sent' : 'failed'
      })
      
      return {
        success: true,
        emailSent: emailResult,
        smsSent: smsResult
      }
    } catch (error) {
      console.error('❌ Notification integration error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
  
  /**
   * Run complete integration test suite
   */
  static async runCompleteTest(): Promise<{
    success: boolean
    results: Record<string, any>
    summary: string
  }> {
    console.log('🚀 Starting MedFlow Appointment Links Integration Test...\n')
    
    const results: Record<string, any> = {}
    let passedTests = 0
    let totalTests = 0
    
    // Test 1: Link Generation
    totalTests++
    results.linkGeneration = await this.testLinkGeneration()
    if (results.linkGeneration.success) passedTests++
    
    // Test 2: Link Validation (if generation succeeded)
    if (results.linkGeneration.success && results.linkGeneration.links) {
      totalTests++
      const confirmToken = results.linkGeneration.links.confirmLink.split('/').pop() || ''
      results.linkValidation = await this.testLinkValidation(confirmToken)
      if (results.linkValidation.success && results.linkValidation.valid) passedTests++
    }
    
    // Test 3: Available Slots
    totalTests++
    results.availableSlots = await this.testAvailableSlots()
    if (results.availableSlots.success) passedTests++
    
    // Test 4: Notification Integration
    totalTests++
    results.notificationIntegration = await this.testNotificationIntegration()
    if (results.notificationIntegration.success) passedTests++
    
    // Test 5: Confirmation Flow (if link generation succeeded)
    if (results.linkGeneration.success && results.linkGeneration.links) {
      totalTests++
      const confirmToken = results.linkGeneration.links.confirmLink.split('/').pop() || ''
      results.confirmationFlow = await this.testConfirmationFlow(confirmToken)
      if (results.confirmationFlow.success) passedTests++
    }
    
    const success = passedTests === totalTests
    const summary = `Integration test ${success ? 'PASSED' : 'FAILED'}: ${passedTests}/${totalTests} tests successful`
    
    console.log('\n' + '='.repeat(60))
    console.log(summary)
    console.log('='.repeat(60))
    
    if (success) {
      console.log('🎉 All systems operational! Ready for production.')
    } else {
      console.log('⚠️ Some tests failed. Review results and fix issues before deployment.')
    }
    
    return { success, results, summary }
  }
}

/**
 * Browser console helper for manual testing
 */
if (typeof window !== 'undefined') {
  (window as any).testMedFlowLinks = AppointmentLinksTestUtils.runCompleteTest
  console.log('🔗 MedFlow Links Test Suite loaded. Run: testMedFlowLinks()')
}

export default AppointmentLinksTestUtils
