interface ContactProps {
    title: string;
    description: string;
    onSubmit?: (data: {
        email: string;
        message: string;
    }) => void;
    className?: string;
}
export default function Contact({ title, description, onSubmit, className }: ContactProps): import("react/jsx-runtime").JSX.Element;
export {};
