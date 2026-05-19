import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MailCheck, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../utils/api';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get('email') || sessionStorage.getItem('otp_email') || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 menit
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Redirect jika tidak ada email
  useEffect(() => {
    if (!email) navigate('/register');
  }, [email]);

  // Countdown Timer
  useEffect(() => {
    if (timeLeft <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setTimeLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    setOtp([...paste, ...Array(6 - paste.length).fill('')]);
    inputRefs.current[Math.min(paste.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return setError('Masukkan 6 digit kode OTP');
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/verify-otp', { email, otp_code: code });
      setSuccess('Verifikasi berhasil! Mengalihkan ke halaman login...');
      sessionStorage.removeItem('otp_email');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Kode OTP tidak valid atau sudah kadaluarsa');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    try {
      await api.post('/api/auth/resend-otp', { email });
      setTimeLeft(300);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setSuccess('OTP baru telah dikirim ke email Anda!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim ulang OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--neo-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      {/* Decoratives */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, border: '5px solid rgba(255,255,255,0.15)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: -60, left: -60, width: 250, height: 250, border: '5px solid rgba(255,255,255,0.1)', borderRadius: '50%' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem', color: 'white' }}>
          <div style={{ width: 72, height: 72, background: 'var(--neo-yellow)', border: '4px solid white', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.3)' }}>
            <MailCheck size={36} style={{ color: 'var(--neo-dark)' }} />
          </div>
          <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1.5rem', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>Verifikasi Email</h1>
          <p style={{ fontWeight: 500, color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>
            Kode OTP 6 digit dikirim ke<br /><strong style={{ color: 'var(--neo-yellow)' }}>{email}</strong>
          </p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {error && (
            <div style={{ background: '#fff0f3', border: '3px solid var(--neo-pink)', padding: '0.875rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start', boxShadow: '3px 3px 0px 0px var(--neo-pink)' }}>
              <AlertCircle size={18} style={{ color: 'var(--neo-pink)', flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontWeight: 600, color: '#be123c', fontSize: '0.875rem' }}>{error}</span>
            </div>
          )}
          {success && (
            <div style={{ background: '#f0fdf4', border: '3px solid #86efac', padding: '0.875rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start', boxShadow: '3px 3px 0px 0px #16a34a' }}>
              <CheckCircle size={18} style={{ color: '#16a34a', flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontWeight: 600, color: '#166534', fontSize: '0.875rem' }}>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* OTP Input Boxes */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
              {otp.map((digit, i) => (
                <input key={i} ref={el => inputRefs.current[i] = el}
                  type="text" inputMode="numeric" maxLength={1} value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  style={{
                    width: 50, height: 60, textAlign: 'center',
                    fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1.5rem',
                    border: `3px solid ${digit ? 'var(--neo-purple)' : 'var(--neo-dark)'}`,
                    background: digit ? '#f5f0ff' : 'white',
                    outline: 'none', borderRadius: 0,
                    boxShadow: digit ? '3px 3px 0px 0px var(--neo-purple)' : 'var(--neo-shadow-sm)',
                    transition: 'all 0.15s'
                  }}
                />
              ))}
            </div>

            {/* Timer */}
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              {!canResend ? (
                <p style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.875rem', color: '#6b7280' }}>
                  OTP kadaluarsa dalam&nbsp;
                  <span style={{ color: timeLeft < 60 ? 'var(--neo-pink)' : 'var(--neo-purple)', fontWeight: 900, fontSize: '1rem' }}>{formatTime(timeLeft)}</span>
                </p>
              ) : (
                <button type="button" onClick={handleResend} disabled={resendLoading}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neo-purple)', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'underline' }}>
                  <RefreshCw size={14} /> {resendLoading ? 'Mengirim...' : 'Kirim Ulang OTP'}
                </button>
              )}
            </div>

            <button type="submit" className="btn btn-purple btn-full" disabled={loading || otp.join('').length < 6} style={{ opacity: (loading || otp.join('').length < 6) ? 0.65 : 1, border: '3px solid var(--neo-dark)' }}>
              {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
            <Link to="/register" style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.875rem', color: '#6b7280', textDecoration: 'none' }}>← Kembali ke Halaman Daftar</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
