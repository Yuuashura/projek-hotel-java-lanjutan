import { cn } from '@/lib/utils';

function Table({ className, ...props }) {
  return (
    <div className="w-full overflow-auto rounded-[var(--radius-sm)] border border-[var(--glass-border)]">
      <table className={cn('w-full border-separate border-spacing-0 bg-[var(--color-surface)] text-sm', className)} {...props} />
    </div>
  );
}

function TableHeader({ className, ...props }) {
  return <thead className={cn('[&_tr]:border-b', className)} {...props} />;
}

function TableBody({ className, ...props }) {
  return <tbody className={cn('[&_tr:last-child_td]:border-0', className)} {...props} />;
}

function TableRow({ className, ...props }) {
  return <tr className={cn('transition-colors hover:bg-[color-mix(in_srgb,var(--color-primary-soft)_48%,transparent)]', className)} {...props} />;
}

function TableHead({ className, ...props }) {
  return <th className={cn('border-b-2 border-[var(--color-accent)] bg-[color-mix(in_srgb,var(--glass-bg-strong)_74%,var(--color-background))] px-4 py-3 text-left text-xs font-extrabold uppercase text-[var(--color-text)]', className)} {...props} />;
}

function TableCell({ className, ...props }) {
  return <td className={cn('border-b border-[var(--color-accent)] px-4 py-3 align-middle text-[color-mix(in_srgb,var(--color-text)_88%,var(--color-muted))]', className)} {...props} />;
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
