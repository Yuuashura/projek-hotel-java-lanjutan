import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, X } from 'lucide-react';

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
    <div className={`logout-modal-backdrop ${closing ? 'is-closing' : ''}`} role="presentation" onMouseDown={handleCancel}>
      <div
        className={`logout-modal-card ${closing ? 'is-closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
        onMouseDown={event => event.stopPropagation()}
      >
        <button type="button" className="logout-modal-close" onClick={handleCancel} disabled={loading} aria-label={cancelLabel}>
          <X size={16} />
        </button>

        <div className="logout-modal-icon">
          {loading ? <span className="logout-modal-spinner" /> : <LogOut size={24} />}
        </div>

        <h2 id="logout-modal-title">{loading ? loadingLabel : title}</h2>
        <p>{loading ? message : message}</p>

        <div className="logout-modal-actions">
          <button type="button" className="btn btn-white btn-sm logout-modal-cancel" onClick={handleCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button type="button" className="btn btn-primary btn-sm logout-modal-confirm" onClick={onConfirm} disabled={loading}>
            {loading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LogoutConfirmModal;
