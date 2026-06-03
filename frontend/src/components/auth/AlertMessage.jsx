import { AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const toneMap = {
  danger: {
    icon: AlertCircle,
    className: 'border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
  },
  success: {
    icon: CheckCircle,
    className: 'border-[var(--color-success-border)] bg-[var(--color-success-soft)] text-[var(--color-success)]',
  },
};

const AlertMessage = ({ tone = 'danger', children, className }) => {
  if (!children) return null;
  const settings = toneMap[tone] || toneMap.danger;
  const Icon = settings.icon;

  return (
    <div className={cn('mb-5 flex items-center gap-2 rounded-[var(--radius-sm)] border px-4 py-3 text-sm font-medium', settings.className, className)}>
      <Icon size={16} className="shrink-0" />
      <span>{children}</span>
    </div>
  );
};

export default AlertMessage;
