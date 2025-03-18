import * as React from 'react';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  variant?: 'default' | 'outline' | 'accent';
};

export function Card({ children, className = '', variant = 'default', ...props }: CardProps) {
  const baseClasses = "tactical-card rounded-ios overflow-hidden";
  
  const variantClasses = {
    default: "bg-white shadow-card border border-primary/5",
    outline: "bg-white border-2 border-primary/10",
    accent: "bg-background-dark text-white border border-secondary/20"
  };
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}

type CardHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export function CardHeader({ children, className = '', ...props }: CardHeaderProps) {
  return (
    <div className={`p-4 border-b border-primary/5 ${className}`} {...props}>
      {children}
    </div>
  );
}

type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement> & {
  className?: string;
};

export function CardTitle({ children, className = '', ...props }: CardTitleProps) {
  return (
    <h3 className={`text-lg font-heading font-semibold tracking-wide ${className}`} {...props}>
      {children}
    </h3>
  );
}

type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement> & {
  className?: string;
};

export function CardDescription({ children, className = '', ...props }: CardDescriptionProps) {
  return (
    <p className={`text-sm text-muted mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
}

type CardContentProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export function CardContent({ children, className = '', ...props }: CardContentProps) {
  return (
    <div className={`p-4 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

type CardFooterProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export function CardFooter({ children, className = '', ...props }: CardFooterProps) {
  return (
    <div className={`p-4 border-t border-primary/5 flex items-center justify-between ${className}`} {...props}>
      {children}
    </div>
  );
}

type CardBadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';
};

export function CardBadge({ 
  children, 
  className = '', 
  color = 'primary',
  ...props 
}: CardBadgeProps) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger"
  };
  
  return (
    <span 
      className={`tactical-badge inline-flex items-center px-2.5 py-0.5 rounded-pill text-xs font-medium ${colorClasses[color]} ${className}`} 
      {...props}
    >
      {children}
    </span>
  );
}
