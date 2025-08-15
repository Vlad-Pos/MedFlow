interface ErrorMessageProps {
    title?: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    showHomeLink?: boolean;
    showBackButton?: boolean;
    errorCode?: string;
    technical?: boolean;
}
export default function ErrorMessage({ title, message, actionLabel, onAction, showHomeLink, showBackButton, errorCode, technical }: ErrorMessageProps): import("react/jsx-runtime").JSX.Element;
export {};
