import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold leading-none backdrop-blur',
  {
    variants: {
      variant: {
        default: 'border-[var(--color-accent)] bg-[color-mix(in_srgb,var(--glass-bg-strong)_78%,transparent)] text-[var(--color-text)]',
        primary: 'border-[var(--color-primary-soft)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
        success: 'border-[var(--color-success-border)] bg-[var(--color-success-soft)] text-[var(--color-success)]',
        warning: 'border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] text-[var(--color-warning)]',
        danger: 'border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
        muted: 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-muted)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
