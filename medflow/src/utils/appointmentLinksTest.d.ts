/**
 * Integration Test Utilities for MedFlow Appointment Links
 *
 * Provides testing functions to verify the secure links and rescheduling
 * system works end-to-end with proper error handling.
 *
 * @author MedFlow Team
 * @version 1.0
 */
import { AppointmentWithNotifications } from '../types/notifications';
/**
 * Test data and utilities for appointment links integration
 */
export declare class AppointmentLinksTestUtils {
    /**
     * Create a test appointment for link testing
     */
    static createTestAppointment(): AppointmentWithNotifications;
    /**
     * Test secure link generation
     */
    static testLinkGeneration(): Promise<{
        success: boolean;
        links?: {
            confirmLink: string;
            declineLink: string;
        };
        error?: string;
    }>;
    /**
     * Test link validation
     */
    static testLinkValidation(token: string): Promise<{
        success: boolean;
        valid?: boolean;
        appointment?: AppointmentWithNotifications;
        error?: string;
    }>;
    /**
     * Test appointment confirmation flow
     */
    static testConfirmationFlow(confirmToken: string): Promise<{
        success: boolean;
        confirmed?: boolean;
        error?: string;
    }>;
    /**
     * Test available slots functionality
     */
    static testAvailableSlots(doctorId?: string): Promise<{
        success: boolean;
        slotsCount?: number;
        todaySlots?: number;
        error?: string;
    }>;
    /**
     * Test rescheduling flow
     */
    static testReschedulingFlow(appointmentId: string, doctorId?: string): Promise<{
        success: boolean;
        rescheduled?: boolean;
        newDateTime?: Date;
        error?: string;
    }>;
    /**
     * Test notification integration
     */
    static testNotificationIntegration(): Promise<{
        success: boolean;
        emailSent?: boolean;
        smsSent?: boolean;
        error?: string;
    }>;
    /**
     * Run complete integration test suite
     */
    static runCompleteTest(): Promise<{
        success: boolean;
        results: Record<string, unknown>;
        summary: string;
    }>;
}
export default AppointmentLinksTestUtils;
