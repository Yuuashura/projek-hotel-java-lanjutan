import React, { useState, useEffect } from 'react';
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
  }, [user]);

  useEffect(() => {
    api.get('/api/bookings/my')
      .then(r => {
        const b = (r.data.data || []).find(x => x.id_booking == bookingId || x.id == bookingId);
        if (!b) { navigate('/my-bookings'); return; }
        if (b.status !== 'PENDING') { navigate('/my-bookings'); return; }
        setBooking(b);
        if (b.payment_deadline) {
          const deadline = new Date(b.payment_deadline).getTime();
          setTimeLeft(Math.max(0, Math.floor((deadline - Date.now()) / 1000)));
        }
      })
      .catch(() => navigate('/my-bookings'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(l => { if (l <= 1) { clearInterval(t); return 0; } return l - 1; }), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const formatCountdown = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
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
      <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
        <LoadingState text="Memuat detail pembayaran..." />
      </div>
    );
  }
  if (!booking) return null;

  const nights = diffDays(booking.check_in, booking.check_out);

  return (
    <div className="user-page payment-page" style={{ background: 'var(--color-background)', minHeight: '100vh', padding: '6rem 1.5rem' }}>
      <div className="payment-shell" style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '2.5rem', marginBottom: '3rem', color: 'var(--color-text)' }}>
          Informasi Pembayaran
        </h1>

        {/* Countdown timer banner */}
        {timeLeft > 0 && (
          <div style={{ background: timeLeft < 3600 ? '#FFF5F5' : '#FFFDF3', border: `1px solid ${timeLeft < 3600 ? '#FEB2B2' : '#FEEBC8'}`, padding: '1.25rem 1.5rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <Clock size={24} style={{ color: timeLeft < 3600 ? '#E53E3E' : '#DD6B20', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-muted)', letterSpacing: '1px' }}>Sisa Waktu Pembayaran</div>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '1.5rem', color: timeLeft < 3600 ? '#E53E3E' : '#DD6B20', marginTop: '0.15rem' }}>{formatCountdown(timeLeft)}</div>
            </div>
          </div>
        )}

        {timeLeft === 0 && (
          <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', padding: '1.25rem 1.5rem', marginBottom: '2.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', borderRadius: 'var(--radius-sm)' }}>
            <X size={20} style={{ color: '#E53E3E', flexShrink: 0 }} />
            <span style={{ fontWeight: 300, color: '#C53030', fontSize: '0.9rem' }}>Batas waktu pembayaran telah habis. Silakan buat pesanan baru.</span>
          </div>
        )}

        <div className="payment-layout" style={{ display: 'grid', gridTemplateColumns: '62% 38%', gap: '3.5rem', alignItems: 'flex-start' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

            {/* Order Details */}
            <div className="card flow-animate payment-panel" style={{ padding: '2rem', border: '1px solid var(--color-accent)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--color-text)', borderBottom: '1px solid var(--color-accent)', paddingBottom: '0.5rem' }}>Detail Reservasi</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.85rem' }}>
                {[
                  { label: 'Pemesan', val: booking.orderer_name },
                  { label: 'Email', val: booking.orderer_email },
                  { label: 'No. Telepon', val: booking.orderer_phone },
                  { label: 'Check-In', val: formatDate(booking.check_in) },
                  { label: 'Check-Out', val: formatDate(booking.check_out) },
                  { label: 'Durasi menginap', val: `${nights} malam` },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <div style={{ color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem', fontSize: '0.7rem' }}>{label}</div>
                    <div style={{ fontWeight: 400, color: 'var(--color-text)' }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Xendit Payment Card */}
            <div className="card flow-animate payment-panel" style={{ padding: '2rem', border: '1px solid var(--color-accent)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--color-text)', borderBottom: '1px solid var(--color-accent)', paddingBottom: '0.5rem' }}>
                Metode Pembayaran
              </h3>

              {/* Xendit info panel */}
              <div style={{ background: 'linear-gradient(135deg, #0057FF08 0%, #003CC908 100%)', border: '1px solid #0057FF30', borderRadius: 'var(--radius-sm)', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: 40, height: 40, background: '#0057FF', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
                      <path d="M 5 0 L 11 7 L 5 14 M 13 0 L 19 7 L 13 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-text)' }}>Xendit Secure Payment</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 300 }}>Gerbang pembayaran aman & terenkripsi</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  {[
                    { icon: <CreditCard size={14} />, label: 'Virtual Account' },
                    { icon: <Zap size={14} />, label: 'E-Wallet (OVO, Dana)' },
                    { icon: <ShieldCheck size={14} />, label: 'QRIS & Gerai Retail' },
                  ].map(({ icon, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'white', borderRadius: 6, padding: '0.6rem 0.75rem', border: '1px solid #E2E8F0', fontSize: '0.72rem', color: 'var(--color-text)', fontWeight: 400 }}>
                      <span style={{ color: '#0057FF', flexShrink: 0 }}>{icon}</span>
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', padding: '0.875rem', display: 'flex', gap: '0.5rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                  <AlertCircle size={16} style={{ color: '#E53E3E', flexShrink: 0 }} />
                  <span style={{ fontWeight: 300, color: '#C53030', fontSize: '0.8rem' }}>{error}</span>
                </div>
              )}

              <button
                onClick={handlePayViaXendit}
                disabled={submitting || timeLeft === 0}
                style={{
                  width: '100%', height: 52, background: submitting || timeLeft === 0 ? '#A0AEC0' : '#0057FF',
                  color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-body)',
                  fontWeight: 600, fontSize: '1rem', cursor: submitting || timeLeft === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  transition: 'all 0.3s ease', letterSpacing: '0.5px'
                }}
                onMouseEnter={e => { if (!submitting && timeLeft > 0) e.currentTarget.style.background = '#003CC9'; }}
                onMouseLeave={e => { if (!submitting && timeLeft > 0) e.currentTarget.style.background = '#0057FF'; }}
              >
                {submitting ? (
                  <>
                    <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Mengalihkan ke Xendit...
                  </>
                ) : (
                  <>
                    <svg width="18" height="12" viewBox="0 0 22 16" fill="none">
                      <path d="M 5 0 L 11 7 L 5 14 M 13 0 L 19 7 L 13 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                    Bayar via Xendit
                  </>
                )}
              </button>

              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 300, marginTop: '1rem' }}>
                🔒 Pembayaran diproses secara aman oleh <strong>PT Sinar Digital Terdepan (Xendit)</strong>
              </p>
            </div>

          </div>

          {/* Right Column: Order Pricing */}
          <div style={{ position: 'sticky', top: 120 }}>
            <div className="flow-animate" style={{ background: '#F7FAFC', border: '1px solid var(--color-accent)', padding: '2rem', borderRadius: 'var(--radius-sm)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--color-text)', borderBottom: '1px solid var(--color-accent)', paddingBottom: '0.75rem', fontWeight: 300 }}>Total Tagihan</h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
                <span>Suite &amp; Nights</span>
                <span>{nights} malam</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--color-text)', borderTop: '1px solid var(--color-accent)', paddingTop: '1rem', fontWeight: 300 }}>
                <span>Total</span>
                <span style={{ color: 'var(--color-primary)' }}>{formatCurrency(booking.total_price)}</span>
              </div>

              {/* Payment status */}
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span className="badge" style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--color-primary)', borderColor: 'transparent', height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', letterSpacing: '1px' }}>
                  AWAITING PAYMENT
                </span>
                {booking.xendit_invoice_url && booking.payment_status !== 'EXPIRED' && (
                  <div style={{ background: 'rgba(0,87,255,0.05)', border: '1px solid rgba(0,87,255,0.15)', borderRadius: 6, padding: '0.6rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Check size={12} style={{ color: '#0057FF', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.72rem', color: '#0057FF', fontWeight: 400 }}>Invoice Xendit sudah dibuat</span>
                  </div>
                )}
              </div>

              <Link to="/my-bookings" style={{ display: 'block', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 300, textDecoration: 'underline' }}>
                Kembali ke Pesanan Saya
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Payment;
