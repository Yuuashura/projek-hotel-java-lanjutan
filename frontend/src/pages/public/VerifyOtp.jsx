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

  useEffect(() => {
    if (!email) navigate('/register');
  }, [email]);

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
    <div style={{ minHeight: '100vh', background: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: 64, height: 64, background: 'rgba(212,175,55,0.1)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
            <MailCheck size={32} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '2rem', margin: '0 0 0.5rem', color: 'var(--color-text)' }}>Verifikasi Email</h1>
          <p style={{ fontWeight: 300, color: 'var(--color-muted)', fontSize: '0.9rem' }}>
            Kode OTP 6 digit telah dikirim ke <strong style={{ color: 'var(--color-text)', fontWeight: 400 }}>{email}</strong>
          </p>
        </div>

        <div className="card" style={{ padding: '2.5rem 2rem', border: '1px solid var(--color-accent)', boxShadow: 'var(--shadow-float)' }}>
          {error && (
            <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', padding: '0.875rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', borderRadius: 'var(--radius-sm)' }}>
              <AlertCircle size={16} style={{ color: '#E53E3E', flexShrink: 0 }} />
              <span style={{ fontWeight: 300, color: '#C53030', fontSize: '0.85rem' }}>{error}</span>
            </div>
          )}
          {success && (
            <div style={{ background: 'rgba(72,187,120,0.05)', border: '1px solid rgba(72,187,120,0.2)', padding: '0.875rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', borderRadius: 'var(--radius-sm)' }}>
              <CheckCircle size={16} style={{ color: '#38A169', flexShrink: 0 }} />
              <span style={{ fontWeight: 300, color: '#276749', fontSize: '0.85rem' }}>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* OTP Input Boxes */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem' }}>
              {otp.map((digit, i) => (
                <input key={i} ref={el => inputRefs.current[i] = el}
                  type="text" inputMode="numeric" maxLength={1} value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  style={{
                    width: 48, height: 56, textAlign: 'center',
                    fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '1.5rem',
                    border: 'none',
                    borderBottom: digit ? '2px solid var(--color-primary)' : '1px solid var(--color-muted)',
                    background: 'transparent',
                    color: 'var(--color-text)',
                    outline: 'none',
                    transition: 'all 0.3s'
                  }}
                />
              ))}
            </div>

            {/* Timer */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              {!canResend ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 300 }}>
                  OTP kadaluarsa dalam&nbsp;
                  <span style={{ color: timeLeft < 60 ? '#E53E3E' : 'var(--color-primary)', fontWeight: 400 }}>{formatTime(timeLeft)}</span>
                </p>
              ) : (
                <button type="button" onClick={handleResend} disabled={resendLoading}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'underline' }}>
                  <RefreshCw size={12} /> {resendLoading ? 'Mengirim...' : 'Kirim Ulang OTP'}
                </button>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading || otp.join('').length < 6} style={{ height: 50, background: 'var(--color-primary)', opacity: (loading || otp.join('').length < 6) ? 0.65 : 1 }}>
              {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link to="/register" style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-muted)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.5px' }}>← Back to Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
