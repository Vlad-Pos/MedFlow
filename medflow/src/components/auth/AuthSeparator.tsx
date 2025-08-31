import React from 'react';

interface AuthSeparatorProps {
  className?: string;
}

const AuthSeparator: React.FC<AuthSeparatorProps> = ({ className = '' }) => {
  return (
    <div className={`w-full border-t border-gray-300 ${className}`} />
  );
};

export default AuthSeparator;
