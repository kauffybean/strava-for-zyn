import React, { forwardRef } from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  fullWidth?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  className = '',
  label,
  error,
  fullWidth = false,
  ...props
}, ref) => {
  const baseClasses = "ios-input transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF5E3A] focus:border-transparent";
  const errorClasses = error ? "border-red-300 text-red-900 placeholder-red-300" : "border-gray-300";
  const widthClass = fullWidth ? "w-full" : "";
  
  return (
    <div className={`${widthClass} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`${baseClasses} ${errorClasses} ${widthClass}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
