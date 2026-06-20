import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const variants = {
  primary: 'border-transparent bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]',
  secondary: 'border-[var(--color-accent)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]',
  danger: 'border-transparent bg-[var(--color-danger)] text-white hover:brightness-110',
  ghost: 'border-transparent bg-transparent text-[var(--color-text)] hover:bg-[var(--color-primary-soft)]',
};

const sizes = {
  sm: 'min-h-9 px-3 text-xs',
  md: 'min-h-11 px-5 text-sm',
  lg: 'min-h-12 px-7 text-sm',
  icon: 'size-10 p-0',
};

const Button = forwardRef(function Button(
  { className, variant = 'primary', size = 'md', type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border font-medium transition duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2',
        'focus-visible:ring-offset-[var(--color-background)] disabled:pointer-events-none disabled:opacity-50',
        'hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)] active:translate-y-0',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
});

export default Button;
