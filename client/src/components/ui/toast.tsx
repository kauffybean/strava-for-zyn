import React, { forwardRef, useEffect, useState } from 'react';
import { X } from 'lucide-react';

type ToastVariant = 'default' | 'destructive';

type ToastProps = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  onClose?: () => void;
};

export const Toast = forwardRef<HTMLDivElement, ToastProps>(({
  title,
  description,
  variant = 'default',
  onClose,
}, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);
  
  const baseClasses = "ios-card p-4 shadow-lg max-w-sm pointer-events-auto transform transition-all duration-300";
  const variantClasses = {
    default: "bg-white border-gray-200",
    destructive: "bg-red-50 border-red-200 text-red-800"
  };
  
  return (
    <div 
      ref={ref}
      className={`${baseClasses} ${variantClasses[variant]} ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
      role="alert"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-medium text-sm">{title}</h3>
          {description && (
            <p className="text-xs mt-1 text-gray-500">{description}</p>
          )}
        </div>
        <button 
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-500"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
});

Toast.displayName = 'Toast';
