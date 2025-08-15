import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onClick,
  hover = false
}: CardProps) {
  const baseClasses = 'rounded-lg transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-[#494E62] border border-gray-700',
    elevated: 'bg-[#494E62] shadow-lg border border-gray-700',
    outlined: 'bg-transparent border-2 border-gray-600',
    filled: 'bg-[#58586F] border border-gray-600'
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };
  
  const hoverClasses = hover ? 'hover:scale-105 hover:shadow-xl cursor-pointer' : '';
  const clickClasses = onClick ? 'cursor-pointer' : '';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClasses} ${clickClasses} ${className}`;
  
  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
}


