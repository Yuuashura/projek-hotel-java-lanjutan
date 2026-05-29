import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, ArrowRight, ChevronDown, ChevronUp, MapPin, Users } from 'lucide-react';
import { formatCurrency, formatDate, diffDays, statusColor } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import LoadingState from '../../components/LoadingState';
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

  const getHotelId = (booking) => booking.hotel_id ?? booking.hotelId;
  const getRoomTypeId = (booking) => booking.room_type_id ?? booking.roomTypeId;

  const enrichBookingDetails = async (items) => {
    const hotelIds = [...new Set(items.map(getHotelId).filter(Boolean))];
    const roomTypeIds = [...new Set(items.map(getRoomTypeId).filter(Boolean))];

    const [hotelResults, roomTypeResults] = await Promise.all([
      Promise.all(hotelIds.map(id => api.get(`/api/hotels/${id}`).then(res => res.data?.data).catch(() => null))),
      Promise.all(roomTypeIds.map(id => api.get(`/api/room-types/${id}`).then(res => res.data?.data).catch(() => null))),
    ]);

    const hotelsById = Object.fromEntries(
      hotelResults.filter(Boolean).map(hotel => [hotel.id_hotel ?? hotel.idHotel, hotel])
    );
    const roomTypesById = Object.fromEntries(
      roomTypeResults.filter(Boolean).map(room => [room.id_room_type ?? room.idRoomType, room])
    );

    return items.map(booking => {
      const hotelId = getHotelId(booking);
      const roomTypeId = getRoomTypeId(booking);
      const hotel = hotelsById[hotelId];
      const roomType = roomTypesById[roomTypeId]
        || hotel?.roomTypes?.find(room => (room.id_room_type ?? room.idRoomType) === roomTypeId);

      return {
        ...booking,
        hotel_name: hotel?.name || booking.hotel_name,
        room_type_name: roomType?.name || booking.room_type_name,
        hotel_city: hotel?.city?.name || booking.hotel_city,
        hotel_address: hotel?.address || booking.hotel_address,
      };
    });
  };

  const loadBookings = () => {
    setLoading(true);
    api.get(`/api/bookings/my?status=${tab}`)
      .then(async r => {
        const data = r.data.data || [];
        setBookings(await enrichBookingDetails(data));
      })
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
    { key: 'active', label: 'Pesanan Aktif', icon: Clock },
    { key: 'history', label: 'Riwayat Pesanan', icon: CheckCircle },
  ];

  return (
    <div style={{ background: 'var(--color-background)', minHeight: '100vh', padding: '6rem 1.5rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>Pesanan Saya</h1>
        <p style={{ color: 'var(--color-muted)', fontWeight: 300, marginBottom: '3rem', fontSize: '0.9rem' }}>Kelola dan pantau status semua pemesanan hotel Anda</p>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-accent)', marginBottom: '2.5rem', gap: '2rem' }}>
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)} 
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.875rem 0', fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '0.875rem', textTransform: 'uppercase',
                background: 'transparent',
                color: tab === key ? 'var(--color-primary)' : 'var(--color-muted)',
                border: 'none',
                borderBottom: tab === key ? '2px solid var(--color-primary)' : '2px solid transparent',
                cursor: 'pointer', transition: 'all 0.3s ease',
                letterSpacing: '1px',
                marginBottom: '-1px'
              }}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <LoadingState text="Memuat pesanan Anda..." />
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1.5rem', border: '1px dashed var(--color-accent)', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem', opacity: 0.6 }}>🗓️</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>
              {tab === 'active' ? 'Tidak Ada Pesanan Aktif' : 'Belum Ada Riwayat'}
            </h3>
            <p style={{ color: 'var(--color-muted)', fontWeight: 300, marginBottom: '2rem', fontSize: '0.9rem' }}>
              {tab === 'active' ? 'Mulai pesan hotel impian Anda sekarang!' : 'Riwayat pemesanan akan muncul di sini.'}
            </p>
            <Link to="/hotels" className="btn btn-primary" style={{ background: 'var(--color-primary)' }}>Cari Hotel <ArrowRight size={14} /></Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {bookings.map(booking => <BookingCard key={booking.id_booking || booking.id} booking={booking} onCancel={handleCancel} />)}
          </div>
        )}
      </div>
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
  const hotelId = booking.hotel_id ?? booking.hotelId;
  const roomTypeId = booking.room_type_id ?? booking.roomTypeId;
  const hotelName = booking.hotel_name || `Hotel #${hotelId}`;
  const roomTypeName = booking.room_type_name || `Tipe Kamar #${roomTypeId}`;

  // Status badges colors matching Elegant Sanctuary theme
  const getBadgeColor = (status) => {
    switch (status) {
      case 'PENDING': return { bg: 'rgba(212,175,55,0.1)', text: 'var(--color-primary)' };
      case 'CONFIRMED': return { bg: 'rgba(72,187,120,0.1)', text: '#276749' };
      case 'CANCELLED': return { bg: 'rgba(229,62,62,0.1)', text: '#9B2C2C' };
      default: return { bg: 'var(--color-accent)', text: 'var(--color-muted)' };
    }
  };

  const statusBadge = getBadgeColor(booking.status);

  return (
    <div className="card card-hover" style={{ padding: '2rem', border: '1px solid var(--color-accent)', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--color-surface)' }}>
      {/* Header */}
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

      {/* Summary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1.5rem', padding: '1.25rem', background: 'var(--color-background)', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-sm)' }}>
        <div>
          <div style={{ color: 'var(--color-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Check-In</div>
          <div style={{ fontWeight: 400, fontSize: '0.85rem', color: 'var(--color-text)' }}>{formatDate(booking.check_in)}</div>
        </div>
        <div>
          <div style={{ color: 'var(--color-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Check-Out</div>
          <div style={{ fontWeight: 400, fontSize: '0.85rem', color: 'var(--color-text)' }}>{formatDate(booking.check_out)}</div>
        </div>
        <div>
          <div style={{ color: 'var(--color-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Durasi</div>
          <div style={{ fontWeight: 400, fontSize: '0.85rem', color: 'var(--color-text)' }}>{nights} malam</div>
        </div>
        <div>
          <div style={{ color: 'var(--color-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Tamu</div>
          <div style={{ fontWeight: 400, fontSize: '0.85rem', color: 'var(--color-text)' }}>{booking.number_of_guest} orang</div>
        </div>
        <div>
          <div style={{ color: 'var(--color-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Total</div>
          <div style={{ fontWeight: 400, fontSize: '0.95rem', color: 'var(--color-primary)' }}>{formatCurrency(booking.total_price)}</div>
        </div>
      </div>

      {/* Bukti Upload status message */}
      {alreadyPaid && (
        <div style={{ background: 'rgba(72,187,120,0.05)', border: '1px solid rgba(72,187,120,0.2)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#276749', borderRadius: 'var(--radius-sm)' }}>
          <CheckCircle size={14} style={{ color: '#38A169', flexShrink: 0 }} />
          Bukti pembayaran sudah dikirim — menunggu konfirmasi admin hotel.
        </div>
      )}

      {/* Pending Countdown */}
      {booking.status === 'PENDING' && timeLeft > 0 && (
        <div style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
          <Clock size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text)', fontWeight: 300 }}>Batas bayar: <strong style={{ color: 'var(--color-primary)', fontWeight: 500 }}>{formatCount(timeLeft)}</strong></span>
        </div>
      )}

      {/* Expanded details */}
      {expanded && (
        <div style={{ background: 'var(--color-background)', border: '1px solid var(--color-accent)', padding: '1.5rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderRadius: 'var(--radius-sm)' }}>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--color-text)', margin: 0, fontWeight: 300 }}>Detail Pemesan</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem 2rem' }}>
            {[
              { label: 'Nama Pemesan', val: booking.orderer_name },
              { label: 'Email', val: booking.orderer_email },
              { label: 'No. Telepon', val: booking.orderer_phone },
              { label: 'Metode Bayar', val: booking.payment_method || '-' },
              { label: 'ID Pesanan', val: `#${booking.id_booking || booking.id}` },
              { label: 'Hotel', val: hotelName },
              { label: 'Tipe Kamar', val: roomTypeName },
              { label: 'Alamat Hotel', val: booking.hotel_address },
            ].map(({ label, val }) => val && (
              <div key={label}>
                <div style={{ color: 'var(--color-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
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

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', borderTop: '1px solid var(--color-accent)', paddingTop: '1.25rem' }}>
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
        <button onClick={() => setExpanded(e => !e)} className="btn btn-white btn-sm">
          {expanded ? <><ChevronUp size={12} /> Sembunyikan</> : <><ChevronDown size={12} /> Lihat Detail</>}
        </button>
        {booking.status === 'PENDING' && (
          <button onClick={() => onCancel(booking.id_booking || booking.id)} className="btn btn-white btn-sm" style={{ color: '#E53E3E', borderColor: 'rgba(229,62,62,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.background = '#FFF5F5'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <XCircle size={12} style={{ color: '#E53E3E' }} /> Batalkan
          </button>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
