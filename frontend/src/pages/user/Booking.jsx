import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { CalendarDays, User, AlertCircle, BedDouble, ShieldCheck } from 'lucide-react';
import { formatCurrency, formatDate, diffDays } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import LoadingState from '../../components/LoadingState';
import api from '../../utils/api';

const toDateInputValue = (date) => {
  const localDate = new Date(date);
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  return localDate.toISOString().split('T')[0];
};

const addDays = (dateString, days) => {
  if (!dateString) return '';
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
};

const dateFromInput = (value) => new Date(`${value}T00:00:00`);

const isBeforeDate = (value, minValue) => {
  if (!value || !minValue) return false;
  return dateFromInput(value) < dateFromInput(minValue);
};

const getRoomAvailability = (room) => Number(room?.room_available ?? room?.roomAvailable ?? 0);

const monthLabel = (date) => date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

const getCalendarCells = (monthDate) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const start = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      value: toDateInputValue(date),
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month
    };
  });
};

const Booking = () => {
  const { hotelId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [openCalendar, setOpenCalendar] = useState(null);

  const today = toDateInputValue(new Date());
  const tomorrow = addDays(today, 1);
  const initialCheckIn = searchParams.get('checkIn') || tomorrow;
  const initialCheckOut = searchParams.get('checkOut') || addDays(initialCheckIn, 1);

  const [form, setForm] = useState({
    room_type_id: parseInt(searchParams.get('roomTypeId')) || '',
    check_in: initialCheckIn,
    check_out: initialCheckOut,
    number_of_guest: parseInt(searchParams.get('guests')) || 1,
    for_self: true,
    orderer_name: '',
    orderer_phone: '',
    orderer_email: ''
  });
  const [calendarMonth, setCalendarMonth] = useState(dateFromInput(initialCheckIn));



  useEffect(() => {
    if (!user || user.role !== 'ROLE_USER') navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    Promise.all([
    api.get(`/api/hotels/${hotelId}`),
    api.get(`/api/room-types/hotel/${hotelId}`)]
    ).then(([hotelRes, roomsRes]) => {
      setHotel(hotelRes.data.data);
      setRooms(roomsRes.data.data || []);
      if (!form.room_type_id && roomsRes.data.data?.length > 0) {
        setForm((f) => ({ ...f, room_type_id: roomsRes.data.data[0].id_room_type }));
      }
    }).catch(() => navigate('/hotels')).finally(() => setLoading(false));
  }, [hotelId, form.room_type_id, navigate]);

  // Auto-fill for self
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (form.for_self && user) {
        setForm((f) => ({
          ...f,
          orderer_name: `${user.first_name} ${user.last_name}`.trim(),
          orderer_phone: user.phone || '',
          orderer_email: user.email || ''
        }));
      } else if (!form.for_self) {
        setForm((f) => ({ ...f, orderer_name: '', orderer_phone: '', orderer_email: '' }));
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [form.for_self, user]);

  const selectedRoom = rooms.find((r) => r.id_room_type === parseInt(form.room_type_id));
  const selectedRoomAvailable = getRoomAvailability(selectedRoom);
  const selectedRoomUnavailable = selectedRoom && selectedRoomAvailable <= 0;
  const bookingBlocked = !selectedRoom || selectedRoomUnavailable;
  const nights = form.check_in && form.check_out ? diffDays(form.check_in, form.check_out) : 0;

  const hasDiscount = (selectedRoom?.onSale || selectedRoom?.on_sale || hotel?.onSale || hotel?.on_sale) && (
  selectedRoom?.discountPercent > 0 || selectedRoom?.discount_percent > 0 || hotel?.discountPercent > 0 || hotel?.discount_percent > 0);
  const discountPercent = selectedRoom?.discountPercent || selectedRoom?.discount_percent || hotel?.discountPercent || hotel?.discount_percent || 0;

  const basePricePerNight = selectedRoom ? selectedRoom.price_per_night || selectedRoom.pricePerNight || 0 : 0;
  const originalTotalPrice = basePricePerNight * Math.max(nights, 1);
  const totalPrice = hasDiscount ? originalTotalPrice * (1 - discountPercent / 100) : originalTotalPrice;

  const checkOutMin = form.check_in ? addDays(form.check_in, 1) : tomorrow;

  const handleCheckInChange = (value) => {
    setForm((f) => ({
      ...f,
      check_in: value,
      check_out: value ? addDays(value, 1) : ''
    }));
  };

  const handleCheckOutChange = (value) => {
    setForm((f) => ({
      ...f,
      check_out: value <= f.check_in ? addDays(f.check_in, 1) : value
    }));
  };

  const openDatePicker = (field) => {
    const value = field === 'check_in' ? form.check_in : form.check_out || checkOutMin;
    setCalendarMonth(dateFromInput(value));
    setOpenCalendar((current) => current === field ? null : field);
  };

  const selectDate = (field, value) => {
    if (field === 'check_in') {
      handleCheckInChange(value);
    } else {
      handleCheckOutChange(value);
    }
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
        is_for_self: form.for_self
      });
      const bookingId = res.data.data?.id_booking;
      navigate(`/payment/${bookingId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat pemesanan. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="[min-height:70vh] [display:grid] [place-items:center] [padding:2rem]">
        <LoadingState text="Memuat data booking..." />
      </div>);

  }



  return (
    <div className="booking-page">
      <div className="booking-shell">
        <div className="booking-heading">
          <span>Reservation</span>
          <h1>Lengkapi Data Booking</h1>
          <p>Pastikan tanggal, tipe kamar, dan data tamu sudah benar sebelum melanjutkan pembayaran.</p>
        </div>

        {error &&
        <div className="alert-danger [padding:1rem] [margin-bottom:2.5rem] [display:flex] [gap:0.6rem] [border-radius:var(--radius-sm)]">
            <AlertCircle size={18} className="[color:var(--color-danger)] [flex-shrink:0]" />
            <span className="[font-weight:300] [color:var(--color-danger)] [font-size:0.9rem]">{error}</span>
          </div>
        }

        <form onSubmit={handleSubmit} className="booking-form-grid max-[900px]:!grid-cols-1 max-[900px]:!gap-12">
          
          {/* Left Column (65%): Form */}
          <div className="booking-main-column">
            
            {/* Stay Details */}
            <div className="booking-panel [z-index:2]">
              <div className="booking-section-title">
                <CalendarDays size={18} />
                <div>
                  <span>Langkah 1</span>
                  <h3>Detail Menginap</h3>
                </div>
              </div>
              
              <div className="booking-date-grid">
                <div className={cn(`booking-date-card ${openCalendar === 'check_in' ? 'is-open' : ''}`, "[z-index:2]")}>
                  <div className="booking-date-icon"><CalendarDays size={18} /></div>
                  <div className="booking-date-body">
                    <label>Check-In</label>
                    <button type="button" className="booking-date-trigger" onClick={() => openDatePicker('check_in')}>
                      {form.check_in ? formatDate(form.check_in) : 'Pilih tanggal'}
                    </button>
                    <span>{form.check_in ? formatDate(form.check_in) : 'Pilih tanggal datang'}</span>
                  </div>
                  {openCalendar === 'check_in' &&
                  <CalendarPopover
                    month={calendarMonth}
                    setMonth={setCalendarMonth}
                    selected={form.check_in}
                    minDate={today}
                    onSelect={(value) => selectDate('check_in', value)} />

                  }
                </div>
                <div className={cn(`booking-date-card ${openCalendar === 'check_out' ? 'is-open' : ''}`, "[z-index:2]")}>
                  <div className="booking-date-icon"><CalendarDays size={18} /></div>
                  <div className="booking-date-body">
                    <label>Check-Out</label>
                    <button type="button" className="booking-date-trigger" onClick={() => openDatePicker('check_out')}>
                      {form.check_out ? formatDate(form.check_out) : 'Pilih tanggal'}
                    </button>
                    <span>{form.check_out ? formatDate(form.check_out) : 'Otomatis esok hari'}</span>
                  </div>
                  {openCalendar === 'check_out' &&
                  <CalendarPopover
                    month={calendarMonth}
                    setMonth={setCalendarMonth}
                    selected={form.check_out}
                    minDate={checkOutMin}
                    onSelect={(value) => selectDate('check_out', value)} />

                  }
                </div>
              </div>

              <div className="booking-field-grid">
                <div>
                  <label className="label">Tipe Kamar *</label>
                  <select className="input booking-solid-input" value={form.room_type_id} onChange={(e) => setForm((f) => ({ ...f, room_type_id: parseInt(e.target.value) }))} required>
                    {rooms.map((r) => {
                      const available = getRoomAvailability(r);
                      return (
                        <option key={r.id_room_type} value={r.id_room_type} disabled={available <= 0}>
                          {r.name}{available <= 0 ? ' - Tidak tersedia' : ` - ${available} tersedia`}
                        </option>);

                    })}
                  </select>
                  {selectedRoomUnavailable &&
                  <p className="[color:var(--color-danger)] [font-size:0.8rem] [margin-top:0.5rem] [font-weight:400]">
                      Tipe kamar ini sedang tidak tersedia. Silakan pilih tipe kamar lain.
                    </p>
                  }
                </div>
                <div>
                  <label className="label">Jumlah Tamu *</label>
                  <input type="number" className="input booking-solid-input" min={1} max={selectedRoom?.max_guest || 10} value={form.number_of_guest} onChange={(e) => setForm((f) => ({ ...f, number_of_guest: parseInt(e.target.value) }))} required />
                </div>
              </div>
            </div>

            {/* Guest Details */}
            <div className="booking-panel">
              <div className="booking-section-title">
                <User size={18} />
                <div>
                  <span>Langkah 2</span>
                  <h3>Data Tamu</h3>
                </div>
              </div>

              {/* Toggle option for self booking */}
              <div className="booking-guest-toggle">
                {[{ val: true, label: 'Saya tamunya' }, { val: false, label: 'Pesan untuk orang lain' }].map(({ val, label }) =>
                <label key={label} className={form.for_self === val ? 'active' : ''}>
                    <input type="radio" checked={form.for_self === val} onChange={() => setForm((f) => ({ ...f, for_self: val }))} />
                    {label}
                  </label>
                )}
              </div>

              <div className="[display:flex] [flex-direction:column] [gap:1.25rem] [margin-top:1.5rem]">
                <div className="[display:flex] [flex-direction:column] [gap:0.4rem]">
                  <label className="[font-size:0.72rem] [font-weight:600] [color:var(--color-muted)] [text-transform:uppercase] [letter-spacing:1px]">
                    Nama Lengkap *
                  </label>
                  <input
                    className="input booking-solid-input"
                    value={form.orderer_name}
                    onChange={(e) => setForm((f) => ({ ...f, orderer_name: e.target.value }))}
                    required
                    disabled={form.for_self} />
                  
                </div>
                
                <div className="[display:grid] [grid-template-columns:1fr_1fr] [gap:1.25rem]">
                  <div className="[display:flex] [flex-direction:column] [gap:0.4rem]">
                    <label className="[font-size:0.72rem] [font-weight:600] [color:var(--color-muted)] [text-transform:uppercase] [letter-spacing:1px]">
                      Nomor Telepon *
                    </label>
                    <input
                      type="tel"
                      className="input booking-solid-input"
                      value={form.orderer_phone}
                      onChange={(e) => setForm((f) => ({ ...f, orderer_phone: e.target.value }))}
                      required
                      disabled={form.for_self} />
                    
                  </div>
                  
                  <div className="[display:flex] [flex-direction:column] [gap:0.4rem]">
                    <label className="[font-size:0.72rem] [font-weight:600] [color:var(--color-muted)] [text-transform:uppercase] [letter-spacing:1px]">
                      Alamat Email *
                    </label>
                    <input
                      type="email"
                      className="input booking-solid-input"
                      value={form.orderer_email}
                      onChange={(e) => setForm((f) => ({ ...f, orderer_email: e.target.value }))}
                      required
                      disabled={form.for_self} />
                    
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (35%): Order Summary */}
          <div className="booking-summary-sticky">
            <div className="booking-summary-card card">
              <div className="booking-summary-title">
                <BedDouble size={18} />
                <h3>Ringkasan Pesanan</h3>
              </div>
              
              <div className="[display:flex] [gap:1rem] [margin-bottom:2rem]">
                <div className="[width:64px] [height:64px] [overflow:hidden] [border-radius:2px]">
                  <img src={hotel?.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=150'} alt="" className="[width:100%] [height:100%] [object-fit:cover]" />
                </div>
                <div>
                  <div className="[font-family:var(--font-heading)] [font-size:1.25rem] [color:var(--color-text)] [font-weight:300]">{hotel?.name}</div>
                  <div className="[color:var(--color-muted)] [font-size:0.8rem] [font-weight:300] [margin-top:0.25rem]">{hotel?.city?.name}</div>
                </div>
              </div>

              {selectedRoom &&
              <div className="[display:flex] [flex-direction:column] [gap:0.75rem] [font-size:0.85rem] [color:var(--color-muted)] [border-bottom:1px_solid_var(--color-accent)] [padding-bottom:1.5rem] [margin-bottom:1.5rem]">
                  <div className="[display:flex] [justify-content:space-between] [color:var(--color-text)] [font-weight:400]">
                    <span>Tipe Kamar</span>
                    <span>{selectedRoom.name}</span>
                  </div>
                  <div className={cn('flex justify-between', selectedRoomUnavailable ? 'text-[var(--color-danger)]' : 'text-[var(--color-muted)]')}>
                    <span>Ketersediaan</span>
                    <span>{selectedRoomUnavailable ? 'Tidak tersedia' : `${selectedRoomAvailable} kamar`}</span>
                  </div>
                  {form.check_in &&
                <div className="[display:flex] [justify-content:space-between]">
                      <span>Tanggal</span>
                      <span>{formatDate(form.check_in)} - {form.check_out ? formatDate(form.check_out) : '?'}</span>
                    </div>
                }
                  {nights > 0 &&
                <div className="[display:flex] [justify-content:space-between]">
                      <span>Malam</span>
                      <span>{nights} malam</span>
                    </div>
                }
                  <div className="[display:flex] [justify-content:space-between]">
                    <span>Tamu</span>
                    <span>{form.number_of_guest} tamu</span>
                  </div>
                </div>
              }

              {nights > 0 && selectedRoom &&
              <div className="[display:flex] [flex-direction:column] [gap:0.75rem]">
                  <div className="[display:flex] [justify-content:space-between] [font-size:0.85rem] [color:var(--color-muted)]">
                    <span>Harga Kamar</span>
                    <span>{formatCurrency(basePricePerNight)} × {nights}</span>
                  </div>
                  {hasDiscount &&
                <div className="[display:flex] [justify-content:space-between] [font-size:0.85rem] [color:#C53030]">
                      <span>Diskon ({discountPercent}%)</span>
                      <span>-{formatCurrency(originalTotalPrice * discountPercent / 100)}</span>
                    </div>
                }
                  <div className="[display:flex] [justify-content:space-between] [font-size:0.85rem] [color:var(--color-muted)]">
                    <span>Pajak & Biaya</span>
                    <span>Termasuk</span>
                  </div>
                  <div className="[display:flex] [justify-content:space-between] [font-family:var(--font-heading)] [font-size:1.6rem] [color:var(--color-text)] [border-top:1px_solid_var(--color-accent)] [padding-top:1rem] [margin-top:0.5rem] [font-weight:300]">
                    <span>Total</span>
                    <span className="[color:var(--color-primary)]">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              }

              <button type="submit" className="btn btn-primary btn-full mt-8 h-14 justify-center bg-[var(--color-primary)] [animation:none] disabled:cursor-not-allowed disabled:opacity-55" disabled={submitting || bookingBlocked}>
                {!selectedRoom ? 'Pilih Tipe Kamar' : selectedRoomUnavailable ? 'Kamar Tidak Tersedia' : submitting ? 'Processing...' : 'Lanjutkan Pembayaran'}
              </button>
              <div className="booking-secure-note">
                <ShieldCheck size={14} />
                <span>Data reservasi dilindungi dan akan diverifikasi sebelum pembayaran.</span>
              </div>
            </div>
          </div>
          
        </form>
      </div>

    </div>);

};

const CalendarPopover = ({ month, setMonth, selected, minDate, onSelect }) => {
  const cells = getCalendarCells(month);
  const weekdays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const changeMonth = (offset) => {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  return (
    <div className="booking-calendar-popover">
      <div className="booking-calendar-head">
        <button type="button" onClick={() => changeMonth(-1)} aria-label="Bulan sebelumnya">
          {'<'}
        </button>
        <strong>{monthLabel(month)}</strong>
        <button type="button" onClick={() => changeMonth(1)} aria-label="Bulan berikutnya">
          {'>'}
        </button>
      </div>

      <div className="booking-calendar-week" aria-hidden="true">
        {weekdays.map((day) => <span key={day}>{day}</span>)}
      </div>

      <div className="booking-calendar-grid">
        {cells.map((cell) => {
          const disabled = isBeforeDate(cell.value, minDate);
          return (
            <button
              type="button"
              key={cell.value}
              className={[
              'booking-calendar-day',
              !cell.isCurrentMonth ? 'is-muted' : '',
              selected === cell.value ? 'is-selected' : '',
              disabled ? 'is-disabled' : ''].
              filter(Boolean).join(' ')}
              disabled={disabled}
              onClick={() => onSelect(cell.value)}>
              
              {cell.day}
            </button>);

        })}
      </div>
    </div>);

};

export default Booking;
