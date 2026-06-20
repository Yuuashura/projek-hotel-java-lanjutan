import { cn } from '../../lib/utils';

export const Card = ({ className, ...props }) => (
  <div
    className={cn(
      'rounded-lg border border-[var(--color-accent)] bg-[var(--color-surface)] shadow-[var(--shadow-float)]',
      'backdrop-blur-xl',
      className,
    )}
    {...props}
  />
);

const badgeVariants = {
  neutral: 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-muted)]',
  primary: 'border-[var(--color-primary-soft)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
  success: 'border-[var(--color-success-border)] bg-[var(--color-success-soft)] text-[var(--color-success)]',
  danger: 'border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
  warning: 'border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] text-[var(--color-warning)]',
};

export const Badge = ({ className, variant = 'neutral', ...props }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[0.68rem] font-medium uppercase',
      badgeVariants[variant],
      className,
    )}
    {...props}
  />
);

const alertVariants = {
  danger: 'border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
  success: 'border-[var(--color-success-border)] bg-[var(--color-success-soft)] text-[var(--color-success)]',
  warning: 'border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] text-[var(--color-warning)]',
};

export const Alert = ({ className, variant = 'danger', ...props }) => (
  <div
    role="alert"
    className={cn('flex items-center gap-2 rounded-lg border px-4 py-3 text-sm', alertVariants[variant], className)}
    {...props}
  />
);
