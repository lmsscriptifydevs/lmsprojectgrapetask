import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  children: ReactNode;
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const styles =
    variant === 'primary'
      ? 'border-orangeBorderActive bg-primaryOrange text-pureWhite'
      : 'border-lightBorder bg-cardBg text-mediumGrayTitle hover:border-orangeBorderActive hover:bg-cardBgActive hover:text-lightGrayHover';

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-md border px-4 text-sm font-medium transition hover:text-pureWhite disabled:cursor-not-allowed disabled:opacity-60 ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
