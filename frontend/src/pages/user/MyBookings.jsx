import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, ArrowRight, ChevronDown, ChevronUp, MapPin, Users } from 'lucide-react';
import { formatCurrency, formatDate, diffDays, statusColor } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import LoadingState from '../../components/LoadingState';
import api from '../../utils/api';
import { cn } from '../../lib/utils';

const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('active');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'ROLE_USER') navigate('/login');
  }, [user, navigate]);

  const getHotelId = (booking) => booking.hotel_id ?? booking.hotelId;
  const getRoomTypeId = (booking) => booking.room_type_id ?? booking.roomTypeId;

  const enrichBookingDetails = async (items) => {
    const hotelIds = [...new Set(items.filter((item) => !item.hotel_name).map(getHotelId).filter(Boolean))];
    const roomTypeIds = [...new Set(items.filter((item) => !item.room_type_name).map(getRoomTypeId).filter(Boolean))];

    if (hotelIds.length === 0 && roomTypeIds.length === 0) {
      return items;
    }

    const [hotelResults, roomTypeResults] = await Promise.all([
    Promise.all(hotelIds.map((id) => api.get(`/api/hotels/${id}`).then((res) => res.data?.data).catch(() => null))),
    Promise.all(roomTypeIds.map((id) => api.get(`/api/room-types/${id}`).then((res) => res.data?.data).catch(() => null)))]
    );

    const hotelsById = Object.fromEntries(
      hotelResults.filter(Boolean).map((hotel) => [hotel.id_hotel ?? hotel.idHotel, hotel])
    );
    const roomTypesById = Object.fromEntries(
      roomTypeResults.filter(Boolean).map((room) => [room.id_room_type ?? room.idRoomType, room])
    );

    return items.map((booking) => {
      const hotelId = getHotelId(booking);
      const roomTypeId = getRoomTypeId(booking);
      const hotel = hotelsById[hotelId];
      const roomType = roomTypesById[roomTypeId] ||
      hotel?.roomTypes?.find((room) => (room.id_room_type ?? room.idRoomType) === roomTypeId);

      return {
        ...booking,
        hotel_name: hotel?.name || booking.hotel_name,
        room_type_name: roomType?.name || booking.room_type_name,
        hotel_city: hotel?.city?.name || booking.hotel_city,
        hotel_address: hotel?.address || booking.hotel_address
      };
    });
  };

  const loadBookings = () => {
    setLoading(true);
    api.get(`/api/bookings/my?status=${tab}`).
    then(async (r) => {
      const data = r.data.data || [];
      setBookings(await enrichBookingDetails(data));
    }).
    catch(() => setBookings([])).
    finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = window.setTimeout(loadBookings, 0);
    return () => window.clearTimeout(timer);
    // loadBookings intentionally follows the selected tab.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const tabs = [
  { key: 'active', label: 'Pesanan Aktif', icon: Clock },
  { key: 'history', label: 'Riwayat Pesanan', icon: CheckCircle }];


  return (
    <div className="px-6 py-16 max-[920px]:px-4 max-[920px]:py-12 max-sm:px-3.5 max-sm:py-8 my-bookings-page [background:var(--color-background)] [min-height:100vh] [padding:6rem_1.5rem]">
      <div className="mx-auto max-w-[900px]">
        <h1 className="[font-family:var(--font-heading)] [font-weight:300] [font-size:2.5rem] [margin-bottom:0.5rem] [color:var(--color-text)]">Pesanan Saya</h1>
        <p className="[color:var(--color-muted)] [font-weight:300] [margin-bottom:3rem] [font-size:0.9rem]">Kelola dan pantau status semua pemesanan hotel Anda</p>

        {/* Tabs */}
        <div className="mb-10 flex gap-8 overflow-x-auto border-b border-[var(--color-accent)] pb-1 max-sm:mb-6 max-sm:gap-2">
          {tabs.map(({ key, label, icon: Icon }) =>
          <button key={key} onClick={() => setTab(key)}
          className={cn(
            '-mb-px flex cursor-pointer items-center gap-2 border-0 border-b-2 bg-transparent py-3.5 font-[var(--font-body)] text-sm font-normal uppercase tracking-[1px] transition',
            tab === key ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-muted)]'
          )}>
              <Icon size={14} /> {label}
            </button>
          )}
        </div>

        {/* Content */}
        {loading ?
        <LoadingState text="Memuat pesanan Anda..." /> :
        bookings.length === 0 ?
        <div className="[text-align:center] [padding:5rem_1.5rem] [border:1px_dashed_var(--color-accent)] [border-radius:var(--radius-sm)] [background:var(--color-surface)]">
            <div className="[font-size:3rem] [margin-bottom:1.5rem] [opacity:0.6]">🗓️</div>
            <h3 className="[font-family:var(--font-heading)] [font-weight:300] [font-size:1.5rem] [margin-bottom:0.5rem] [color:var(--color-text)]">
              {tab === 'active' ? 'Tidak Ada Pesanan Aktif' : 'Belum Ada Riwayat'}
            </h3>
            <p className="[color:var(--color-muted)] [font-weight:300] [margin-bottom:2rem] [font-size:0.9rem]">
              {tab === 'active' ? 'Mulai pesan hotel impian Anda sekarang!' : 'Riwayat pemesanan akan muncul di sini.'}
            </p>
            <Link to="/hotels" className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[color-mix(in_srgb,var(--color-primary)_46%,transparent)] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))] text-[#061426] hover:brightness-105 [background:var(--color-primary)]">Cari Hotel <ArrowRight size={14} /></Link>
          </div> :

        <div className="will-change-[transform,opacity] [display:flex] [flex-direction:column] [gap:1.5rem]">
            {bookings.map((booking) => <BookingCard key={booking.id_booking || booking.id} booking={booking} onCancel={handleCancel} />)}
          </div>
        }
      </div>
    </div>);

};

const BookingCard = ({ booking, onCancel }) => {
  const { label } = statusColor(booking.status);
  const [timeLeft, setTimeLeft] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const alreadyPaid = !!booking.payment_proof;

  useEffect(() => {
    if (booking.payment_deadline && booking.status === 'PENDING') {
      const deadline = new Date(booking.payment_deadline).getTime();
      const startTimer = window.setTimeout(
        () => setTimeLeft(Math.max(0, Math.floor((deadline - Date.now()) / 1000))),
        0
      );
      const t = setInterval(() => setTimeLeft((l) => Math.max(0, l - 1)), 1000);
      return () => {
        window.clearTimeout(startTimer);
        clearInterval(t);
      };
    }
  }, [booking.payment_deadline, booking.status]);

  const formatCount = (s) => {
    const h = Math.floor(s / 3600),m = Math.floor(s % 3600 / 60),sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const nights = diffDays(booking.check_in, booking.check_out);
  const hotelId = booking.hotel_id ?? booking.hotelId;
  const roomTypeId = booking.room_type_id ?? booking.roomTypeId;
  const hotelName = booking.hotel_name || `Hotel #${hotelId}`;
  const roomTypeName = booking.room_type_name || `Tipe Kamar #${roomTypeId}`;

  // Status badges colors matching Elegant Sanctuary theme
  const getBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':return 'bg-amber-400/10 text-[var(--color-primary)]';
      case 'CONFIRMED':return 'bg-emerald-500/10 text-[#276749]';
      case 'CANCELLED':return 'bg-red-500/10 text-[#9B2C2C]';
      default:return 'bg-[var(--color-accent)] text-[var(--color-muted)]';
    }
  };

  const statusBadgeClass = getBadgeClass(booking.status);

  return (
    <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--color-text)] shadow-[var(--shadow-float)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-hover)] max-sm:!p-4 will-change-[transform,opacity] [padding:2rem] [border:1px_solid_var(--color-accent)] [display:flex] [flex-direction:column] [gap:1.5rem] [background:var(--color-surface)]">
      {/* Header */}
      <div className="[display:flex] [justify-content:space-between] [align-items:flex-start] [flex-wrap:wrap] [gap:1rem]">
        <div>
          <span className="[color:var(--color-muted)] [font-size:0.75rem] [text-transform:uppercase] [letter-spacing:1px]">
            Pesanan #{booking.id_booking || booking.id}
          </span>
          <h3 className="[font-family:var(--font-heading)] [font-weight:300] [font-size:1.4rem] [margin:0.25rem_0_0] [color:var(--color-text)]">
            {hotelName}
          </h3>
          <div className="[display:flex] [flex-wrap:wrap] [gap:0.75rem] [margin-top:0.5rem] [color:var(--color-muted)] [font-size:0.8rem] [font-weight:300]">
            <span className="[display:inline-flex] [align-items:center] [gap:0.35rem]">
              <Users size={13} /> {roomTypeName}
            </span>
            {booking.hotel_city &&
            <span className="[display:inline-flex] [align-items:center] [gap:0.35rem]">
                <MapPin size={13} /> {booking.hotel_city}
              </span>
            }
          </div>
        </div>
        <span className={cn("inline-flex items-center gap-1 rounded-full border border-[var(--color-accent)] bg-[var(--color-background)] px-3 py-1 text-[0.7rem] font-medium uppercase text-[var(--color-text)] max-sm:px-2.5 max-sm:py-1 max-sm:text-[0.64rem] border-transparent px-4 py-1.5", statusBadgeClass)}>{label}</span>
      </div>

      {/* Summary Grid */}
      <div className="max-sm:!grid-cols-1 max-sm:!gap-3 [display:grid] [grid-template-columns:repeat(auto-fit,_minmax(130px,_1fr))] [gap:1.5rem] [padding:1.25rem] [background:var(--color-background)] [border:1px_solid_var(--color-accent)] [border-radius:var(--radius-sm)]">
        <div>
          <div className="[color:var(--color-muted)] [font-size:0.7rem] [text-transform:uppercase] [letter-spacing:0.5px] [margin-bottom:0.25rem]">Check-In</div>
          <div className="[font-weight:400] [font-size:0.85rem] [color:var(--color-text)]">{formatDate(booking.check_in)}</div>
        </div>
        <div>
          <div className="[color:var(--color-muted)] [font-size:0.7rem] [text-transform:uppercase] [letter-spacing:0.5px] [margin-bottom:0.25rem]">Check-Out</div>
          <div className="[font-weight:400] [font-size:0.85rem] [color:var(--color-text)]">{formatDate(booking.check_out)}</div>
        </div>
        <div>
          <div className="[color:var(--color-muted)] [font-size:0.7rem] [text-transform:uppercase] [letter-spacing:0.5px] [margin-bottom:0.25rem]">Durasi</div>
          <div className="[font-weight:400] [font-size:0.85rem] [color:var(--color-text)]">{nights} malam</div>
        </div>
        <div>
          <div className="[color:var(--color-muted)] [font-size:0.7rem] [text-transform:uppercase] [letter-spacing:0.5px] [margin-bottom:0.25rem]">Tamu</div>
          <div className="[font-weight:400] [font-size:0.85rem] [color:var(--color-text)]">{booking.number_of_guest} orang</div>
        </div>
        <div>
          <div className="[color:var(--color-muted)] [font-size:0.7rem] [text-transform:uppercase] [letter-spacing:0.5px] [margin-bottom:0.25rem]">Total</div>
          <div className="[font-weight:400] [font-size:0.95rem] [color:var(--color-primary)]">{formatCurrency(booking.total_price)}</div>
        </div>
      </div>

      {/* Bukti Upload status message */}
      {alreadyPaid &&
      <div className="[background:rgba(72,187,120,0.05)] [border:1px_solid_rgba(72,187,120,0.2)] [padding:0.75rem_1rem] [display:flex] [align-items:center] [gap:0.5rem] [font-size:0.8rem] [color:#276749] [border-radius:var(--radius-sm)]">
          <CheckCircle size={14} className="[color:#38A169] [flex-shrink:0]" />
          Bukti pembayaran sudah dikirim — menunggu konfirmasi admin hotel.
        </div>
      }

      {/* Pending Countdown */}
      {booking.status === 'PENDING' && timeLeft > 0 &&
      <div className="[background:rgba(212,175,55,0.05)] [border:1px_solid_rgba(212,175,55,0.2)] [padding:0.75rem_1rem] [display:flex] [align-items:center] [gap:0.5rem] [border-radius:var(--radius-sm)]">
          <Clock size={14} className="[color:var(--color-primary)] [flex-shrink:0]" />
          <span className="[font-size:0.8rem] [color:var(--color-text)] [font-weight:300]">Batas bayar: <strong className="[color:var(--color-primary)] [font-weight:500]">{formatCount(timeLeft)}</strong></span>
        </div>
      }

      {/* Expanded details */}
      {expanded &&
      <div className="[background:var(--color-background)] [border:1px_solid_var(--color-accent)] [padding:1.5rem] [font-size:0.85rem] [display:flex] [flex-direction:column] [gap:1.5rem] [border-radius:var(--radius-sm)]">

          {/* Pemesan info */}
          <div>
            <h4 className="[font-family:var(--font-heading)] [font-size:1.1rem] [color:var(--color-text)] [margin:0_0_1rem] [font-weight:300]">Detail Pemesan</h4>
            <div className="max-sm:!grid-cols-1 max-sm:!gap-3 [display:grid] [grid-template-columns:1fr_1fr] [gap:1rem_2rem]">
              {[
            { label: 'Nama Pemesan', val: booking.orderer_name },
            { label: 'Email', val: booking.orderer_email },
            { label: 'No. Telepon', val: booking.orderer_phone },
            { label: 'ID Pesanan', val: `#${booking.id_booking || booking.id}` },
            { label: 'Hotel', val: hotelName },
            { label: 'Tipe Kamar', val: roomTypeName },
            { label: 'Alamat Hotel', val: booking.hotel_address }].
            map(({ label, val }) => val &&
            <div key={label}>
                  <div className="[color:var(--color-muted)] [font-size:0.7rem] [text-transform:uppercase] [letter-spacing:0.5px]">{label}</div>
                  <div className="[font-weight:400] [color:var(--color-text)] [margin-top:0.15rem]">{val}</div>
                </div>
            )}
            </div>
          </div>

          {/* Xendit Invoice Detail */}
          {booking.payment_method === 'XENDIT' &&
        <div className="[border-top:1px_solid_var(--color-accent)] [padding-top:1.25rem]">
              <div className="[display:flex] [align-items:center] [gap:0.6rem] [margin-bottom:1rem]">
                <div className="[width:28px] [height:28px] [background:#0057FF] [border-radius:6px] [display:flex] [align-items:center] [justify-content:center] [flex-shrink:0]">
                  <svg width="14" height="10" viewBox="0 0 22 16" fill="none">
                    <path d="M 5 0 L 11 7 L 5 14 M 13 0 L 19 7 L 13 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </div>
                <h4 className="[font-family:var(--font-heading)] [font-size:1.1rem] [color:var(--color-text)] [margin:0] [font-weight:300]">Detail Invoice Xendit</h4>
              </div>

              <div className="[display:grid] [grid-template-columns:1fr_1fr] [gap:1rem_2rem]">
                {/* Payment Status */}
                <div>
                  <div className="[color:var(--color-muted)] [font-size:0.7rem] [text-transform:uppercase] [letter-spacing:0.5px] [margin-bottom:0.35rem]">Status Pembayaran</div>
                  {booking.payment_status ?
              <span className={cn(
                'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
                booking.payment_status === 'PAID' || booking.payment_status === 'SETTLED' ?
                'bg-emerald-500/10 text-[#276749]' :
                booking.payment_status === 'EXPIRED' ?
                'bg-red-500/10 text-[#9B2C2C]' :
                'bg-amber-400/10 text-[var(--color-primary)]'
              )}>
                      {booking.payment_status === 'PAID' || booking.payment_status === 'SETTLED' ? '✓ ' : ''}
                      {booking.payment_status}
                    </span> :

              <span className="[color:var(--color-muted)] [font-size:0.8rem]">—</span>
              }
                </div>

                {/* Paid At */}
                {booking.paid_at &&
            <div>
                    <div className="[color:var(--color-muted)] [font-size:0.7rem] [text-transform:uppercase] [letter-spacing:0.5px] [margin-bottom:0.35rem]">Dibayar Pada</div>
                    <div className="[font-weight:400] [color:var(--color-text)] [font-size:0.85rem]">
                      {new Date(booking.paid_at).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
            }

                {/* External ID */}
                {booking.xendit_external_id &&
            <div className="[grid-column:1_/_-1]">
                    <div className="[color:var(--color-muted)] [font-size:0.7rem] [text-transform:uppercase] [letter-spacing:0.5px] [margin-bottom:0.35rem]">ID Transaksi Xendit</div>
                    <div className="[font-family:monospace] [font-size:0.78rem] [color:var(--color-text)] [background:var(--color-surface)] [padding:0.4rem_0.75rem] [border-radius:4px] [border:1px_solid_var(--color-accent)] [word-break:break-all]">
                      {booking.xendit_external_id}
                    </div>
                  </div>
            }

                {/* Invoice URL */}
                {booking.xendit_invoice_url &&
            <div className="[grid-column:1_/_-1]">
                    <div className="[color:var(--color-muted)] [font-size:0.7rem] [text-transform:uppercase] [letter-spacing:0.5px] [margin-bottom:0.35rem]">Link Invoice</div>
                    <a href={booking.xendit_invoice_url} target="_blank" rel="noopener noreferrer" className="[display:inline-flex] [align-items:center] [gap:0.4rem] [color:#0057FF] [font-size:0.8rem] [font-weight:400] [text-decoration:none] [border-bottom:1px_solid_#0057FF40]">

                      🔗 Buka Halaman Pembayaran Xendit
                    </a>
                  </div>
            }
              </div>
            </div>
        }

          {booking.payment_proof &&
        <div className="[border-top:1px_solid_var(--color-accent)] [padding-top:1rem]">
              <div className="[color:var(--color-muted)] [font-size:0.7rem] [text-transform:uppercase] [letter-spacing:0.5px] [margin-bottom:0.5rem]">Bukti Pembayaran</div>
              <a href={booking.payment_proof} target="_blank" rel="noopener noreferrer">
                <img src={booking.payment_proof} alt="Bukti Bayar" className="[max-height:160px] [max-width:100%] [object-fit:contain] [border-radius:2px] [border:1px_solid_var(--color-accent)]" />
              </a>
            </div>
        }
        </div>
      }

      {/* Action Buttons */}
      <div className="max-sm:!gap-2.5 max-sm:[&_.btn]:w-full max-sm:[&_.btn]:justify-center [display:flex] [gap:1rem] [flex-wrap:wrap] [border-top:1px_solid_var(--color-accent)] [padding-top:1.25rem]">
        {booking.status === 'PENDING' && !booking.xendit_invoice_url &&
        <Link to={`/payment/${booking.id_booking || booking.id}`} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[color-mix(in_srgb,var(--color-primary)_46%,transparent)] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))] text-[#061426] hover:brightness-105 min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem] [background:#0057FF] [border-color:#0057FF]">
            Bayar Sekarang
          </Link>
        }
        {booking.status === 'PENDING' && booking.xendit_invoice_url && booking.payment_status !== 'EXPIRED' &&
        <>
            <a href={booking.xendit_invoice_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[color-mix(in_srgb,var(--color-primary)_46%,transparent)] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))] text-[#061426] hover:brightness-105 min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem] [background:#0057FF] [border-color:#0057FF] [color:#fff]">
              Lanjutkan Pembayaran
            </a>
          </>
        }
        {booking.status === 'PENDING' && (booking.payment_status === 'EXPIRED' || !booking.xendit_invoice_url) &&
        <Link to={`/payment/${booking.id_booking || booking.id}`} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--color-text)] backdrop-blur-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-background)] min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem]">
            Buat Ulang Invoice
          </Link>
        }
        {booking.status === 'COMPLETED' &&
        <Link to={`/hotels/${hotelId}`} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[color-mix(in_srgb,var(--color-primary)_46%,transparent)] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))] text-[#061426] hover:brightness-105 min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem] [background:var(--color-primary)]">Pesan Lagi</Link>
        }
        <button onClick={() => setExpanded((e) => !e)} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--color-text)] backdrop-blur-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-background)] min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem]">
          {expanded ? <><ChevronUp size={12} /> Sembunyikan</> : <><ChevronDown size={12} /> Lihat Detail</>}
        </button>
        {booking.status === 'PENDING' &&
        <button onClick={() => onCancel(booking.id_booking || booking.id)} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--color-text)] backdrop-blur-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-background)] min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem] border-red-500/30 text-[#E53E3E] hover:bg-[#FFF5F5]">
            <XCircle size={12} className="[color:#E53E3E]" /> Batalkan
          </button>
        }
      </div>
    </div>);

};

export default MyBookings;
