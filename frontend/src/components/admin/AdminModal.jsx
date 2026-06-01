import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

const AdminModal = ({ title, children, onClose, maxWidth = 560, className }) => (
  <div
    className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(26,54,93,0.3)] p-4 backdrop-blur"
    onClick={event => event.target === event.currentTarget && onClose?.()}
  >
    <section
      className={cn('card max-h-[90vh] w-full overflow-y-auto p-8 animate-fade-in', className)}
      style={{ maxWidth }}
    >
      {title && (
        <header className="mb-6 flex items-center justify-between border-b border-[var(--color-accent)] pb-3">
          <h3 className="m-0 font-[var(--font-heading)] text-xl font-medium uppercase text-[var(--color-text)]">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-transparent bg-transparent text-[var(--color-muted)] transition hover:border-[var(--glass-border)] hover:text-[var(--color-primary)]"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </header>
      )}
      {children}
    </section>
  </div>
);

export default AdminModal;
