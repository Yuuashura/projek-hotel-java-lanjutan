import { AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

const styles = {
  danger: {
    box: 'border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
    icon: AlertCircle,
  },
  success: {
    box: 'border-[var(--color-success-border)] bg-[var(--color-success-soft)] text-[var(--color-success)]',
    icon: CheckCircle,
  },
  info: {
    box: 'border-[var(--glass-border)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
    icon: CheckCircle,
  },
};

const Alert = ({ type = 'danger', children, className }) => {
  const Icon = styles[type]?.icon || AlertCircle;

  return (
    <div className={cn('mb-6 flex items-center gap-2 rounded-[var(--radius-sm)] border px-4 py-3 text-sm font-medium', styles[type]?.box, className)}>
      <Icon size={16} className="shrink-0" />
      <span>{children}</span>
    </div>
  );
};

export default Alert;
