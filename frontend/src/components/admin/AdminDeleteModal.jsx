import { Trash2 } from 'lucide-react';
import AdminModal from './AdminModal';
import Button from '../ui/Button';

const AdminDeleteModal = ({ title, message, error, cancelLabel, deleteLabel, deletingLabel, submitting, onCancel, onDelete }) => (
  <AdminModal onClose={onCancel} maxWidth={400}>
    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
      <Trash2 size={40} className="mx-auto mb-4 text-[var(--color-danger)]" />
      <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--color-text)' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
        {message}
      </p>
      {error && <div style={{ color: 'var(--color-danger)', fontWeight: 400, marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
        <Button onClick={onCancel} variant="white" size="sm">{cancelLabel}</Button>
        <Button onClick={onDelete} variant="danger" size="sm" disabled={submitting}>
          {submitting ? deletingLabel : deleteLabel}
        </Button>
      </div>
    </div>
  </AdminModal>
);

export default AdminDeleteModal;
