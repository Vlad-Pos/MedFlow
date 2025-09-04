interface Feature {
    id: string;
    text: string;
}
interface FeaturesProps {
    title: string;
    features: Feature[];
    className?: string;
}
export default function Features({ title, features, className }: FeaturesProps): import("react/jsx-runtime").JSX.Element;
export {};
