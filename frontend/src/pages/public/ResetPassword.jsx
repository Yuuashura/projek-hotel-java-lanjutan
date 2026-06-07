import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const ResetPassword = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialEmail = params.get('email') || sessionStorage.getItem('reset_password_email') || '';
  const [email] = useState(initialEmail);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifiedCode, setVerifiedCode] = useState('');
  const [passwords, setPasswords] = useState({ new_password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    if (token) {
      navigate(user?.role === 'ROLE_ADMIN_HOTEL' || user?.role === 'ROLE_ADMIN_APP' ? '/admin/dashboard' : '/');
      return;
    }

    if (!initialEmail) {
      navigate('/forgot-password', { replace: true });
    }
  }, [token, user, navigate, initialEmail]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    const paste = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    setOtp([...paste, ...Array(6 - paste.length).fill('')]);
    inputRefs.current[Math.min(paste.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');

    if (code.length < 6) return setError('Masukkan 6 digit kode reset');
    if (otpVerified && passwords.new_password !== passwords.confirmPassword) return setError('Konfirmasi password tidak cocok');

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!otpVerified) {
        const res = await api.post('/api/auth/verify-reset-otp', {
          email,
          otp_code: code,
        });
        setVerifiedCode(code);
        setOtpVerified(true);
        setSuccess(res.data?.message || 'Kode reset valid. Silakan buat password baru.');
        return;
      }

      const res = await api.post('/api/auth/reset-password', {
        email,
        otp_code: verifiedCode,
        new_password: passwords.new_password,
      });
      setSuccess(res.data?.message || 'Password berhasil direset. Silakan login kembali.');
      sessionStorage.removeItem('reset_password_email');
      window.setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || (otpVerified ? 'Gagal mereset password' : 'Kode reset tidak valid'));
      if (!otpVerified) {
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page-scroll">
      <div className="auth-shell animate-slide-in">
        <div className="auth-header">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div className="auth-brand">
              NgiNep<span style={{ color: 'var(--color-primary)' }}>.</span>
            </div>
          </Link>
          <h1>Reset Password</h1>
          <p>{otpVerified ? 'Kode valid. Buat password baru Anda.' : 'Masukkan kode OTP reset password terlebih dahulu.'}</p>
        </div>

        <div className="card auth-card">
          <div className="auth-card-accent" />

          {error && (
            <div className="alert-danger" style={{ padding: '0.875rem 1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', borderRadius: 'var(--radius-sm)' }}>
              <AlertCircle size={16} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
              <span style={{ fontWeight: 300, color: 'var(--color-danger)', fontSize: '0.85rem' }}>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert-success" style={{ padding: '0.875rem 1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', borderRadius: 'var(--radius-sm)' }}>
              <CheckCircle size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
              <span style={{ fontWeight: 300, color: 'var(--color-success)', fontSize: '0.85rem' }}>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="label">Alamat Email</label>
              <input className="input" type="email" placeholder="nama@email.com" value={email} required disabled readOnly />
            </div>

            <div className="auth-field">
              <label className="label">Kode Reset</label>
              <div className="otp-input-row">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(index, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className="otp-input-box"
                    aria-label={`Digit OTP ${index + 1}`}
                    disabled={otpVerified}
                  />
                ))}
              </div>
            </div>

            {otpVerified && (
              <div className="auth-verified-section">
                <div className="auth-field">
                  <label className="label">Password Baru</label>
                  <div style={{ position: 'relative' }}>
                    <input className="input" style={{ paddingRight: '2.5rem' }} type={showPw ? 'text' : 'password'} placeholder="Minimal 6 karakter" value={passwords.new_password} onChange={e => setPasswords(p => ({ ...p, new_password: e.target.value }))} required minLength={6} />
                    <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="auth-field">
                  <label className="label">Konfirmasi Password</label>
                  <div style={{ position: 'relative' }}>
                    <input className="input" style={{ paddingRight: '2.5rem' }} type={showConfirmPw ? 'text' : 'password'} placeholder="Ulangi password baru" value={passwords.confirmPassword} onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} required minLength={6} />
                    <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}>
                      {showConfirmPw ? <EyeOff size={16} /> : <Lock size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ height: 50, background: 'var(--color-primary)', opacity: loading ? 0.7 : 1 }}>
              {loading ? <><span className="btn-spinner" /> {otpVerified ? 'Mereset...' : 'Memverifikasi...'}</> : otpVerified ? 'Reset Password' : 'Verifikasi Kode Reset'}
            </button>
          </form>
        </div>

        <p className="auth-footnote">
          Belum menerima kode? <Link to="/forgot-password">Kirim ulang kode reset</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
