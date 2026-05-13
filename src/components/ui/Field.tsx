import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-mediumGrayTitle">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  'theme-focus min-h-11 w-full rounded-md border border-lightBorder bg-cardBg px-3 text-sm text-pureWhite placeholder:text-bodyGrayText';

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputClass} {...props} />;
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={inputClass} {...props} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputClass} min-h-24 py-3`} {...props} />;
}
