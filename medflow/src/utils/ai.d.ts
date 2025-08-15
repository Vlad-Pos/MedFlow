export interface TimeSlot {
    start: Date;
    end: Date;
}
export interface ScheduleConstraints {
    workDays: number[];
    workStartHour: number;
    workEndHour: number;
    slotMinutes: number;
}
export declare function suggestSmartSlots(constraints: ScheduleConstraints, existingAppointments: TimeSlot[], fromDate?: Date, count?: number): TimeSlot[];
