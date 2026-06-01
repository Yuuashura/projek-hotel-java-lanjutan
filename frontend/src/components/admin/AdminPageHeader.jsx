import { cn } from '../../utils/cn';

const AdminPageHeader = ({ title, subtitle, actions, className }) => (
  <header className={cn('mb-8 flex flex-wrap items-center justify-between gap-4', className)}>
    <div>
      <h2 className="m-0 font-[var(--font-heading)] text-3xl font-medium uppercase text-[var(--color-text)]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 mb-0 text-sm font-normal text-[var(--color-muted)]">
          {subtitle}
        </p>
      )}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
  </header>
);

export default AdminPageHeader;
