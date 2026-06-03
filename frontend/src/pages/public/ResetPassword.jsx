import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthFrame from '../../components/auth/AuthFrame';
import AlertMessage from '../../components/auth/AlertMessage';
import PasswordField from '../../components/auth/PasswordField';
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
        const res = await api.post('/api/auth/verify-reset-otp', { email, otp_code: code });
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
    <AuthFrame
      title="Reset Password"
      subtitle={otpVerified ? 'Kode valid. Buat password baru Anda.' : 'Masukkan kode OTP reset password terlebih dahulu.'}
      footnote={<>Belum menerima kode? <Link className="font-bold text-[var(--color-primary)]" to="/forgot-password">Kirim ulang kode reset</Link></>}
    >
      <AlertMessage tone="danger">{error}</AlertMessage>
      <AlertMessage tone="success">{success}</AlertMessage>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="space-y-2">
          <label className="label">Alamat Email</label>
          <Input type="email" placeholder="nama@email.com" value={email} required disabled readOnly />
        </div>

        <div className="space-y-2">
          <label className="label">Kode Reset</label>
          <div className="grid grid-cols-6 gap-2">
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
                className="h-14 min-w-0 rounded-[var(--radius-sm)] border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-center text-xl font-bold text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] disabled:opacity-50"
                aria-label={`Digit OTP ${index + 1}`}
                disabled={otpVerified}
              />
            ))}
          </div>
        </div>

        {otpVerified && (
          <div className="space-y-5 rounded-[var(--radius-sm)] border border-[var(--color-success-border)] bg-[var(--color-success-soft)] p-4 animate-[authVerifiedIn_.32s_ease_both]">
            <PasswordField
              label="Password Baru"
              show={showPw}
              onToggleShow={() => setShowPw(current => !current)}
              placeholder="Minimal 6 karakter"
              value={passwords.new_password}
              onChange={e => setPasswords(p => ({ ...p, new_password: e.target.value }))}
              required
              minLength={6}
            />

            <PasswordField
              label="Konfirmasi Password"
              show={showConfirmPw}
              onToggleShow={() => setShowConfirmPw(current => !current)}
              placeholder="Ulangi password baru"
              value={passwords.confirmPassword}
              onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
              required
              minLength={6}
            />
          </div>
        )}

        <Button type="submit" full disabled={loading} className="min-h-12">
          {loading ? <><span className="btn-spinner" /> {otpVerified ? 'Mereset...' : 'Memverifikasi...'}</> : otpVerified ? 'Reset Password' : 'Verifikasi Kode Reset'}
        </Button>
      </form>
    </AuthFrame>
  );
};

export default ResetPassword;
