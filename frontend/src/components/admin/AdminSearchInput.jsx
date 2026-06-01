import { Search } from 'lucide-react';
import { cn } from '../../utils/cn';

const AdminSearchInput = ({ className, inputClassName, ...props }) => (
  <div className={cn('relative w-full max-w-[360px]', className)}>
    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
    <input
      className={cn('input h-9 pl-9', inputClassName)}
      {...props}
    />
  </div>
);

export default AdminSearchInput;
