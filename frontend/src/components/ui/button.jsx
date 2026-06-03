import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius-sm)] border text-sm font-bold transition duration-300 ease-out disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--color-primary)_36%,transparent)]',
  {
    variants: {
      variant: {
        primary: 'border-[color-mix(in_srgb,var(--color-primary)_46%,transparent)] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))] text-white shadow-[0_14px_34px_-24px_rgba(15,23,42,.42)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)] dark:text-[#061426]',
        secondary: 'border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--color-text)] shadow-[var(--shadow-float)] backdrop-blur-xl hover:-translate-y-0.5 hover:bg-[var(--color-background)]',
        ghost: 'border-transparent bg-transparent text-[var(--color-text)] hover:bg-[var(--color-primary-soft)]',
        danger: 'border-[var(--color-danger-border)] bg-[var(--color-danger)] text-white hover:-translate-y-0.5',
      },
      size: {
        sm: 'min-h-9 px-3 text-xs',
        md: 'px-5 py-2.5',
        lg: 'min-h-12 px-8 text-base',
        icon: 'size-10 p-0',
      },
      full: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      full: false,
    },
  },
);

function Button({ className, variant, size, full, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, full, className }))} {...props} />;
}

export { Button, buttonVariants };
