import React from 'react';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`ios-card bg-white ${className}`} {...props}>
      {children}
    </div>
  );
}

type CardHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export function CardHeader({ children, className = '', ...props }: CardHeaderProps) {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement> & {
  className?: string;
};

export function CardTitle({ children, className = '', ...props }: CardTitleProps) {
  return (
    <h3 className={`text-lg font-semibold ${className}`} {...props}>
      {children}
    </h3>
  );
}

type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement> & {
  className?: string;
};

export function CardDescription({ children, className = '', ...props }: CardDescriptionProps) {
  return (
    <p className={`text-sm text-gray-500 ${className}`} {...props}>
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
    <div className={`p-4 border-t border-gray-100 ${className}`} {...props}>
      {children}
    </div>
  );
}
