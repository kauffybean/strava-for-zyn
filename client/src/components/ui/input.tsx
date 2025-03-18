import * as React from 'react';
import { forwardRef } from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
  variant?: 'default' | 'outline' | 'filled';
};

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  className = '',
  label,
  error,
  fullWidth = false,
  leftIcon,
  rightIcon,
  helperText,
  variant = 'default',
  ...props
}, ref) => {
  // Military-inspired styling
  const baseClasses = "tactical-input px-4 py-3 rounded-ios transition-all focus:outline-none";
  
  const variantClasses = {
    default: "border border-primary/20 bg-white focus:ring-2 focus:ring-secondary focus:border-transparent",
    outline: "border-2 border-primary/20 bg-transparent focus:border-secondary",
    filled: "border border-transparent bg-primary/5 focus:bg-primary/10"
  };
  
  const errorClasses = error 
    ? "border-danger/50 text-danger focus:ring-danger focus:border-danger" 
    : variantClasses[variant];
    
  const widthClass = fullWidth ? "w-full" : "";
  const iconPaddingLeft = leftIcon ? "pl-10" : "";
  const iconPaddingRight = rightIcon ? "pr-10" : "";
  
  return (
    <div className={`${widthClass} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-primary mb-1.5 font-heading">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={`${baseClasses} ${errorClasses} ${widthClass} ${iconPaddingLeft} ${iconPaddingRight}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted">
            {rightIcon}
          </div>
        )}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-danger flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-muted">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
