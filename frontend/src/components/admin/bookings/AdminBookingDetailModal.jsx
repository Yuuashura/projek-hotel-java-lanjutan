import { Check } from 'lucide-react';
import AdminModal from '../AdminModal';
import Alert from '../../ui/Alert';
import Button from '../../ui/Button';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];

const AdminBookingDetailModal = ({ booking, t, error, newStatus, setNewStatus, submitting, getHotelName, onClose, onSave }) => (
  <AdminModal title={t('admin.bookings.detailTitle', { id: booking.id_booking || booking.id })} onClose={onClose} maxWidth={560}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
      {[
        { l: t('admin.table.hotel'), v: getHotelName(booking) },
        { l: t('admin.table.booker'), v: booking.orderer_name },
        { l: t('admin.table.email'), v: booking.orderer_email },
        { l: t('admin.table.phone'), v: booking.orderer_phone },
        { l: t('admin.table.checkIn'), v: formatDate(booking.check_in) },
        { l: t('admin.table.checkOut'), v: formatDate(booking.check_out) },
        { l: t('admin.table.guests'), v: t('admin.bookings.guestCount', { count: booking.number_of_guest }) },
        { l: t('admin.table.total'), v: formatCurrency(booking.total_price) },
        { l: t('admin.table.paymentMethod'), v: booking.payment_method || '-' },
      ].map(({ l, v }) => (
        <div key={l}>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '0.2rem', letterSpacing: '0.5px' }}>{l}</div>
          <div style={{ fontWeight: 400, fontSize: '0.875rem', color: 'var(--color-text)' }}>{v}</div>
        </div>
      ))}
    </div>

    {booking.payment_proof && (
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>{t('admin.bookings.paymentProof')}</div>
        {booking.payment_proof.startsWith('data:image') || booking.payment_proof.match(/\.(jpeg|jpg|gif|png)$/) != null ? (
          <img src={booking.payment_proof} alt={t('admin.bookings.paymentProof')} style={{ maxWidth: '100%', maxHeight: 240, objectFit: 'contain', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-sm)', background: 'var(--color-background)', padding: '4px' }} />
        ) : (
          <a href={booking.payment_proof} target="_blank" rel="noopener noreferrer" className="btn btn-white btn-sm" style={{ display: 'inline-flex', alignItems: 'center' }}>{t('admin.bookings.viewPaymentProof')}</a>
        )}
      </div>
    )}

    <div style={{ borderTop: '1px dashed var(--color-accent)', paddingTop: '1.25rem' }}>
      <label className="label">{t('admin.bookings.updateStatus')}</label>
      <select className="input" value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ marginBottom: '1.25rem' }}>
        {STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
      </select>

      {error && <Alert type="danger" className="mb-3">{error}</Alert>}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Button onClick={onSave} size="sm" full disabled={submitting || newStatus === booking.status}>
          {submitting ? t('admin.actions.saving') : <><Check size={14} /> {t('admin.actions.saveStatus')}</>}
        </Button>
        <Button onClick={onClose} variant="white" size="sm">{t('admin.actions.close')}</Button>
      </div>
    </div>
  </AdminModal>
);

export { STATUS_OPTIONS };
export default AdminBookingDetailModal;
