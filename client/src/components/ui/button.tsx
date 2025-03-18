import * as React from 'react';
import { forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  status?: MutationStatus; // Support for react-query mutation status
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
};

// For compatibility with react-query mutations
type MutationStatus = 'idle' | 'loading' | 'success' | 'error' | 'pending';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  status,
  disabled,
  iconLeft,
  iconRight,
  ...props
}, ref) => {
  // Military-inspired base styling
  const baseClasses = "ios-button flex items-center justify-center font-heading uppercase tracking-wide transition-all focus:outline-none active:scale-[0.98]";
  
  const variantClasses = {
    primary: "bg-primary text-white hover:bg-primary/90 active:bg-primary/80 shadow-ios",
    secondary: "bg-secondary text-white hover:bg-secondary/90 active:bg-secondary/80 shadow-ios",
    accent: "bg-accent text-white hover:bg-accent/90 active:bg-accent/80 shadow-ios",
    outline: "bg-transparent border-2 border-primary/20 text-primary hover:bg-primary/5 active:bg-primary/10",
    ghost: "bg-transparent text-primary hover:bg-primary/5 active:bg-primary/10",
    destructive: "bg-danger text-white hover:bg-danger/90 active:bg-danger/80 shadow-ios"
  };
  
  // iOS-inspired sizing with rounded-ios from our custom theme
  const sizeClasses = {
    sm: "text-xs px-3 py-2 rounded-ios h-9",
    md: "text-sm px-4 py-2.5 rounded-ios h-11",
    lg: "text-base px-5 py-3 rounded-ios h-12"
  };
  
  const widthClass = fullWidth ? "w-full" : "";
  // Determine loading state from either direct prop or mutation status
  const isLoadingState = isLoading || status === 'loading' || status === 'pending';
  const disabledClass = (disabled || isLoadingState) ? "opacity-50 cursor-not-allowed" : "";
  
  return (
    <button
      ref={ref}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`}
      disabled={disabled || isLoadingState}
      {...props}
    >
      {isLoadingState ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="font-medium">Loading</span>
        </>
      ) : (
        <>
          {iconLeft && <span className="mr-2">{iconLeft}</span>}
          <span className="font-medium">{children}</span>
          {iconRight && <span className="ml-2">{iconRight}</span>}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';
