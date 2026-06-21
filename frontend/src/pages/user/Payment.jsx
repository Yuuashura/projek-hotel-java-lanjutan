import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, Check, AlertCircle, X, CreditCard, ShieldCheck, Zap } from 'lucide-react';
import { formatCurrency, formatDate, diffDays } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import LoadingState from '../../components/LoadingState';
import api from '../../utils/api';

const Payment = () => {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!user || user.role !== 'ROLE_USER') navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    api.get('/api/bookings/my').
    then((r) => {
      const b = (r.data.data || []).find((x) => x.id_booking == bookingId || x.id == bookingId);
      if (!b) {navigate('/my-bookings');return;}
      if (b.status !== 'PENDING') {navigate('/my-bookings');return;}
      setBooking(b);
      if (b.payment_deadline) {
        const deadline = new Date(b.payment_deadline).getTime();
        setTimeLeft(Math.max(0, Math.floor((deadline - Date.now()) / 1000)));
      }
    }).
    catch(() => navigate('/my-bookings')).
    finally(() => setLoading(false));
  }, [bookingId, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((l) => {if (l <= 1) {clearInterval(t);return 0;}return l - 1;}), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const formatCountdown = (s) => {
    const h = Math.floor(s / 3600),m = Math.floor(s % 3600 / 60),sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handlePayViaXendit = async () => {
    if (timeLeft === 0) return;
    setSubmitting(true);
    setError('');
    try {
      // Jika sudah ada invoice URL dan belum expired, langsung redirect
      if (booking.xendit_invoice_url && booking.payment_status !== 'EXPIRED') {
        window.location.href = booking.xendit_invoice_url;
        return;
      }
      // Buat invoice baru
      const response = await api.post(`/api/bookings/${bookingId}/xendit-invoice`);
      const url = response.data?.data?.invoice_url;
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Gagal mendapatkan link pembayaran Xendit');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal memproses pembayaran Xendit');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="[min-height:70vh] [display:grid] [place-items:center] [padding:2rem]">
        <LoadingState text="Memuat detail pembayaran..." />
      </div>);

  }
  if (!booking) return null;

  const nights = diffDays(booking.check_in, booking.check_out);

  return (
    <div className="px-6 py-16 max-[920px]:px-4 max-[920px]:py-12 max-sm:px-3.5 max-sm:py-8 px-6 py-16 max-[920px]:px-4 max-[920px]:py-12 max-sm:px-3.5 max-sm:py-8 [background:var(--color-background)] [min-height:100vh] [padding:6rem_1.5rem]">
      <div className="mx-auto max-w-[900px]">
        <h1 className="[font-family:var(--font-heading)] [font-weight:300] [font-size:2.5rem] [margin-bottom:3rem] [color:var(--color-text)]">
          Informasi Pembayaran
        </h1>

        {/* Countdown timer banner */}
        {timeLeft > 0 &&
        <div className={cn(
          'mb-10 flex items-center gap-4 rounded-lg border px-6 py-5',
          timeLeft < 3600 ?
          'border-[var(--color-danger-border)] bg-[var(--color-danger-soft)]' :
          'border-[var(--color-warning-border)] bg-[var(--color-warning-soft)]'
        )}>
            <Clock size={24} className={cn('shrink-0', timeLeft < 3600 ? 'text-[var(--color-danger)]' : 'text-[var(--color-warning)]')} />
            <div>
              <div className="[font-size:0.75rem] [text-transform:uppercase] [color:var(--color-muted)] [letter-spacing:1px]">Sisa Waktu Pembayaran</div>
              <div className={cn('mt-0.5 font-[var(--font-body)] text-2xl font-normal', timeLeft < 3600 ? 'text-[var(--color-danger)]' : 'text-[var(--color-warning)]')}>{formatCountdown(timeLeft)}</div>
            </div>
          </div>
        }

        {timeLeft === 0 &&
        <div className="[background:var(--color-danger-soft)] [border:1px_solid_var(--color-danger-border)] [padding:1.25rem_1.5rem] [margin-bottom:2.5rem] [display:flex] [gap:0.75rem] [align-items:center] [border-radius:var(--radius-sm)]">
            <X size={20} className="[color:var(--color-danger)] [flex-shrink:0]" />
            <span className="[font-weight:300] [color:var(--color-danger)] [font-size:0.9rem]">Batas waktu pembayaran telah habis. Silakan buat pesanan baru.</span>
          </div>
        }

        <div className="max-[920px]:!grid-cols-1 max-[920px]:!gap-6 [display:grid] [grid-template-columns:62%_38%] [gap:3.5rem] [align-items:flex-start]">
          {/* Left Column */}
          <div className="[display:flex] [flex-direction:column] [gap:2.5rem]">

            {/* Order Details */}
            <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--color-text)] shadow-[var(--shadow-float)] backdrop-blur-xl transition-all duration-300 will-change-[transform,opacity] max-sm:!p-4 [padding:2rem] [border:1px_solid_var(--color-accent)]">
              <h3 className="[font-family:var(--font-heading)] [font-weight:300] [font-size:1.5rem] [margin-bottom:1.5rem] [color:var(--color-text)] [border-bottom:1px_solid_var(--color-accent)] [padding-bottom:0.5rem]">Detail Reservasi</h3>
              <div className="[display:grid] [grid-template-columns:1fr_1fr] [gap:1.5rem] [font-size:0.85rem]">
                {[
                { label: 'Pemesan', val: booking.orderer_name },
                { label: 'Email', val: booking.orderer_email },
                { label: 'No. Telepon', val: booking.orderer_phone },
                { label: 'Check-In', val: formatDate(booking.check_in) },
                { label: 'Check-Out', val: formatDate(booking.check_out) },
                { label: 'Durasi menginap', val: `${nights} malam` }].
                map(({ label, val }) =>
                <div key={label}>
                    <div className="[color:var(--color-muted)] [text-transform:uppercase] [letter-spacing:0.5px] [margin-bottom:0.25rem] [font-size:0.7rem]">{label}</div>
                    <div className="[font-weight:400] [color:var(--color-text)]">{val}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Xendit Payment Card */}
            <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--color-text)] shadow-[var(--shadow-float)] backdrop-blur-xl transition-all duration-300 will-change-[transform,opacity] max-sm:!p-4 [padding:2rem] [border:1px_solid_var(--color-accent)]">
              <h3 className="[font-family:var(--font-heading)] [font-weight:300] [font-size:1.5rem] [margin-bottom:1.5rem] [color:var(--color-text)] [border-bottom:1px_solid_var(--color-accent)] [padding-bottom:0.5rem]">
                Metode Pembayaran
              </h3>

              {/* Xendit info panel */}
              <div className="[background:linear-gradient(135deg,_rgba(0,87,255,0.06)_0%,_rgba(0,60,201,0.06)_100%)] [border:1px_solid_rgba(0,87,255,0.22)] [border-radius:var(--radius-sm)] [padding:1.5rem] [margin-bottom:1.5rem]">
                <div className="[display:flex] [align-items:center] [gap:0.75rem] [margin-bottom:1.25rem]">
                  <div className="[width:40px] [height:40px] [background:var(--color-primary)] [border-radius:8px] [display:flex] [align-items:center] [justify-content:center] [flex-shrink:0]">
                    <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
                      <path d="M 5 0 L 11 7 L 5 14 M 13 0 L 19 7 L 13 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </div>
                  <div>
                    <div className="[font-weight:600] [font-size:1rem] [color:var(--color-text)]">Xendit Secure Payment</div>
                    <div className="[font-size:0.75rem] [color:var(--color-muted)] [font-weight:300]">Gerbang pembayaran aman & terenkripsi</div>
                  </div>
                </div>

                <div className="[display:grid] [grid-template-columns:1fr_1fr_1fr] [gap:0.75rem] [margin-bottom:0.5rem]">
                  {[
                  { icon: <CreditCard size={14} />, label: 'Virtual Account' },
                  { icon: <Zap size={14} />, label: 'E-Wallet (OVO, Dana)' },
                  { icon: <ShieldCheck size={14} />, label: 'QRIS & Gerai Retail' }].
                  map(({ icon, label }) =>
                  <div key={label} className="[display:flex] [align-items:center] [gap:0.4rem] [background:var(--color-surface-solid)] [border-radius:6px] [padding:0.6rem_0.75rem] [border:1px_solid_var(--color-accent)] [font-size:0.72rem] [color:var(--color-text)] [font-weight:400]">
                      <span className="[color:var(--color-primary)] [flex-shrink:0]">{icon}</span>
                      {label}
                    </div>
                  )}
                </div>
              </div>

              {error &&
              <div className="[background:var(--color-danger-soft)] [border:1px_solid_var(--color-danger-border)] [padding:0.875rem] [display:flex] [gap:0.5rem] [border-radius:var(--radius-sm)] [margin-bottom:1rem]">
                  <AlertCircle size={16} className="[color:var(--color-danger)] [flex-shrink:0]" />
                  <span className="[font-weight:300] [color:var(--color-danger)] [font-size:0.8rem]">{error}</span>
                </div>
              }

              <button
                onClick={handlePayViaXendit}
                disabled={submitting || timeLeft === 0}
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-lg border-0 bg-[var(--color-primary)] font-[var(--font-body)] text-base font-semibold tracking-[0.5px] text-white transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:bg-[#A0AEC0]">

                {submitting ?
                <>
                    <div className="[width:18px] [height:18px] [border:2px_solid_rgba(255,255,255,0.3)] [border-top-color:white] [border-radius:50%] [animation:spin_0.8s_linear_infinite]" />
                    Mengalihkan ke Xendit...
                  </> :

                <>
                    <svg width="18" height="12" viewBox="0 0 22 16" fill="none">
                      <path d="M 5 0 L 11 7 L 5 14 M 13 0 L 19 7 L 13 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                    Bayar Sekarang
                  </>
                }
              </button>

              <p className="[text-align:center] [font-size:0.75rem] [color:var(--color-muted)] [font-weight:300] [margin-top:1rem]">
                🔒 Pembayaran diproses secara aman oleh <strong>PT Sinar Digital Terdepan (Xendit)</strong>
              </p>
            </div>

          </div>

          {/* Right Column: Order Pricing */}
          <div className="[position:sticky] [top:120px]">
            <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--color-text)] shadow-[var(--shadow-float)] backdrop-blur-xl transition-all duration-300 will-change-[transform,opacity] [padding:2rem] [border:1px_solid_var(--color-accent)]">
              <h3 className="[font-family:var(--font-heading)] [font-size:1.5rem] [margin-bottom:1.5rem] [color:var(--color-text)] [border-bottom:1px_solid_var(--color-accent)] [padding-bottom:0.75rem] [font-weight:300]">Total Tagihan</h3>

              <div className="[display:flex] [justify-content:space-between] [font-size:0.85rem] [color:var(--color-muted)] [margin-bottom:1rem]">
                <span>Suite &amp; Nights</span>
                <span>{nights} malam</span>
              </div>

              <div className="[display:flex] [justify-content:space-between] [font-family:var(--font-heading)] [font-size:1.6rem] [color:var(--color-text)] [border-top:1px_solid_var(--color-accent)] [padding-top:1rem] [font-weight:300]">
                <span>Total</span>
                <span className="[color:var(--color-primary)]">{formatCurrency(booking.total_price)}</span>
              </div>

              {/* Payment status */}
              <div className="[margin-top:1.5rem] [display:flex] [flex-direction:column] [gap:0.5rem]">
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-accent)] bg-[var(--color-background)] px-3 py-1 text-[0.7rem] font-medium uppercase text-[var(--color-text)] max-sm:px-2.5 max-sm:py-1 max-sm:text-[0.64rem] [background:rgba(212,175,55,0.1)] [color:var(--color-primary)] [border-color:transparent] [height:32px] [display:flex] [align-items:center] [justify-content:center] [font-size:0.7rem] [letter-spacing:1px]">
                  AWAITING PAYMENT
                </span>
                {booking.xendit_invoice_url && booking.payment_status !== 'EXPIRED' &&
                <div className="[background:var(--color-primary-soft)] [border:1px_solid_var(--color-accent)] [border-radius:6px] [padding:0.6rem_0.75rem] [display:flex] [align-items:center] [gap:0.5rem]">
                    <Check size={12} className="[color:var(--color-primary)] [flex-shrink:0]" />
                    <span className="[font-size:0.72rem] [color:var(--color-primary)] [font-weight:400]">Invoice Xendit sudah dibuat</span>
                  </div>
                }
              </div>

              <Link to="/my-bookings" className="[display:block] [text-align:center] [margin-top:1.5rem] [font-size:0.8rem] [color:var(--color-muted)] [font-weight:300] [text-decoration:underline]">
                Kembali ke Pesanan Saya
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>);

};

export default Payment;
