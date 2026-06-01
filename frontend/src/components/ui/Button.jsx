import { cn } from '../../utils/cn';

const variants = {
  primary:
    'border-transparent bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))] text-white shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]',
  white:
    'border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--color-text)] shadow-[var(--shadow-float)] backdrop-blur-xl hover:-translate-y-0.5 hover:border-[var(--color-primary)]',
  danger:
    'border-transparent bg-[var(--color-danger)] text-white shadow-[0_14px_34px_-24px_rgba(127,29,29,0.5)] hover:-translate-y-0.5',
  ghost:
    'border-transparent bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]',
};

const sizes = {
  sm: 'min-h-9 px-3 py-2 text-xs',
  md: 'min-h-[42px] px-5 py-3 text-sm',
  lg: 'min-h-12 px-7 py-3.5 text-base',
};

const Button = ({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  full = false,
  className,
  disabled,
  children,
  ...props
}) => (
  <Component
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] border font-bold no-underline transition duration-300 ease-out disabled:pointer-events-none disabled:opacity-65',
      sizes[size],
      variants[variant],
      full && 'w-full',
      className
    )}
    disabled={disabled}
    {...props}
  >
    {children}
  </Component>
);

export default Button;
