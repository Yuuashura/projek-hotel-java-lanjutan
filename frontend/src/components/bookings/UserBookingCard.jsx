import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ChevronDown, ChevronUp, Clock, MapPin, Users, XCircle } from 'lucide-react';
import { diffDays, formatCurrency, formatDate, statusColor } from '../../utils/formatters';

const formatCount = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
};

const getBadgeColor = (status) => {
  switch (status) {
    case 'PENDING':
      return { bg: 'rgba(212,175,55,0.1)', text: 'var(--color-primary)' };
    case 'CONFIRMED':
      return { bg: 'rgba(72,187,120,0.1)', text: '#276749' };
    case 'CANCELLED':
      return { bg: 'rgba(229,62,62,0.1)', text: '#9B2C2C' };
    default:
      return { bg: 'var(--color-accent)', text: 'var(--color-muted)' };
  }
};

const UserBookingCard = ({ booking, onCancel }) => {
  const { label } = statusColor(booking.status);
  const [timeLeft, setTimeLeft] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const alreadyPaid = !!booking.payment_proof;
  const nights = diffDays(booking.check_in, booking.check_out);
  const hotelId = booking.hotel_id ?? booking.hotelId;
  const roomTypeId = booking.room_type_id ?? booking.roomTypeId;
  const hotelName = booking.hotel_name || `Hotel #${hotelId}`;
  const roomTypeName = booking.room_type_name || `Tipe Kamar #${roomTypeId}`;
  const statusBadge = getBadgeColor(booking.status);

  useEffect(() => {
    if (!booking.payment_deadline || booking.status !== 'PENDING') return undefined;

    const deadline = new Date(booking.payment_deadline).getTime();
    setTimeLeft(Math.max(0, Math.floor((deadline - Date.now()) / 1000)));
    const timer = setInterval(() => setTimeLeft(left => Math.max(0, left - 1)), 1000);
    return () => clearInterval(timer);
  }, [booking]);

  return (
    <div className="card card-hover booking-history-card flow-animate" style={{ padding: '2rem', border: '1px solid var(--color-accent)', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--color-surface)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ color: 'var(--color-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Pesanan #{booking.id_booking || booking.id}
          </span>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.4rem', margin: '0.25rem 0 0', color: 'var(--color-text)' }}>
            {hotelName}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem', color: 'var(--color-muted)', fontSize: '0.8rem', fontWeight: 300 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Users size={13} /> {roomTypeName}
            </span>
            {booking.hotel_city && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={13} /> {booking.hotel_city}
              </span>
            )}
          </div>
        </div>
        <span className="badge" style={{ background: statusBadge.bg, color: statusBadge.text, borderColor: 'transparent', padding: '0.4rem 1rem' }}>{label}</span>
      </div>

      <div className="booking-history-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1.5rem', padding: '1.25rem', background: 'var(--color-background)', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-sm)' }}>
        {[
          ['Check-In', formatDate(booking.check_in)],
          ['Check-Out', formatDate(booking.check_out)],
          ['Durasi', `${nights} malam`],
          ['Tamu', `${booking.number_of_guest} orang`],
          ['Total', formatCurrency(booking.total_price), true],
        ].map(([title, value, highlight]) => (
          <div key={title}>
            <div style={{ color: 'var(--color-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>{title}</div>
            <div style={{ fontWeight: 400, fontSize: highlight ? '0.95rem' : '0.85rem', color: highlight ? 'var(--color-primary)' : 'var(--color-text)' }}>{value}</div>
          </div>
        ))}
      </div>

      {alreadyPaid && (
        <div style={{ background: 'rgba(72,187,120,0.05)', border: '1px solid rgba(72,187,120,0.2)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#276749', borderRadius: 'var(--radius-sm)' }}>
          <CheckCircle size={14} style={{ color: '#38A169', flexShrink: 0 }} />
          Bukti pembayaran sudah dikirim - menunggu konfirmasi admin hotel.
        </div>
      )}

      {booking.status === 'PENDING' && timeLeft > 0 && (
        <div style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
          <Clock size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text)', fontWeight: 300 }}>Batas bayar: <strong style={{ color: 'var(--color-primary)', fontWeight: 500 }}>{formatCount(timeLeft)}</strong></span>
        </div>
      )}

      {expanded && (
        <div style={{ background: 'var(--color-background)', border: '1px solid var(--color-accent)', padding: '1.5rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderRadius: 'var(--radius-sm)' }}>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--color-text)', margin: 0, fontWeight: 300 }}>Detail Pemesan</h4>
          <div className="booking-history-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem 2rem' }}>
            {[
              { label: 'Nama Pemesan', val: booking.orderer_name },
              { label: 'Email', val: booking.orderer_email },
              { label: 'No. Telepon', val: booking.orderer_phone },
              { label: 'Metode Bayar', val: booking.payment_method || '-' },
              { label: 'ID Pesanan', val: `#${booking.id_booking || booking.id}` },
              { label: 'Hotel', val: hotelName },
              { label: 'Tipe Kamar', val: roomTypeName },
              { label: 'Alamat Hotel', val: booking.hotel_address },
            ].map(({ label: itemLabel, val }) => val && (
              <div key={itemLabel}>
                <div style={{ color: 'var(--color-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{itemLabel}</div>
                <div style={{ fontWeight: 400, color: 'var(--color-text)', marginTop: '0.15rem' }}>{val}</div>
              </div>
            ))}
          </div>
          {booking.payment_proof && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ color: 'var(--color-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Bukti Pembayaran</div>
              <a href={booking.payment_proof} target="_blank" rel="noopener noreferrer">
                <img src={booking.payment_proof} alt="Bukti Bayar" style={{ maxHeight: 160, maxWidth: '100%', objectFit: 'contain', borderRadius: 2, border: '1px solid var(--color-accent)' }} />
              </a>
            </div>
          )}
        </div>
      )}

      <div className="booking-history-actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', borderTop: '1px solid var(--color-accent)', paddingTop: '1.25rem' }}>
        {booking.status === 'PENDING' && !alreadyPaid && (
          <Link to={`/payment/${booking.id_booking || booking.id}`} className="btn btn-primary btn-sm" style={{ background: 'var(--color-primary)' }}>
            Bayar Sekarang
          </Link>
        )}
        {booking.status === 'PENDING' && alreadyPaid && (
          <Link to={`/payment/${booking.id_booking || booking.id}`} className="btn btn-white btn-sm" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
            Ganti Bukti Bayar
          </Link>
        )}
        {booking.status === 'COMPLETED' && (
          <Link to={`/hotels/${hotelId}`} className="btn btn-primary btn-sm" style={{ background: 'var(--color-primary)' }}>Pesan Lagi</Link>
        )}
        <button onClick={() => setExpanded(value => !value)} className="btn btn-white btn-sm">
          {expanded ? <><ChevronUp size={12} /> Sembunyikan</> : <><ChevronDown size={12} /> Lihat Detail</>}
        </button>
        {booking.status === 'PENDING' && (
          <button
            onClick={() => onCancel(booking.id_booking || booking.id)}
            className="btn btn-white btn-sm"
            style={{ color: '#E53E3E', borderColor: 'rgba(229,62,62,0.3)' }}
            onMouseEnter={event => event.currentTarget.style.background = '#FFF5F5'}
            onMouseLeave={event => event.currentTarget.style.background = 'transparent'}
          >
            <XCircle size={12} style={{ color: '#E53E3E' }} /> Batalkan
          </button>
        )}
      </div>
    </div>
  );
};

export default UserBookingCard;
