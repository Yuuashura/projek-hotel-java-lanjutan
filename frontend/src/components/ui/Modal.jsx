import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import Button from './Button';

const Modal = ({ open, onClose, title, children, className, showClose = true }) => {
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[300] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        className={cn(
          'max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg border border-[var(--color-accent)]',
          'bg-[var(--color-surface-solid)] p-6 text-[var(--color-text)] shadow-[var(--shadow-hover)]',
          className,
        )}
      >
        {(title || showClose) && (
          <header className="mb-5 flex items-center justify-between gap-4 border-b border-[var(--color-accent)] pb-4">
            <div className="font-[var(--font-heading)] text-lg font-semibold">{title}</div>
            {showClose && (
              <Button size="icon" variant="ghost" onClick={onClose} aria-label="Tutup">
                <X size={18} />
              </Button>
            )}
          </header>
        )}
        {children}
      </section>
    </div>,
    document.body,
  );
};

export default Modal;
