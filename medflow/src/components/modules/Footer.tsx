import React from "react";

interface FooterProps {
  copyrightText?: string;
  className?: string;
}

export default function Footer({ 
  copyrightText = "© 2024 MedFlow. All rights reserved.", 
  className = "" 
}: FooterProps) {
  return (
    <footer className={`border-t border-gray-700 py-8 px-4 sm:px-6 md:px-12 text-center text-gray-400 ${className}`}>
      <p>{copyrightText}</p>
    </footer>
  );
}

