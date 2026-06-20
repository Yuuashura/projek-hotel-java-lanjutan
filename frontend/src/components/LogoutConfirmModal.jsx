import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, X } from 'lucide-react';
import { cn } from '../lib/utils';

const LogoutConfirmModal = ({
  open,
  loading,
  title,
  message,
  confirmLabel,
  cancelLabel,
  loadingLabel,
  onConfirm,
  onCancel
}) => {
  const [visible, setVisible] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    let openTimer;
    if (open) {
      openTimer = window.setTimeout(() => {
        setVisible(true);
        setClosing(false);
      }, 0);
      return () => window.clearTimeout(openTimer);
    }

    if (!visible) return undefined;

    openTimer = window.setTimeout(() => setClosing(true), 0);
    const timer = window.setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 240);

    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(timer);
    };
  }, [open, visible]);

  if (!visible || typeof document === 'undefined') return null;

  const handleCancel = () => {
    if (!loading) onCancel();
  };

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[9999] grid h-screen w-screen place-items-center bg-slate-950/55 p-5 backdrop-blur-[10px]',
        closing
          ? 'animate-[logoutBackdropOut_0.24s_ease_both]'
          : 'animate-[logoutBackdropIn_0.26s_ease_both]',
      )}
      role="presentation"
      onMouseDown={handleCancel}
    >
      <div
        className={cn(
          'relative max-h-[calc(100vh-2.5rem)] w-full max-w-[420px] overflow-auto rounded-lg border border-[var(--color-accent)]',
          'bg-[var(--color-surface)] p-8 text-center text-[var(--color-text)] shadow-[0_28px_80px_rgba(0,0,0,0.24)] max-sm:p-4',
          closing
            ? 'animate-[logoutModalOut_0.24s_ease_both]'
            : 'animate-[logoutModalIn_0.34s_cubic-bezier(0.16,1,0.3,1)_both]',
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
        onMouseDown={(event) => event.stopPropagation()}>

        <button
          type="button"
          className="absolute right-3.5 top-3.5 inline-flex size-8 cursor-pointer items-center justify-center rounded-full border border-[var(--color-accent)] bg-[var(--color-background)] text-[var(--color-muted)] transition hover:rotate-90 hover:border-red-500/50 hover:text-[var(--color-danger)] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleCancel}
          disabled={loading}
          aria-label={cancelLabel}
        >
          <X size={16} />
        </button>

        <div className="mx-auto mb-5 grid size-16 place-items-center rounded-full border border-red-500/20 bg-red-500/10 text-[var(--color-danger)]">
          {loading ? <span className="size-6 animate-[spin_0.75s_linear_infinite] rounded-full border-2 border-red-500/25 border-t-[var(--color-danger)]" /> : <LogOut size={24} />}
        </div>

        <h2 id="logout-modal-title" className="mb-2.5 text-2xl font-light">{loading ? loadingLabel : title}</h2>
        <p className="mx-auto mb-6 max-w-80 text-[0.92rem] font-light leading-relaxed text-[var(--color-muted)]">{message}</p>

        <div className="grid grid-cols-2 gap-3">
          <button type="button" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--color-accent)] bg-[var(--color-background)] px-4 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary)] disabled:opacity-50" onClick={handleCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button type="button" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger)] px-4 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50" onClick={onConfirm} disabled={loading}>
            {loading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LogoutConfirmModal;
