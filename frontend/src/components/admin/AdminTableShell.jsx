import { cn } from '../../utils/cn';

export const AdminEmptyState = ({ children, className }) => (
  <div className={cn('card mt-4 px-6 py-12 text-center text-sm font-normal text-[var(--color-muted)]', className)}>
    {children}
  </div>
);

const AdminTableShell = ({ children, isEmpty, emptyText, className }) => (
  <div className={cn('overflow-x-auto', className)}>
    {children}
    {isEmpty && <AdminEmptyState>{emptyText}</AdminEmptyState>}
  </div>
);

export default AdminTableShell;
