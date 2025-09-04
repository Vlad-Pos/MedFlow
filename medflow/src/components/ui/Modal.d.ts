import React from 'react';
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showCloseButton?: boolean;
    closeOnOverlayClick?: boolean;
    className?: string;
}
export default function Modal({ isOpen, onClose, title, children, size, showCloseButton, closeOnOverlayClick, className }: ModalProps): import("react/jsx-runtime").JSX.Element;
export {};
