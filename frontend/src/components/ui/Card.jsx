import { cn } from '../../utils/cn';

const Card = ({ className, children, ...props }) => (
  <div
    className={cn(
      'relative overflow-hidden rounded-[var(--radius-sm)] border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[var(--shadow-float)] backdrop-blur-xl',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardAccent = () => (
  <div className="absolute left-0 right-0 top-0 h-1 bg-[linear-gradient(90deg,var(--color-primary),var(--color-primary-hover),var(--color-gold))]" />
);

export default Card;
