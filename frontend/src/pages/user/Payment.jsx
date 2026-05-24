import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Upload, Clock, Check, AlertCircle, X, ImageIcon } from 'lucide-react';
import { formatCurrency, formatDate, diffDays } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import LoadingState from '../../components/LoadingState';
import api from '../../utils/api';
import { validateImageFile } from '../../utils/uploads';

const BcaLogo = () => (
  <svg width="46" height="26" viewBox="0 0 46 26" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <rect width="46" height="26" rx="4" fill="#0A387E" />
    <path d="M 6 12 Q 9 8.5, 12 12 T 18 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M 6 16 Q 9 12.5, 12 16 T 18 16" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <text x="31" y="16.5" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="10" fill="white" letterSpacing="0.2">BCA</text>
  </svg>
);

const BriLogo = () => (
  <svg width="46" height="26" viewBox="0 0 46 26" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <rect width="46" height="26" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
    <rect x="4" y="5" width="13" height="16" rx="1.5" fill="#00529C" />
    <path d="M 7 13 Q 10.5 9.5, 14 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <circle cx="10.5" cy="15" r="1.2" fill="#F37021" />
    <text x="31" y="17.5" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="11" fill="#00529C" letterSpacing="0.1">BRI</text>
  </svg>
);

const BniLogo = () => (
  <svg width="46" height="26" viewBox="0 0 46 26" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <rect width="46" height="26" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
    <circle cx="10" cy="13" r="5.5" fill="#E05C1C" />
    <text x="10" y="15" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="6.5" fill="white" textAnchor="middle">46</text>
    <text x="27" y="17.5" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="11" fill="#005E6A" letterSpacing="-0.5">BNI</text>
  </svg>
);

const QrisLogo = () => (
  <svg width="46" height="26" viewBox="0 0 46 26" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <rect width="46" height="26" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
    <text x="23" y="17" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="11" textAnchor="middle" letterSpacing="-0.5">
      <tspan fill="#009FB7">Q</tspan>
      <tspan fill="#E51C24">R</tspan>
      <tspan fill="#F58220">I</tspan>
      <tspan fill="#0F3B7A">S</tspan>
    </text>
  </svg>
);

const PAYMENT_METHODS = [
  { id: 'Transfer Bank BCA', label: 'Transfer Bank BCA', info: 'No. Rek: 1234567890 a.n. PT NgiNep Corp', logo: <BcaLogo /> },
  { id: 'Transfer Bank BRI', label: 'Transfer Bank BRI', info: 'No. Rek: 0987654321 a.n. PT NgiNep Corp', logo: <BriLogo /> },
  { id: 'Transfer Bank BNI', label: 'Transfer Bank BNI', info: 'No. Rek: 1122334455 a.n. PT NgiNep Corp', logo: <BniLogo /> },
  { id: 'QRIS', label: 'QRIS', info: 'Scan QR code di bawah untuk melakukan pembayaran', logo: <QrisLogo /> },
];


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

  if (success) {
    return (
      <div style={{ maxWidth: 520, margin: '6rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3.5rem 2.5rem', border: '1px solid var(--color-accent)' }}>
          <div style={{ width: 64, height: 64, background: 'rgba(72,187,120,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Check size={32} style={{ color: '#38A169' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '0.75rem', fontWeight: 300 }}>Pembayaran Dikirim</h2>
          <p style={{ color: 'var(--color-muted)', fontWeight: 300, lineHeight: 1.7, marginBottom: '2.5rem', fontSize: '0.9rem' }}>
            Bukti transfer Anda telah kami terima dan sedang dalam proses verifikasi oleh Admin Hotel. Voucher menginap Anda akan aktif dalam 1×24 jam.
          </p>
          <Link to="/my-bookings" className="btn btn-dark btn-full" style={{ justifyContent: 'center', height: 50 }}>Lihat Pesanan Saya</Link>
        </div>
      </div>
    );
  }

  const nights = diffDays(booking.check_in, booking.check_out);

  return (
    <div style={{ background: 'var(--color-background)', minHeight: '100vh', padding: '6rem 1.5rem' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '2.5rem', marginBottom: '3rem', color: 'var(--color-text)' }}>Informasi Pembayaran</h1>

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

        <div style={{ display: 'grid', gridTemplateColumns: '62% 38%', gap: '3.5rem', alignItems: 'flex-start' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* Order Details */}
            <div className="card" style={{ padding: '2rem', border: '1px solid var(--color-accent)' }}>
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

            {/* Payment Method Selector & File Upload */}
            <div className="card" style={{ padding: '2rem', border: '1px solid var(--color-accent)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--color-text)', borderBottom: '1px solid var(--color-accent)', paddingBottom: '0.5rem' }}>Metode Pembayaran</h3>
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Bank selection cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {PAYMENT_METHODS.map(m => {
                    const isChecked = form.payment_method === m.id;
                    return (
                      <label key={m.id} 
                        style={{ 
                          display: 'flex', gap: '1rem', padding: '1.25rem', cursor: 'pointer', borderRadius: 'var(--radius-sm)',
                          border: isChecked ? '1px solid var(--color-primary)' : '1px solid var(--color-accent)', 
                          background: isChecked ? 'rgba(212,175,55,0.02)' : 'var(--color-surface)', 
                          transition: 'all 0.3s ease' 
                        }}>
                        <input type="radio" name="payment" value={m.id} checked={isChecked} onChange={() => setForm(f => ({ ...f, payment_method: m.id }))} style={{ accentColor: 'var(--color-primary)', marginTop: 5, width: 16, height: 16, flexShrink: 0 }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                            {m.logo}
                            <span>{m.label}</span>
                          </div>
                          <div style={{ color: 'var(--color-muted)', fontSize: '0.8rem', fontWeight: 300 }}>{m.info}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {form.payment_method === 'QRIS' && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: '#F8FAFC',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-accent)',
                    marginTop: '0.5rem',
                    animation: 'fadeIn 0.4s ease'
                  }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>QRIS NgiNep Corp</div>
                    <div style={{ background: 'white', padding: '0.75rem', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-sm)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                      <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="150" height="150" fill="white"/>
                        <rect x="10" y="10" width="30" height="30" stroke="black" strokeWidth="4" fill="none"/>
                        <rect x="18" y="18" width="14" height="14" fill="black"/>
                        <rect x="110" y="10" width="30" height="30" stroke="black" strokeWidth="4" fill="none"/>
                        <rect x="118" y="18" width="14" height="14" fill="black"/>
                        <rect x="10" y="110" width="30" height="30" stroke="black" strokeWidth="4" fill="none"/>
                        <rect x="18" y="118" width="14" height="14" fill="black"/>
                        <rect x="50" y="15" width="8" height="8" fill="black"/>
                        <rect x="65" y="10" width="12" height="6" fill="black"/>
                        <rect x="85" y="25" width="6" height="12" fill="black"/>
                        <rect x="55" y="45" width="15" height="8" fill="black"/>
                        <rect x="80" y="45" width="8" height="12" fill="black"/>
                        <rect x="15" y="60" width="12" height="8" fill="black"/>
                        <rect x="35" y="70" width="8" height="15" fill="black"/>
                        <rect x="50" y="70" width="12" height="12" fill="black"/>
                        <rect x="75" y="65" width="18" height="8" fill="black"/>
                        <rect x="105" y="60" width="10" height="10" fill="black"/>
                        <rect x="125" y="75" width="12" height="12" fill="black"/>
                        <rect x="25" y="90" width="8" height="8" fill="black"/>
                        <rect x="60" y="95" width="12" height="6" fill="black"/>
                        <rect x="90" y="90" width="18" height="8" fill="black"/>
                        <rect x="130" y="100" width="8" height="8" fill="black"/>
                        <rect x="50" y="115" width="18" height="12" fill="black"/>
                        <rect x="80" y="125" width="12" height="12" fill="black"/>
                        <rect x="115" y="120" width="8" height="15" fill="black"/>
                        <rect x="65" y="130" width="8" height="8" fill="black"/>
                        <rect x="95" y="110" width="8" height="8" fill="black"/>
                        <rect x="60" y="60" width="30" height="30" fill="white" stroke="#0F3B7A" strokeWidth="2" rx="2"/>
                        <text x="75" y="78" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="7" textAnchor="middle" fill="#0F3B7A">QRIS</text>
                      </svg>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', textAlign: 'center' }}>Scan QR di atas dengan aplikasi bank atau e-wallet pilihan Anda</div>
                  </div>
                )}

                {/* Upload Proof */}
                <div>
                  <label className="label" style={{ display: 'block', marginBottom: '0.5rem' }}>Bukti Pembayaran *</label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    style={{
                      border: previewUrl ? '1px solid #38A169' : '1px dashed var(--color-muted)',
                      padding: '2rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: previewUrl ? 'rgba(72,187,120,0.02)' : 'transparent',
                      transition: 'all 0.3s ease',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '0.5rem'
                    }}
                  >
                    {previewUrl ? (
                      <div>
                        <img src={previewUrl} alt="Bukti bayar" style={{ maxHeight: 180, maxWidth: '100%', objectFit: 'contain', borderRadius: 2, marginBottom: '1rem', border: '1px solid var(--color-accent)' }} />
                        <div style={{ fontSize: '0.8rem', fontWeight: 400, color: '#38A169' }}>
                          {previewFile ? previewFile.name : 'Bukti transfer siap kirim'}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <ImageIcon size={32} style={{ color: 'var(--color-muted)', marginBottom: '0.5rem' }} />
                        <div style={{ fontWeight: 400, fontSize: '0.85rem', color: 'var(--color-text)' }}>Klik untuk memilih file bukti bayar</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 300, marginTop: '0.25rem' }}>Format gambar JPG, PNG, WEBP max 5MB</div>
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                </div>

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

          {/* Right Column: Order Pricing */}
          <div style={{ position: 'sticky', top: 120 }}>
            <div style={{ background: '#F7FAFC', border: '1px solid var(--color-accent)', padding: '2rem', borderRadius: 'var(--radius-sm)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--color-text)', borderBottom: '1px solid var(--color-accent)', paddingBottom: '0.75rem', fontWeight: 300 }}>Total Tagihan</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
                <span>Suite & Nights</span>
                <span>{nights} malam</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--color-text)', borderTop: '1px solid var(--color-accent)', paddingTop: '1rem', fontWeight: 300 }}>
                <span>Total</span>
                <span style={{ color: 'var(--color-primary)' }}>{formatCurrency(booking.total_price)}</span>
              </div>
              
              <div style={{ display: 'block', textAlign: 'center', marginTop: '1.5rem' }}>
                <span className="badge" style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--color-primary)', borderColor: 'transparent', width: '100%', height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  AWAITING PAYMENT VERIFICATION
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Payment;
