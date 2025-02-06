import React from 'react';

export function Avatar({ className = '', children, ...props }) {
  return (
    <div className={`relative w-10 h-10 rounded-full overflow-hidden ${className}`} {...props}>
      {children}
    </div>
  );
}

export function AvatarImage({ src, alt = '', ...props }) {
  return <img src={src} alt={alt} className="w-full h-full object-cover" {...props} />;
}

export function AvatarFallback({ children, ...props }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-200" {...props}>
      {children}
    </div>
  );
} 