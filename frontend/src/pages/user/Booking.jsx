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
    <div className="min-h-screen bg-transparent px-6 py-24 max-[920px]:px-4 max-[920px]:py-14 max-sm:px-3.5 max-sm:py-10">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-10 max-w-[680px] max-[920px]:mb-6 [&>span]:mb-2 [&>span]:inline-block [&>span]:text-xs [&>span]:font-bold [&>span]:uppercase [&>span]:text-[var(--color-primary)] [&>h1]:m-0 [&>h1]:text-[clamp(2.2rem,5vw,3.6rem)] [&>h1]:font-light [&>h1]:leading-none [&>p]:mt-3.5 [&>p]:text-[0.96rem] [&>p]:leading-relaxed [&>p]:text-[var(--color-muted)] max-sm:[&>h1]:text-[2rem]">
          <span>Reservation</span>
          <h1>Lengkapi Data Booking</h1>
          <p>Pastikan tanggal, tipe kamar, dan data tamu sudah benar sebelum melanjutkan pembayaran.</p>
        </div>

        {error &&
        <div className="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger)] [padding:1rem] [margin-bottom:2.5rem] [display:flex] [gap:0.6rem] [border-radius:var(--radius-sm)]">
            <AlertCircle size={18} className="[color:var(--color-danger)] [flex-shrink:0]" />
            <span className="[font-weight:300] [color:var(--color-danger)] [font-size:0.9rem]">{error}</span>
          </div>
        }

        <form onSubmit={handleSubmit} className="grid grid-cols-[minmax(0,1fr)_390px] items-start gap-8 max-[980px]:grid-cols-1 max-[900px]:!grid-cols-1 max-[900px]:!gap-12">

          {/* Left Column (65%): Form */}
          <div className="flex min-w-0 flex-col gap-6">

            {/* Stay Details */}
            <div className="rounded-lg border border-[var(--color-accent)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--color-primary-soft)_55%,transparent),transparent_34%),var(--color-surface)] p-6 shadow-[var(--shadow-float)] max-[920px]:p-5 max-sm:p-4 [z-index:2]">
              <div className="mb-5 flex items-center gap-3 border-b border-[var(--color-accent)] pb-4 max-sm:items-start max-sm:gap-2.5 [&>svg]:size-[38px] [&>svg]:shrink-0 [&>svg]:rounded-full [&>svg]:border [&>svg]:border-[var(--color-accent)] [&>svg]:bg-[var(--color-primary-soft)] [&>svg]:p-2.5 [&>svg]:text-[var(--color-primary)] [&_span]:block [&_span]:text-[0.68rem] [&_span]:font-bold [&_span]:uppercase [&_span]:text-[var(--color-primary)] [&_h3]:mt-0.5 [&_h3]:text-2xl [&_h3]:font-light max-sm:[&_h3]:text-xl">
                <CalendarDays size={18} />
                <div>
                  <span>Langkah 1</span>
                  <h3>Detail Menginap</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 max-[620px]:grid-cols-1">
                <div className={cn(
                  'relative z-[2] grid min-h-[118px] grid-cols-[42px_minmax(0,1fr)] items-center gap-3.5 rounded-lg border border-[var(--color-accent)]',
                  'bg-[color-mix(in_srgb,var(--color-surface)_78%,var(--color-background))] p-4 transition hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-hover)]',
                  'focus-within:border-[var(--color-primary)] max-sm:min-h-[98px] max-sm:grid-cols-[36px_minmax(0,1fr)] max-sm:p-3.5',
                  openCalendar === 'check_in' && 'border-[var(--color-primary)] shadow-[var(--shadow-hover)]',
                )}>
                  <div className="grid size-[42px] place-items-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] max-sm:size-9"><CalendarDays size={18} /></div>
                  <div className="flex min-w-0 flex-col gap-1 [&>label]:text-[0.68rem] [&>label]:font-bold [&>label]:uppercase [&>label]:text-[var(--color-muted)] [&>span]:text-[0.78rem] [&>span]:text-[var(--color-muted)]">
                    <label>Check-In</label>
                    <button type="button" className="w-full min-w-0 cursor-pointer border-0 bg-transparent p-0 text-left text-base font-semibold text-[var(--color-text)] outline-none" onClick={() => openDatePicker('check_in')}>
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
                <div className={cn(
                  'relative z-[2] grid min-h-[118px] grid-cols-[42px_minmax(0,1fr)] items-center gap-3.5 rounded-lg border border-[var(--color-accent)]',
                  'bg-[color-mix(in_srgb,var(--color-surface)_78%,var(--color-background))] p-4 transition hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-hover)]',
                  'focus-within:border-[var(--color-primary)] max-sm:min-h-[98px] max-sm:grid-cols-[36px_minmax(0,1fr)] max-sm:p-3.5',
                  openCalendar === 'check_out' && 'border-[var(--color-primary)] shadow-[var(--shadow-hover)]',
                )}>
                  <div className="grid size-[42px] place-items-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] max-sm:size-9"><CalendarDays size={18} /></div>
                  <div className="flex min-w-0 flex-col gap-1 [&>label]:text-[0.68rem] [&>label]:font-bold [&>label]:uppercase [&>label]:text-[var(--color-muted)] [&>span]:text-[0.78rem] [&>span]:text-[var(--color-muted)]">
                    <label>Check-Out</label>
                    <button type="button" className="w-full min-w-0 cursor-pointer border-0 bg-transparent p-0 text-left text-base font-semibold text-[var(--color-text)] outline-none" onClick={() => openDatePicker('check_out')}>
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

              <div className="mt-5 grid grid-cols-2 gap-4 max-[620px]:grid-cols-1">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">Tipe Kamar *</label>
                  <select className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm h-12 bg-[var(--color-surface-solid)] font-normal" value={form.room_type_id} onChange={(e) => setForm((f) => ({ ...f, room_type_id: parseInt(e.target.value) }))} required>
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
                  <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">Jumlah Tamu *</label>
                  <input type="number" className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm h-12 bg-[var(--color-surface-solid)] font-normal" min={1} max={selectedRoom?.max_guest || 10} value={form.number_of_guest} onChange={(e) => setForm((f) => ({ ...f, number_of_guest: parseInt(e.target.value) }))} required />
                </div>
              </div>
            </div>

            {/* Guest Details */}
            <div className="rounded-lg border border-[var(--color-accent)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--color-primary-soft)_55%,transparent),transparent_34%),var(--color-surface)] p-6 shadow-[var(--shadow-float)] max-[920px]:p-5 max-sm:p-4">
              <div className="mb-5 flex items-center gap-3 border-b border-[var(--color-accent)] pb-4 max-sm:items-start max-sm:gap-2.5 [&>svg]:size-[38px] [&>svg]:shrink-0 [&>svg]:rounded-full [&>svg]:border [&>svg]:border-[var(--color-accent)] [&>svg]:bg-[var(--color-primary-soft)] [&>svg]:p-2.5 [&>svg]:text-[var(--color-primary)] [&_span]:block [&_span]:text-[0.68rem] [&_span]:font-bold [&_span]:uppercase [&_span]:text-[var(--color-primary)] [&_h3]:mt-0.5 [&_h3]:text-2xl [&_h3]:font-light max-sm:[&_h3]:text-xl">
                <User size={18} />
                <div>
                  <span>Langkah 2</span>
                  <h3>Data Tamu</h3>
                </div>
              </div>

              {/* Toggle option for self booking */}
              <div className="mb-6 grid grid-cols-2 gap-3 max-[620px]:grid-cols-1 [&_input]:size-4 [&_input]:accent-[var(--color-primary)]">
                {[{ val: true, label: 'Saya tamunya' }, { val: false, label: 'Pesan untuk orang lain' }].map(({ val, label }) =>
                <label
                  key={label}
                  className={cn(
                    'flex min-h-12 cursor-pointer items-center gap-2.5 rounded-lg border border-[var(--color-accent)] px-3.5 py-3 text-[0.86rem] font-medium transition',
                    form.for_self === val
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                      : 'bg-[var(--color-surface)] text-[var(--color-text)]',
                  )}
                >
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
                    className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm h-12 bg-[var(--color-surface-solid)] font-normal"
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
                      className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm h-12 bg-[var(--color-surface-solid)] font-normal"
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
                      className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm h-12 bg-[var(--color-surface-solid)] font-normal"
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
          <div className="sticky top-[120px] max-[980px]:static">
            <div className="rounded-lg border border-[var(--color-accent)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--color-primary-soft)_55%,transparent),transparent_34%),var(--color-surface)] p-6 shadow-[var(--shadow-float)] max-[920px]:p-5 max-sm:p-4 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--color-text)] shadow-[var(--shadow-float)] backdrop-blur-xl transition-all duration-300">
              <div className="mb-6 flex items-center gap-3 border-b border-[var(--color-accent)] pb-4 max-sm:items-start max-sm:gap-2.5 [&>svg]:size-[38px] [&>svg]:shrink-0 [&>svg]:rounded-full [&>svg]:border [&>svg]:border-[var(--color-accent)] [&>svg]:bg-[var(--color-primary-soft)] [&>svg]:p-2.5 [&>svg]:text-[var(--color-primary)] [&_h3]:text-2xl [&_h3]:font-light max-sm:[&_h3]:text-xl">
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

              <button type="submit" className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[color-mix(in_srgb,var(--color-primary)_46%,transparent)] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))] text-[#061426] hover:brightness-105 w-full mt-8 h-14 justify-center bg-[var(--color-primary)] [animation:none] disabled:cursor-not-allowed disabled:opacity-55" disabled={submitting || bookingBlocked}>
                {!selectedRoom ? 'Pilih Tipe Kamar' : selectedRoomUnavailable ? 'Kamar Tidak Tersedia' : submitting ? 'Processing...' : 'Lanjutkan Pembayaran'}
              </button>
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-[var(--color-accent)] bg-[var(--color-primary-soft)] p-3.5 text-[0.78rem] leading-relaxed text-[var(--color-muted)] [&>svg]:mt-0.5 [&>svg]:shrink-0 [&>svg]:text-[var(--color-primary)]">
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
    <div className="absolute inset-x-0 top-[calc(100%+0.65rem)] z-20 border border-[var(--glass-border)] bg-[var(--color-surface-solid)] p-4 shadow-[var(--shadow-hover)] max-sm:fixed max-sm:bottom-4 max-sm:left-3.5 max-sm:right-3.5 max-sm:top-auto max-sm:z-[250] max-sm:max-h-[calc(100dvh-2rem)] max-sm:overflow-y-auto">
      <div className="mb-3 flex items-center justify-between gap-3 [&>strong]:text-sm [&>strong]:font-bold [&>button]:grid [&>button]:size-[34px] [&>button]:cursor-pointer [&>button]:place-items-center [&>button]:border [&>button]:border-[var(--color-accent)] [&>button]:bg-[var(--color-surface)] [&>button]:text-[var(--color-text)] [&>button]:transition [&>button:hover]:-translate-y-px [&>button:hover]:border-[var(--color-primary)]">
        <button type="button" onClick={() => changeMonth(-1)} aria-label="Bulan sebelumnya">
          {'<'}
        </button>
        <strong>{monthLabel(month)}</strong>
        <button type="button" onClick={() => changeMonth(1)} aria-label="Bulan berikutnya">
          {'>'}
        </button>
      </div>

      <div className="mb-1.5 grid grid-cols-7 gap-1.5 max-[380px]:gap-1 [&>span]:text-center [&>span]:text-[0.66rem] [&>span]:font-bold [&>span]:uppercase [&>span]:text-[var(--color-muted)]" aria-hidden="true">
        {weekdays.map((day) => <span key={day}>{day}</span>)}
      </div>

      <div className="grid grid-cols-7 gap-1.5 max-[380px]:gap-1">
        {cells.map((cell) => {
          const disabled = isBeforeDate(cell.value, minDate);
          return (
            <button
              type="button"
              key={cell.value}
              className={cn(
                'grid min-h-9 cursor-pointer place-items-center border border-[var(--color-accent)] bg-[var(--color-surface)] text-[0.82rem] font-semibold text-[var(--color-text)] transition',
                'hover:-translate-y-px hover:border-[var(--color-primary)] max-sm:min-h-[34px] max-sm:text-xs',
                !cell.isCurrentMonth && 'opacity-40',
                selected === cell.value && 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white',
                disabled && 'cursor-not-allowed opacity-30 hover:translate-y-0 hover:border-[var(--color-accent)]',
              )}
              disabled={disabled}
              onClick={() => onSelect(cell.value)}>

              {cell.day}
            </button>);

        })}
      </div>
    </div>);

};

export default Booking;
