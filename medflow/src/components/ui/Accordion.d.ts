import React from 'react';
interface AccordionItemProps {
    title: string;
    children: React.ReactNode;
    isOpen?: boolean;
    onToggle?: () => void;
    className?: string;
}
interface AccordionProps {
    items: Array<{
        title: string;
        content: React.ReactNode;
    }>;
    allowMultiple?: boolean;
    defaultOpen?: number[];
    className?: string;
}
export declare function AccordionItem({ title, children, isOpen, onToggle, className }: AccordionItemProps): import("react/jsx-runtime").JSX.Element;
export default function Accordion({ items, allowMultiple, defaultOpen, className }: AccordionProps): import("react/jsx-runtime").JSX.Element;
export {};
