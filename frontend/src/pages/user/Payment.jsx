import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Upload, Clock, Check, AlertCircle, X } from 'lucide-react';
import { formatCurrency, formatDate, diffDays } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const PAYMENT_METHODS = [
  { id: 'Transfer Bank BCA', label: 'Transfer Bank BCA', info: 'No. Rek: 1234567890 a.n. PT NgiNep Corp', emoji: '🏦' },
  { id: 'Transfer Bank BRI', label: 'Transfer Bank BRI', info: 'No. Rek: 0987654321 a.n. PT NgiNep Corp', emoji: '🏦' },
  { id: 'Transfer Bank BNI', label: 'Transfer Bank BNI', info: 'No. Rek: 1122334455 a.n. PT NgiNep Corp', emoji: '🏦' },
  { id: 'QRIS', label: 'QRIS', info: 'Scan QR code di bawah untuk melakukan pembayaran', emoji: '📱' },
];

const Payment = () => {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ payment_method: '', payment_proof: '' });
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

  // Countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(l => { if (l <= 1) { clearInterval(t); return 0; } return l - 1; }), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const formatCountdown = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.payment_method) return setError('Pilih metode pembayaran terlebih dahulu');
    if (!form.payment_proof) return setError('Masukkan URL bukti pembayaran');
    setSubmitting(true);
    setError('');
    try {
      await api.patch(`/api/bookings/${bookingId}/pay`, { payment_method: form.payment_method, payment_proof: form.payment_proof });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim konfirmasi pembayaran');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', fontFamily: 'Space Grotesk', fontWeight: 700 }}>Memuat detail pembayaran...</div>;
  if (!booking) return null;

  if (success) return (
    <div style={{ maxWidth: 520, margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
      <div className="card" style={{ padding: '3rem 2rem' }}>
        <div style={{ width: 80, height: 80, background: 'var(--neo-green)', border: '4px solid var(--neo-dark)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: 'var(--neo-shadow)' }}>
          <Check size={40} style={{ color: 'var(--neo-dark)' }} />
        </div>
        <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.5rem', marginBottom: '0.75rem' }}>Pembayaran Dikirim!</h2>
        <p style={{ color: '#6b7280', fontWeight: 500, lineHeight: 1.6, marginBottom: '2rem' }}>Bukti pembayaran Anda sedang diverifikasi oleh Admin Hotel. Pesanan akan dikonfirmasi dalam 1×24 jam.</p>
        <Link to="/my-bookings" className="btn btn-dark btn-full" style={{ justifyContent: 'center' }}>Lihat Pesanan Saya</Link>
      </div>
    </div>
  );

  const nights = diffDays(booking.check_in, booking.check_out);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, textTransform: 'uppercase', fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', marginBottom: '2rem' }}>Informasi Pembayaran</h1>

      {/* Countdown */}
      {timeLeft > 0 && (
        <div style={{ background: timeLeft < 3600 ? '#fff0f3' : '#fff8e1', border: `3px solid ${timeLeft < 3600 ? 'var(--neo-pink)' : 'var(--neo-orange)'}`, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: `4px 4px 0px 0px ${timeLeft < 3600 ? 'var(--neo-pink)' : 'var(--neo-orange)'}` }}>
          <Clock size={20} style={{ color: timeLeft < 3600 ? 'var(--neo-pink)' : 'var(--neo-orange)', flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', color: '#374151' }}>Batas Waktu Pembayaran</div>
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1.5rem', color: timeLeft < 3600 ? 'var(--neo-pink)' : 'var(--neo-orange)' }}>{formatCountdown(timeLeft)}</div>
            <div style={{ fontWeight: 500, fontSize: '0.8rem', color: '#6b7280' }}>Pesanan otomatis dibatalkan jika melewati batas waktu</div>
          </div>
        </div>
      )}
      {timeLeft === 0 && (
        <div style={{ background: '#fff0f3', border: '3px solid var(--neo-pink)', padding: '1rem', marginBottom: '1.5rem', boxShadow: '4px 4px 0px 0px var(--neo-pink)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <X size={18} style={{ color: 'var(--neo-pink)', flexShrink: 0 }} />
          <span style={{ fontWeight: 700, color: '#be123c', fontSize: '0.875rem' }}>Batas waktu pembayaran telah habis. Pesanan mungkin sudah dibatalkan otomatis oleh sistem.</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Left: Ringkasan & Metode Bayar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Ringkasan Pesanan */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.95rem', marginBottom: '1.25rem', borderBottom: '2px solid var(--neo-dark)', paddingBottom: '0.75rem' }}>Ringkasan Pesanan</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
              {[
                { label: 'Pemesan', val: booking.orderer_name },
                { label: 'Email', val: booking.orderer_email },
                { label: 'Telepon', val: booking.orderer_phone },
                { label: 'Check-In', val: formatDate(booking.check_in) },
                { label: 'Check-Out', val: formatDate(booking.check_out) },
                { label: 'Durasi', val: `${nights} malam` },
                { label: 'Jumlah Tamu', val: `${booking.number_of_guest} orang` },
              ].map(({ label, val }) => (
                <div key={label}>
                  <div style={{ color: '#9ca3af', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{label}</div>
                  <div style={{ fontWeight: 700 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Metode Pembayaran */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.95rem', marginBottom: '1.25rem', borderBottom: '2px solid var(--neo-dark)', paddingBottom: '0.75rem' }}>Pilih Metode Pembayaran</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {PAYMENT_METHODS.map(m => (
                  <label key={m.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', border: `3px solid ${form.payment_method === m.id ? 'var(--neo-orange)' : 'var(--neo-dark)'}`, background: form.payment_method === m.id ? '#fff8f0' : 'white', cursor: 'pointer', boxShadow: form.payment_method === m.id ? '4px 4px 0px 0px var(--neo-orange)' : 'var(--neo-shadow-sm)', transition: 'all 0.15s' }}>
                    <input type="radio" name="payment" value={m.id} checked={form.payment_method === m.id} onChange={() => setForm(f => ({ ...f, payment_method: m.id }))} style={{ accentColor: 'var(--neo-orange)', marginTop: 2, width: 18, height: 18, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '0.9rem' }}>{m.emoji} {m.label}</div>
                      <div style={{ color: '#6b7280', fontWeight: 500, fontSize: '0.8rem', marginTop: '0.25rem' }}>{m.info}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="label"><Upload size={14} style={{ display: 'inline', marginRight: '0.4rem' }} />URL Bukti Pembayaran *</label>
                <input type="url" className="input" placeholder="https://imgur.com/bukti-transfer.jpg" value={form.payment_proof} onChange={e => setForm(f => ({ ...f, payment_proof: e.target.value }))} required />
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500, marginTop: '0.4rem' }}>Upload gambar ke imgur.com atau layanan lain, lalu paste URL-nya di sini.</p>
              </div>

              {error && (
                <div style={{ background: '#fff0f3', border: '3px solid var(--neo-pink)', padding: '0.875rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', boxShadow: '3px 3px 0px 0px var(--neo-pink)' }}>
                  <AlertCircle size={16} style={{ color: 'var(--neo-pink)', flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, color: '#be123c', fontSize: '0.85rem' }}>{error}</span>
                </div>
              )}

              <button type="submit" className="btn btn-green btn-full" disabled={submitting || timeLeft === 0} style={{ justifyContent: 'center', opacity: (submitting || timeLeft === 0) ? 0.65 : 1 }}>
                {submitting ? 'Mengirim...' : <><Check size={16} /> Konfirmasi Pembayaran</>}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Total */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.95rem', marginBottom: '1rem', borderBottom: '2px solid var(--neo-dark)', paddingBottom: '0.75rem' }}>Total Tagihan</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem', paddingBottom: '0.75rem', borderBottom: '2px dashed #e5e7eb' }}>
              <span style={{ color: '#6b7280' }}>{nights} malam × kamar</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1.3rem', paddingTop: '0.75rem' }}>
              <span>TOTAL</span>
              <span style={{ color: 'var(--neo-orange)' }}>{formatCurrency(booking.total_price)}</span>
            </div>
            <span className="badge badge-yellow" style={{ display: 'block', textAlign: 'center', marginTop: '1rem' }}>Status: PENDING</span>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:768px){.grid-pay{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
};

export default Payment;
