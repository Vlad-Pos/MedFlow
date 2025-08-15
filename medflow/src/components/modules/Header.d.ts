interface NavLink {
    id: string;
    text: string;
    href: string;
}
interface HeaderProps {
    title?: string;
    navLinks: NavLink[];
    className?: string;
}
export default function Header({ title, navLinks, className }: HeaderProps): import("react/jsx-runtime").JSX.Element;
export {};
