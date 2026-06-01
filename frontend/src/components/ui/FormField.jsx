import { cn } from '../../utils/cn';

export const FormField = ({ label, children, className }) => (
  <div className={cn('auth-field', className)}>
    {label && <label className="label">{label}</label>}
    {children}
  </div>
);

export const TextInput = ({ className, right, ...props }) => (
  <div className={right ? 'relative' : undefined}>
    <input
      className={cn('input', right && 'pr-10', className)}
      {...props}
    />
    {right && (
      <div className="absolute right-3.5 top-1/2 flex -translate-y-1/2 items-center text-[var(--color-muted)]">
        {right}
      </div>
    )}
  </div>
);
