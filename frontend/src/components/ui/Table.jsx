import { cn } from '../../lib/utils';

export const TableContainer = ({ className, ...props }) => (
  <div
    className={cn('overflow-x-auto rounded-lg border border-[var(--color-accent)] bg-[var(--color-surface)]', className)}
    {...props}
  />
);

export const Table = ({ className, ...props }) => (
  <table className={cn('w-full min-w-[720px] border-collapse text-left text-sm', className)} {...props} />
);

export const TableHead = ({ className, ...props }) => (
  <th
    className={cn(
      'border-b border-[var(--color-accent)] bg-[var(--color-primary-soft)] px-4 py-3',
      'text-[0.7rem] font-semibold uppercase text-[var(--color-muted)]',
      className,
    )}
    {...props}
  />
);

export const TableCell = ({ className, ...props }) => (
  <td className={cn('border-b border-[var(--color-accent)] px-4 py-3 text-[var(--color-text)]', className)} {...props} />
);
