export declare function isDemoMode(): boolean;
interface DemoAppointment {
    id: string;
    patientName: string;
    dateTime: Date;
    status: 'scheduled' | 'completed' | 'no_show';
    symptoms: string;
    notes: string;
    doctorId: string;
}
export declare function getDemoAppointments(): DemoAppointment[];
export declare function addDemoAppointment(appointment: Omit<DemoAppointment, 'id'>): {
    id: string;
    patientName: string;
    dateTime: Date;
    status: "scheduled" | "completed" | "no_show";
    symptoms: string;
    notes: string;
    doctorId: string;
};
export declare function updateDemoAppointment(id: string, updates: Partial<DemoAppointment>): void;
export declare function deleteDemoAppointment(id: string): void;
export declare function subscribeToDemoAppointments(callback: (appointments: DemoAppointment[]) => void): () => void;
export {};
