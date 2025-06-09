import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  showCompanyName?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Carregando...', 
  size = 'md',
  showCompanyName = false 
}) => {
  const { user } = useAuth();
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  const containerClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={`flex items-center justify-center ${containerClasses[size]}`}>
      <div className="text-center">
        {/* Company Logo/Icon */}
        <div className="relative mb-4">
          <div className="bg-primary p-3 rounded-xl mx-auto w-fit">
            <MessageCircle className={`${sizeClasses[size]} text-white`} />
          </div>
          {/* Spinning ring around logo */}
          <div className={`absolute inset-0 border-2 border-secondary border-t-transparent rounded-xl animate-spin ${sizeClasses[size]}`}></div>
        </div>
        
        {/* Loading message */}
        <p className="text-gray-600 font-medium mb-2">{message}</p>
        
        {/* Company name if available */}
        {showCompanyName && user?.currentCompany && (
          <p className="text-sm text-gray-500">
            {user.currentCompany.name}
          </p>
        )}
        
        {/* SimpliWa branding */}
        <div className="mt-4 flex items-center justify-center space-x-2">
          <div className="bg-accent p-1 rounded">
            <MessageCircle className="h-3 w-3 text-primary" />
          </div>
          <span className="text-xs text-gray-400 font-medium">SimpliWa</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;