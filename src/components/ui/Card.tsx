import type { HTMLAttributes, ReactNode } from 'react';

export function Card({ children, className = '', ...props }: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return (
    <section className={`theme-card rounded-md p-5 ${className}`} {...props}>
      {children}
    </section>
  );
}

export function CardTitle({ title, caption }: { title: string; caption?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-pureWhite">{title}</h2>
      {caption ? <p className="mt-1 text-sm text-bodyGrayText">{caption}</p> : null}
    </div>
  );
}
