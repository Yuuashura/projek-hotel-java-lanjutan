import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoadingState from '../../components/LoadingState';
import UserBookingCard from '../../components/bookings/UserBookingCard';
import api from '../../utils/api';

const tabs = [
  { key: 'active', label: 'Pesanan Aktif', icon: Clock },
  { key: 'history', label: 'Riwayat Pesanan', icon: CheckCircle },
];

const getHotelId = (booking) => booking.hotel_id ?? booking.hotelId;
const getRoomTypeId = (booking) => booking.room_type_id ?? booking.roomTypeId;

const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('active');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'ROLE_USER') navigate('/login');
  }, [user, navigate]);

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
      .then(async response => {
        const data = response.data.data || [];
        setBookings(await enrichBookingDetails(data));
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, [tab]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) return;

    try {
      await api.patch(`/api/bookings/${bookingId}/cancel`);
      loadBookings();
    } catch {
      alert('Gagal membatalkan pesanan. Silakan coba lagi.');
    }
  };

  return (
    <div className="user-page my-bookings-page" style={{ background: 'var(--color-background)', minHeight: '100vh', padding: '6rem 1.5rem' }}>
      <div className="user-page-shell" style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>Pesanan Saya</h1>
        <p style={{ color: 'var(--color-muted)', fontWeight: 300, marginBottom: '3rem', fontSize: '0.9rem' }}>Kelola dan pantau status semua pemesanan hotel Anda</p>

        <div className="user-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--color-accent)', marginBottom: '2.5rem', gap: '2rem' }}>
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.875rem 0',
                fontFamily: 'var(--font-body)',
                fontWeight: 400,
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                background: 'transparent',
                color: tab === key ? 'var(--color-primary)' : 'var(--color-muted)',
                border: 'none',
                borderBottom: tab === key ? '2px solid var(--color-primary)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                marginBottom: '-1px',
              }}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingState text="Memuat pesanan Anda..." />
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1.5rem', border: '1px dashed var(--color-accent)', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)' }}>
            <Calendar size={48} className="mx-auto mb-6 text-[var(--color-muted)] opacity-70" />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>
              {tab === 'active' ? 'Tidak Ada Pesanan Aktif' : 'Belum Ada Riwayat'}
            </h3>
            <p style={{ color: 'var(--color-muted)', fontWeight: 300, marginBottom: '2rem', fontSize: '0.9rem' }}>
              {tab === 'active' ? 'Mulai pesan hotel impian Anda sekarang!' : 'Riwayat pemesanan akan muncul di sini.'}
            </p>
            <Link to="/hotels" className="btn btn-primary" style={{ background: 'var(--color-primary)' }}>
              Cari Hotel <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="flow-animate" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {bookings.map(booking => (
              <UserBookingCard key={booking.id_booking || booking.id} booking={booking} onCancel={handleCancel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
