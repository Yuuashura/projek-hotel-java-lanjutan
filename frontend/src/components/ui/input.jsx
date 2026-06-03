import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--color-background)_84%,white)] px-4 py-3 text-sm font-medium text-[var(--color-text)] shadow-[inset_0_1px_0_rgba(255,255,255,.14)] outline-none backdrop-blur placeholder:text-[color-mix(in_srgb,var(--color-muted)_72%,white)] focus:border-[color-mix(in_srgb,var(--color-primary)_42%,var(--glass-border))] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] disabled:cursor-not-allowed disabled:opacity-75 dark:bg-[color-mix(in_srgb,var(--glass-bg-strong)_88%,transparent)]',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';

export { Input };
