import React from "react";
import medflowLogo from "../../assets/medflow-logo.svg";

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

export default function Header({ title = "MedFlow", navLinks, className = "" }: HeaderProps) {
  return (
    <header className={`flex justify-between items-center px-4 sm:px-6 md:px-12 py-4 border-b border-gray-700 ${className}`}>
      <div className="flex items-center text-xl font-semibold">
        <img src={medflowLogo} alt="MedFlow" className="h-8 w-auto mr-2" />
        {title}
      </div>
      <nav className="space-x-6 text-sm font-medium text-gray-300">
        {navLinks.map((link) => (
          <a 
            key={link.id}
            href={link.href} 
            className="hover:text-white transition-colors"
          >
            {link.text}
          </a>
        ))}
      </nav>
    </header>
  );
}

