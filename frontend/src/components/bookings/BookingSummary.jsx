import { BedDouble, ShieldCheck } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

const fallbackImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=150';

const Row = ({ label, value, danger }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', color: danger ? 'var(--color-danger)' : undefined }}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

const BookingSummary = ({
  hotel,
  form,
  selectedRoom,
  selectedRoomAvailable,
  selectedRoomUnavailable,
  nights,
  totalPrice,
  submitting,
  bookingBlocked,
}) => (
  <div className="booking-summary-sticky">
    <div className="booking-summary-card card">
      <div className="booking-summary-title">
        <BedDouble size={18} />
        <h3>Ringkasan Pesanan</h3>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ width: 64, height: 64, overflow: 'hidden', borderRadius: 2 }}>
          <img src={hotel?.images?.[0]?.image_url || fallbackImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--color-text)', fontWeight: 300 }}>{hotel?.name}</div>
          <div style={{ color: 'var(--color-muted)', fontSize: '0.8rem', fontWeight: 300, marginTop: '0.25rem' }}>{hotel?.city?.name}</div>
        </div>
      </div>

      {selectedRoom && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--color-muted)', borderBottom: '1px solid var(--color-accent)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <Row label="Tipe Kamar" value={selectedRoom.name} />
          <Row label="Ketersediaan" value={selectedRoomUnavailable ? 'Tidak tersedia' : `${selectedRoomAvailable} kamar`} danger={selectedRoomUnavailable} />
          {form.check_in && <Row label="Tanggal" value={`${formatDate(form.check_in)} - ${form.check_out ? formatDate(form.check_out) : '?'}`} />}
          {nights > 0 && <Row label="Malam" value={`${nights} malam`} />}
          <Row label="Tamu" value={`${form.number_of_guest} tamu`} />
        </div>
      )}

      {nights > 0 && selectedRoom && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
            <span>Harga Kamar</span>
            <span>{formatCurrency(selectedRoom.price_per_night)} x {nights}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
            <span>Pajak & Biaya</span>
            <span>Termasuk</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--color-text)', borderTop: '1px solid var(--color-accent)', paddingTop: '1rem', marginTop: '0.5rem', fontWeight: 300 }}>
            <span>Total</span>
            <span style={{ color: 'var(--color-primary)' }}>{formatCurrency(totalPrice)}</span>
          </div>
        </div>
      )}

      <button type="submit" className="btn btn-primary btn-full animate-float" disabled={submitting || bookingBlocked} style={{ marginTop: '2rem', justifyContent: 'center', height: 56, background: 'var(--color-primary)', opacity: submitting || bookingBlocked ? 0.55 : 1, cursor: submitting || bookingBlocked ? 'not-allowed' : 'pointer', animation: 'none' }}>
        {!selectedRoom ? 'Pilih Tipe Kamar' : selectedRoomUnavailable ? 'Kamar Tidak Tersedia' : submitting ? 'Processing...' : 'Lanjutkan Pembayaran'}
      </button>
      <div className="booking-secure-note">
        <ShieldCheck size={14} />
        <span>Data reservasi dilindungi dan akan diverifikasi sebelum pembayaran.</span>
      </div>
    </div>
  </div>
);

export default BookingSummary;
