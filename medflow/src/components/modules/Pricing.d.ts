interface PricingPlan {
    id: string;
    name: string;
    price: string;
    features: string[];
    ctaText: string;
    onSelect?: () => void;
}
interface PricingProps {
    title: string;
    description: string;
    plans: PricingPlan[];
    className?: string;
}
export default function Pricing({ title, description, plans, className }: PricingProps): import("react/jsx-runtime").JSX.Element;
export {};
