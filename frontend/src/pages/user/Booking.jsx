import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { diffDays } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import LoadingState from '../../components/LoadingState';
import { addDays, dateFromInput, toDateInputValue } from '../../components/bookings/bookingDateUtils';
import BookingStayDetails, { getRoomAvailability } from '../../components/bookings/BookingStayDetails';
import BookingGuestDetails from '../../components/bookings/BookingGuestDetails';
import BookingSummary from '../../components/bookings/BookingSummary';
import api from '../../utils/api';

const Booking = () => {
  const { hotelId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const today = toDateInputValue(new Date());
  const tomorrow = addDays(today, 1);
  const initialCheckIn = searchParams.get('checkIn') || tomorrow;
  const initialCheckOut = searchParams.get('checkOut') || addDays(initialCheckIn, 1);

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [openCalendar, setOpenCalendar] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(dateFromInput(initialCheckIn));
  const [form, setForm] = useState({
    room_type_id: parseInt(searchParams.get('roomTypeId')) || '',
    check_in: initialCheckIn,
    check_out: initialCheckOut,
    number_of_guest: parseInt(searchParams.get('guests')) || 1,
    for_self: true,
    orderer_name: '',
    orderer_phone: '',
    orderer_email: '',
  });

  useEffect(() => {
    if (!user || user.role !== 'ROLE_USER') navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    Promise.all([
      api.get(`/api/hotels/${hotelId}`),
      api.get(`/api/room-types/hotel/${hotelId}`),
    ]).then(([hotelRes, roomsRes]) => {
      const roomData = roomsRes.data.data || [];
      setHotel(hotelRes.data.data);
      setRooms(roomData);
      if (!form.room_type_id && roomData.length > 0) {
        setForm(f => ({ ...f, room_type_id: roomData[0].id_room_type }));
      }
    }).catch(() => navigate('/hotels')).finally(() => setLoading(false));
  }, [hotelId, navigate]);

  useEffect(() => {
    if (form.for_self && user) {
      setForm(f => ({
        ...f,
        orderer_name: `${user.first_name} ${user.last_name}`.trim(),
        orderer_phone: user.phone || '',
        orderer_email: user.email || '',
      }));
    } else if (!form.for_self) {
      setForm(f => ({ ...f, orderer_name: '', orderer_phone: '', orderer_email: '' }));
    }
  }, [form.for_self, user]);

  const selectedRoom = rooms.find(room => room.id_room_type === parseInt(form.room_type_id));
  const selectedRoomAvailable = getRoomAvailability(selectedRoom);
  const selectedRoomUnavailable = selectedRoom && selectedRoomAvailable <= 0;
  const bookingBlocked = !selectedRoom || selectedRoomUnavailable;
  const nights = form.check_in && form.check_out ? diffDays(form.check_in, form.check_out) : 0;
  const totalPrice = selectedRoom ? selectedRoom.price_per_night * Math.max(nights, 1) : 0;
  const checkOutMin = form.check_in ? addDays(form.check_in, 1) : tomorrow;

  const handleCheckInChange = (value) => {
    setForm(f => ({ ...f, check_in: value, check_out: value ? addDays(value, 1) : '' }));
  };

  const handleCheckOutChange = (value) => {
    setForm(f => ({ ...f, check_out: value <= f.check_in ? addDays(f.check_in, 1) : value }));
  };

  const openDatePicker = (field) => {
    const value = field === 'check_in' ? form.check_in : form.check_out || checkOutMin;
    setCalendarMonth(dateFromInput(value));
    setOpenCalendar(current => current === field ? null : field);
  };

  const selectDate = (field, value) => {
    if (field === 'check_in') handleCheckInChange(value);
    else handleCheckOutChange(value);
    setOpenCalendar(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.check_out) return setError('Pilih tanggal check-out terlebih dahulu');
    if (form.check_out <= form.check_in) return setError('Tanggal check-out harus setelah check-in');
    if (!selectedRoom) return setError('Pilih tipe kamar terlebih dahulu');
    if (selectedRoomUnavailable) return setError('Tipe kamar ini sedang tidak tersedia. Silakan pilih tipe kamar lain.');

    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/api/bookings', {
        hotel_id: parseInt(hotelId),
        room_type_id: parseInt(form.room_type_id),
        check_in: form.check_in,
        check_out: form.check_out,
        number_of_guest: form.number_of_guest,
        total_price: totalPrice,
        orderer_name: form.orderer_name,
        orderer_phone: form.orderer_phone,
        orderer_email: form.orderer_email,
        is_for_self: form.for_self,
      });
      navigate(`/payment/${res.data.data?.id_booking}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat pemesanan. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
        <LoadingState text="Memuat data booking..." />
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-shell">
        <div className="booking-heading">
          <span>Reservation</span>
          <h1>Lengkapi Data Booking</h1>
          <p>Pastikan tanggal, tipe kamar, dan data tamu sudah benar sebelum melanjutkan pembayaran.</p>
        </div>

        {error && (
          <div className="alert-danger" style={{ padding: '1rem', marginBottom: '2.5rem', display: 'flex', gap: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
            <AlertCircle size={18} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
            <span style={{ fontWeight: 300, color: 'var(--color-danger)', fontSize: '0.9rem' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="booking-form-grid">
          <div className="booking-main-column">
            <BookingStayDetails
              form={form}
              setForm={setForm}
              rooms={rooms}
              selectedRoom={selectedRoom}
              selectedRoomUnavailable={selectedRoomUnavailable}
              openCalendar={openCalendar}
              calendarMonth={calendarMonth}
              setCalendarMonth={setCalendarMonth}
              today={today}
              checkOutMin={checkOutMin}
              onOpenCalendar={openDatePicker}
              onSelectDate={selectDate}
            />
            <BookingGuestDetails form={form} setForm={setForm} />
          </div>

          <BookingSummary
            hotel={hotel}
            form={form}
            selectedRoom={selectedRoom}
            selectedRoomAvailable={selectedRoomAvailable}
            selectedRoomUnavailable={selectedRoomUnavailable}
            nights={nights}
            totalPrice={totalPrice}
            submitting={submitting}
            bookingBlocked={bookingBlocked}
          />
        </form>
      </div>

      <style>{`
        @media (max-width: 900px) {
          form { grid-template-columns: 1fr !important; gap: 3rem !important; }
        }
      `}</style>
    </div>
  );
};

export default Booking;
