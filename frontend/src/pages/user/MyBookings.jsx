import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, ArrowRight, ChevronDown, ChevronUp, MapPin, Users } from 'lucide-react';
import { formatCurrency, formatDate, diffDays, statusColor } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('active');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'ROLE_USER') navigate('/login');
  }, [user]);

  const loadBookings = () => {
    setLoading(true);
    api.get(`/api/bookings/my?status=${tab}`)
      .then(r => setBookings(r.data.data || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadBookings(); }, [tab]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) return;
    try {
      await api.patch(`/api/bookings/${bookingId}/cancel`);
      loadBookings();
    } catch {
      alert('Gagal membatalkan pesanan. Silakan coba lagi.');
    }
  };

  const tabs = [
    { key: 'active', label: 'Pesanan Aktif', icon: Clock, color: 'var(--neo-orange)' },
    { key: 'history', label: 'Riwayat Pesanan', icon: CheckCircle, color: '#6b7280' },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, textTransform: 'uppercase', fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', marginBottom: '0.5rem' }}>Pesanan Saya</h1>
      <p style={{ color: '#6b7280', fontWeight: 500, marginBottom: '2rem', fontSize: '0.9rem' }}>Kelola dan pantau status semua pemesanan hotel Anda</p>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '4px solid var(--neo-dark)', marginBottom: '2rem', gap: '0' }}>
        {tabs.map(({ key, label, icon: Icon, color }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.875rem 1.5rem', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase',
            background: tab === key ? color : 'white',
            color: tab === key ? 'white' : '#6b7280',
            border: '3px solid var(--neo-dark)', borderBottom: tab === key ? `4px solid ${color}` : 'none',
            cursor: 'pointer', transition: 'all 0.15s',
            marginBottom: tab === key ? '-4px' : 0,
          }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2].map(i => <div key={i} className="card" style={{ height: 160, background: '#f3f4f6' }} />)}
        </div>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', border: '4px dashed #d1d5db' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗓️</div>
          <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            {tab === 'active' ? 'Tidak Ada Pesanan Aktif' : 'Belum Ada Riwayat'}
          </h3>
          <p style={{ color: '#6b7280', fontWeight: 500, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {tab === 'active' ? 'Mulai pesan hotel impian Anda sekarang!' : 'Riwayat pemesanan akan muncul di sini.'}
          </p>
          <Link to="/hotels" className="btn btn-primary">Cari Hotel <ArrowRight size={14} /></Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {bookings.map(booking => <BookingCard key={booking.id_booking || booking.id} booking={booking} onCancel={handleCancel} />)}
        </div>
      )}
    </div>
  );
};

const BookingCard = ({ booking, onCancel }) => {
  const { bg, color, label } = statusColor(booking.status);
  const [timeLeft, setTimeLeft] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const alreadyPaid = !!booking.payment_proof;

  useEffect(() => {
    if (booking.payment_deadline && booking.status === 'PENDING') {
      const deadline = new Date(booking.payment_deadline).getTime();
      setTimeLeft(Math.max(0, Math.floor((deadline - Date.now()) / 1000)));
      const t = setInterval(() => setTimeLeft(l => Math.max(0, l - 1)), 1000);
      return () => clearInterval(t);
    }
  }, [booking]);

  const formatCount = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const nights = diffDays(booking.check_in, booking.check_out);

  return (
    <div className="card" style={{ padding: '1.5rem', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 900, color: '#9ca3af', fontSize: '0.75rem', textTransform: 'uppercase' }}>
            Pesanan #{booking.id_booking || booking.id}
          </span>
          <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1rem', textTransform: 'uppercase', margin: '0.25rem 0', color: 'var(--neo-dark)' }}>
            {booking.hotel_name || `Hotel #${booking.hotel_id}`}
          </h3>
        </div>
        <span className="badge" style={{ background: bg, color, border: `2px solid var(--neo-dark)`, boxShadow: '2px 2px 0px 0px var(--neo-dark)' }}>{label}</span>
      </div>

      {/* Summary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1rem', padding: '1rem', background: 'var(--neo-light)', border: '2px solid var(--neo-dark)' }}>
        <div>
          <div style={{ color: '#9ca3af', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Check-In</div>
          <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{formatDate(booking.check_in)}</div>
        </div>
        <div>
          <div style={{ color: '#9ca3af', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Check-Out</div>
          <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{formatDate(booking.check_out)}</div>
        </div>
        <div>
          <div style={{ color: '#9ca3af', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Durasi</div>
          <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{nights} malam</div>
        </div>
        <div>
          <div style={{ color: '#9ca3af', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Tamu</div>
          <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{booking.number_of_guest} orang</div>
        </div>
        <div>
          <div style={{ color: '#9ca3af', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total</div>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '0.95rem', color: 'var(--neo-orange)' }}>{formatCurrency(booking.total_price)}</div>
        </div>
      </div>

      {/* Bukti Upload - jika sudah dibayar */}
      {alreadyPaid && (
        <div style={{ background: '#f0fdf4', border: '2px solid #16a34a', padding: '0.6rem 0.875rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#166534' }}>
          <CheckCircle size={14} style={{ color: '#16a34a', flexShrink: 0 }} />
          Bukti pembayaran sudah dikirim — menunggu konfirmasi admin hotel.
        </div>
      )}

      {/* Pending Countdown */}
      {booking.status === 'PENDING' && timeLeft > 0 && (
        <div style={{ background: '#fff8e1', border: '2px solid var(--neo-orange)', padding: '0.6rem 0.875rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={14} style={{ color: 'var(--neo-orange)', flexShrink: 0 }} />
          <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#92400e' }}>Batas bayar: <strong style={{ fontFamily: 'Space Grotesk', color: 'var(--neo-orange)' }}>{formatCount(timeLeft)}</strong></span>
        </div>
      )}

      {/* Detail Expandable */}
      {expanded && (
        <div style={{ background: '#f9fafb', border: '2px solid #e5e7eb', padding: '1rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <h4 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: '0.75rem', color: '#6b7280' }}>Detail Pemesan</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1.5rem' }}>
            {[
              { label: 'Nama Pemesan', val: booking.orderer_name },
              { label: 'Email', val: booking.orderer_email },
              { label: 'No. Telepon', val: booking.orderer_phone },
              { label: 'Metode Bayar', val: booking.payment_method || '-' },
              { label: 'ID Pesanan', val: `#${booking.id_booking || booking.id}` },
            ].map(({ label, val }) => val && (
              <div key={label}>
                <div style={{ color: '#9ca3af', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontWeight: 600, marginTop: '0.15rem' }}>{val}</div>
              </div>
            ))}
          </div>
          {booking.payment_proof && (
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ color: '#9ca3af', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Bukti Pembayaran</div>
              <a href={booking.payment_proof} target="_blank" rel="noopener noreferrer">
                <img src={booking.payment_proof} alt="Bukti Bayar" style={{ maxHeight: 160, maxWidth: '100%', border: '3px solid var(--neo-dark)', objectFit: 'contain' }} />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* Bayar Sekarang hanya muncul jika PENDING dan belum ada bukti pembayaran */}
        {booking.status === 'PENDING' && !alreadyPaid && (
          <Link to={`/payment/${booking.id_booking || booking.id}`} className="btn btn-orange btn-sm">
            <Calendar size={13} /> Bayar Sekarang
          </Link>
        )}
        {/* Upload Ulang hanya jika PENDING dan sudah ada bukti tapi ingin ganti */}
        {booking.status === 'PENDING' && alreadyPaid && (
          <Link to={`/payment/${booking.id_booking || booking.id}`} className="btn btn-sm" style={{ background: '#e0f2fe', color: '#0369a1', border: '3px solid #0369a1', boxShadow: '3px 3px 0 #0369a1' }}>
            Ganti Bukti Bayar
          </Link>
        )}
        {booking.status === 'COMPLETED' && (
          <Link to={`/hotels/${booking.hotel_id}`} className="btn btn-primary btn-sm">Pesan Lagi</Link>
        )}
        <button onClick={() => setExpanded(e => !e)} className="btn btn-white btn-sm">
          {expanded ? <><ChevronUp size={13} /> Sembunyikan</> : <><ChevronDown size={13} /> Lihat Detail</>}
        </button>
        {booking.status === 'PENDING' && (
          <button onClick={() => onCancel(booking.id_booking || booking.id)} className="btn btn-sm" style={{ background: '#fff0f3', color: 'var(--neo-pink)', border: '3px solid var(--neo-pink)', boxShadow: '3px 3px 0px 0px var(--neo-pink)' }}>
            <XCircle size={13} /> Batalkan
          </button>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
