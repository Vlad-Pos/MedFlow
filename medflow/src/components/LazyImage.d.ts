/**
 * Lazy Loading Image Component
 * Performance optimization for the n8n.io-inspired redesign
 */
interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
    placeholder?: string;
}
export default function LazyImage({ src, alt, className, placeholder }: LazyImageProps): import("react/jsx-runtime").JSX.Element;
export {};
