import React from 'react';

interface CustomerAvatarProps {
  name: string;
  avatar_url?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const CustomerAvatar: React.FC<CustomerAvatarProps> = ({ 
  name, 
  avatar_url, 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  };

  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  if (avatar_url) {
    return (
      <div className="relative">
        <img
          src={avatar_url}
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
          onError={(e) => {
            // Se a imagem falhar ao carregar, esconder e mostrar o fallback
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) {
              fallback.style.display = 'flex';
            }
          }}
        />
        <div 
          className={`${sizeClasses[size]} rounded-full bg-green-500 flex items-center justify-center text-white font-bold ${className} hidden`}
        >
          {getInitials(name)}
        </div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-green-500 flex items-center justify-center text-white font-bold ${className}`}>
      {getInitials(name)}
    </div>
  );
};

export default CustomerAvatar;