import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const LogoutConfirmModal = ({
  open,
  loading,
  title,
  message,
  confirmLabel,
  cancelLabel,
  loadingLabel,
  onConfirm,
  onCancel,
}) => {
  const [visible, setVisible] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setClosing(false);
      return undefined;
    }

    if (!visible) return undefined;

    setClosing(true);
    const timer = window.setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 240);

    return () => window.clearTimeout(timer);
  }, [open, visible]);

  if (!visible || typeof document === 'undefined') return null;

  const handleCancel = () => {
    if (!loading) onCancel();
  };

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[4000] grid place-items-center bg-[rgba(3,7,18,.48)] p-4 backdrop-blur-xl backdrop-saturate-150',
        closing ? 'animate-[logoutBackdropOut_.24s_ease_forwards]' : 'animate-[logoutBackdropIn_.2s_ease_forwards]',
      )}
      role="presentation"
      onMouseDown={handleCancel}
    >
      <div
        className={cn(
          'relative w-[min(420px,calc(100vw-2rem))] rounded-[var(--radius-sm)] border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] p-7 text-center text-[var(--color-text)] shadow-[var(--shadow-hover)] backdrop-blur-2xl',
          closing ? 'animate-[logoutModalOut_.24s_ease_forwards]' : 'animate-[logoutModalIn_.28s_cubic-bezier(.16,1,.3,1)_forwards]',
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
        onMouseDown={event => event.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--color-muted)] transition hover:-translate-y-0.5 hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleCancel}
          disabled={loading}
          aria-label={cancelLabel}
        >
          <X size={16} />
        </button>

        <div className="mx-auto mb-5 grid size-16 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--color-primary-soft)] text-[var(--color-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,.18)]">
          {loading ? <span className="size-7 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-[var(--color-primary)]" /> : <LogOut size={24} />}
        </div>

        <h2 id="logout-modal-title" className="m-0 font-heading text-2xl font-bold text-[var(--color-text)]">
          {loading ? loadingLabel : title}
        </h2>
        <p className="mx-auto mb-0 mt-3 max-w-[32ch] text-sm leading-6 text-[var(--color-muted)]">{message}</p>

        <div className="mt-7 grid grid-cols-2 gap-3 max-[420px]:grid-cols-1">
          <Button type="button" variant="secondary" size="sm" onClick={handleCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={onConfirm} disabled={loading}>
            {loading ? loadingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LogoutConfirmModal;
