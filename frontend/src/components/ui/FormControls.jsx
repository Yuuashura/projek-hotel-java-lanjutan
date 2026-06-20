import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const controlClass = [
  'w-full rounded-lg border border-[var(--color-accent)] bg-[var(--color-surface)] px-4 py-3',
  'text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-muted)]',
  'focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)]',
  'disabled:cursor-not-allowed disabled:opacity-55',
].join(' ');

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(controlClass, className)} {...props} />;
});

export const Select = forwardRef(function Select({ className, ...props }, ref) {
  return <select ref={ref} className={cn(controlClass, className)} {...props} />;
});

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(controlClass, 'min-h-24 resize-y', className)} {...props} />;
});

export const Label = ({ className, ...props }) => (
  <label
    className={cn('mb-2 block text-xs font-medium uppercase text-[var(--color-muted)]', className)}
    {...props}
  />
);
