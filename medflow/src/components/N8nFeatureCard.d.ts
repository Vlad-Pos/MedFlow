/**
 * n8n.io-inspired Feature Card Component
 * Enhanced visual styling matching the provided visual package
 */
import { LucideIcon } from 'lucide-react';
interface N8nFeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    benefit: string;
    index: number;
    isActive?: boolean;
}
export default function N8nFeatureCard({ icon: Icon, title, description, benefit, index, isActive }: N8nFeatureCardProps): import("react/jsx-runtime").JSX.Element;
export {};
