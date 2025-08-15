interface Patient {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    lastVisit?: Date;
    totalAppointments: number;
    notes?: string;
    address?: string;
}
interface PatientSearchProps {
    onPatientSelect: (patient: Patient) => void;
    placeholder?: string;
    className?: string;
}
export default function PatientSearch({ onPatientSelect, placeholder, className }: PatientSearchProps): import("react/jsx-runtime").JSX.Element;
export {};
