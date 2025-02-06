import React from 'react';

export function ScrollArea({ children, className = '', ...props }) {
  return (
    <div 
      className={`overflow-auto ${className}`}
      {...props}
    >
      {children}
    </div>
  );
} 