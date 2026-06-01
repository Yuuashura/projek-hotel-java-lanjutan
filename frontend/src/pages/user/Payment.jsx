import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { formatDate, diffDays } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import LoadingState from '../../components/LoadingState';
import PaymentSuccess from '../../components/payment/PaymentSuccess';
import PaymentTimerBanner from '../../components/payment/PaymentTimerBanner';
import PaymentMethodSelector from '../../components/payment/PaymentMethodSelector';
import PaymentProofUpload from '../../components/payment/PaymentProofUpload';
import PaymentSummaryCard from '../../components/payment/PaymentSummaryCard';
import api from '../../utils/api';
import { validateImageFile } from '../../utils/uploads';


const Payment = () => {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ payment_method: '', payment_proof: '' });
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
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
        if (b.payment_proof) {
          setPreviewUrl(b.payment_proof);
          setForm(f => ({ ...f, payment_method: b.payment_method || '', payment_proof: b.payment_proof }));
        }
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setPreviewFile(file);
    setError('');
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.payment_method) return setError('Pilih metode pembayaran terlebih dahulu');
    if (!previewFile && !form.payment_proof) return setError('Upload bukti pembayaran terlebih dahulu');
    setSubmitting(true);
    setError('');
    try {
      if (previewFile) {
        const formData = new FormData();
        formData.append('payment_method', form.payment_method);
        formData.append('payment_proof', previewFile);
        await api.patch(`/api/bookings/${bookingId}/pay-upload`, formData);
      } else {
        await api.patch(`/api/bookings/${bookingId}/pay`, {
          payment_method: form.payment_method,
          payment_proof: form.payment_proof,
        });
      }
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim konfirmasi pembayaran');
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

  if (success) return <PaymentSuccess />;

  const nights = diffDays(booking.check_in, booking.check_out);

  return (
    <div className="user-page payment-page" style={{ background: 'var(--color-background)', minHeight: '100vh', padding: '6rem 1.5rem' }}>
      <div className="payment-shell" style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '2.5rem', marginBottom: '3rem', color: 'var(--color-text)' }}>Informasi Pembayaran</h1>

        <PaymentTimerBanner timeLeft={timeLeft} formatCountdown={formatCountdown} />

        <div className="payment-layout" style={{ display: 'grid', gridTemplateColumns: '62% 38%', gap: '3.5rem', alignItems: 'flex-start' }}>
          {/* Left Column */}
          <div className="payment-main-column" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* Order Details */}
            <div className="card flow-animate payment-panel" style={{ padding: '2rem', border: '1px solid var(--color-accent)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--color-text)', borderBottom: '1px solid var(--color-accent)', paddingBottom: '0.5rem' }}>Detail Reservasi</h3>
              <div className="payment-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.85rem' }}>
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

            {/* Payment Method Selector & File Upload */}
            <div className="card flow-animate payment-panel" style={{ padding: '2rem', border: '1px solid var(--color-accent)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--color-text)', borderBottom: '1px solid var(--color-accent)', paddingBottom: '0.5rem' }}>Metode Pembayaran</h3>
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                <PaymentMethodSelector
                  value={form.payment_method}
                  onChange={paymentMethod => setForm(f => ({ ...f, payment_method: paymentMethod }))}
                />

                <PaymentProofUpload
                  fileRef={fileRef}
                  previewFile={previewFile}
                  previewUrl={previewUrl}
                  onChange={handleFileChange}
                />

                {error && (
                  <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', padding: '0.875rem', display: 'flex', gap: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                    <AlertCircle size={16} style={{ color: '#E53E3E', flexShrink: 0 }} />
                    <span style={{ fontWeight: 300, color: '#C53030', fontSize: '0.8rem' }}>{error}</span>
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-full" disabled={submitting || timeLeft === 0} style={{ justifyContent: 'center', height: 50, background: 'var(--color-primary)', opacity: (submitting || timeLeft === 0) ? 0.65 : 1 }}>
                  {submitting ? 'Mengirim...' : 'Kirim Bukti Pembayaran'}
                </button>

              </form>
            </div>

          </div>

          <PaymentSummaryCard nights={nights} totalPrice={booking.total_price} />

        </div>

      </div>
    </div>
  );
};

export default Payment;
