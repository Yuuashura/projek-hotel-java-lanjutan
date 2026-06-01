import Card from '../ui/Card';
import { cn } from '../../utils/cn';

const AdminSectionCard = ({ title, children, className }) => (
  <Card className={cn('p-6', className)}>
    {title && (
      <h3 className="mb-5 border-b border-[var(--color-accent)] pb-3 font-[var(--font-heading)] text-base font-medium uppercase text-[var(--color-text)]">
        {title}
      </h3>
    )}
    {children}
  </Card>
);

export const AdminStatCard = ({ label, value, icon: Icon, sub }) => (
  <Card className="flex flex-col gap-3 p-7 shadow-none">
    <div className="flex items-start justify-between">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
        <Icon size={18} />
      </div>
    </div>
    <div>
      <div className="font-[var(--font-heading)] text-3xl font-light leading-none text-[var(--color-text)]">
        {value}
      </div>
      <div className="mt-1.5 text-xs font-medium uppercase text-[var(--color-muted)]">
        {label}
      </div>
      {sub && <div className="mt-1 text-xs font-normal text-[var(--color-muted)]">{sub}</div>}
    </div>
  </Card>
);

export default AdminSectionCard;
