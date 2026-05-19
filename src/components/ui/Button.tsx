import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  const sizeStyles = {
    sm: 'min-h-8 sm:min-h-9 px-3 py-1.5 text-xs rounded-lg',
    md: 'min-h-10 sm:min-h-11 px-3.5 sm:px-4 py-2 text-xs sm:text-sm rounded-lg sm:rounded-xl',
    lg: 'min-h-10 sm:min-h-12 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl',
  };

  const variantStyles =
    variant === 'primary'
      ? 'border-orangeBorderActive bg-primaryOrange text-pureWhite active:bg-opacity-90'
      : 'border-lightBorder bg-cardBg text-mediumGrayTitle hover:border-orangeBorderActive hover:bg-cardBgActive hover:text-lightGrayHover active:bg-cardBgActive';

  return (
    <button
      className={`inline-flex items-center justify-center border font-medium active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-100 ${sizeStyles[size]} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
