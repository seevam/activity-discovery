import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', icon = false, children, ...props }, ref) => {
    const variantClasses = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      success: 'btn-success',
    };

    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-8 py-4 text-lg',
      lg: 'px-10 py-5 text-xl',
    };

    return (
      <button
        ref={ref}
        className={cn(
          variantClasses[variant],
          !icon && sizeClasses[size],
          icon && 'btn-icon',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
