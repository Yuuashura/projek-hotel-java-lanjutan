import { cn } from '@/lib/utils';

function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-sm)] border border-[var(--glass-border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--glass-bg-strong)_72%,transparent),color-mix(in_srgb,var(--glass-bg)_92%,transparent))] text-[var(--color-text)] shadow-[var(--shadow-float)] backdrop-blur-xl transition duration-300 dark:bg-[linear-gradient(180deg,rgba(15,23,42,.76),rgba(15,23,42,.58))]',
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }) {
  return <div className={cn('space-y-1.5 p-6', className)} {...props} />;
}

function CardTitle({ className, ...props }) {
  return <h3 className={cn('font-heading text-xl font-semibold text-[var(--color-text)]', className)} {...props} />;
}

function CardContent({ className, ...props }) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardContent };
