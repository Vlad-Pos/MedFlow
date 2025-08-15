interface HeroProps {
    headline: string;
    description: string;
    ctaText: string;
    onCtaClick: () => void;
    className?: string;
}
export default function Hero({ headline, description, ctaText, onCtaClick, className }: HeroProps): import("react/jsx-runtime").JSX.Element;
export {};
