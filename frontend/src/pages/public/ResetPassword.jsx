import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import { FormField, TextInput } from '../../components/ui/FormField';
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

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    const code = otp.join('');

    if (code.length < 6) {
      setError('Masukkan 6 digit kode reset');
      return;
    }

    if (otpVerified && passwords.new_password !== passwords.confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!otpVerified) {
        const response = await api.post('/api/auth/verify-reset-otp', {
          email,
          otp_code: code,
        });
        setVerifiedCode(code);
        setOtpVerified(true);
        setSuccess(response.data?.message || 'Kode reset valid. Silakan buat password baru.');
        return;
      }

      const response = await api.post('/api/auth/reset-password', {
        email,
        otp_code: verifiedCode,
        new_password: passwords.new_password,
      });
      setSuccess(response.data?.message || 'Password berhasil direset. Silakan login kembali.');
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

  const passwordToggle = (active, onClick, label, fallbackIcon = null) => (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center border-0 bg-transparent text-[var(--color-muted)] transition hover:text-[var(--color-primary)]"
      aria-label={label}
    >
      {active ? <EyeOff size={16} /> : fallbackIcon || <Eye size={16} />}
    </button>
  );

  return (
    <AuthLayout
      title="Reset Password"
      subtitle={otpVerified ? 'Kode valid. Buat password baru Anda.' : 'Masukkan kode OTP reset password terlebih dahulu.'}
      scroll
      footnote={
        <>
          Belum menerima kode? <Link to="/forgot-password">Kirim ulang kode reset</Link>
        </>
      }
    >
      {error && <Alert type="danger">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      <form onSubmit={handleSubmit}>
        <FormField label="Alamat Email">
          <TextInput type="email" placeholder="nama@email.com" value={email} required disabled readOnly />
        </FormField>

        <FormField label="Kode Reset">
          <div className="otp-input-row">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={element => inputRefs.current[index] = element}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={event => handleOtpChange(index, event.target.value)}
                onKeyDown={event => handleOtpKeyDown(index, event)}
                onPaste={handleOtpPaste}
                className="otp-input-box"
                aria-label={`Digit OTP ${index + 1}`}
                disabled={otpVerified}
              />
            ))}
          </div>
        </FormField>

        {otpVerified && (
          <div className="auth-verified-section">
            <FormField label="Password Baru">
              <TextInput
                type={showPw ? 'text' : 'password'}
                placeholder="Minimal 6 karakter"
                value={passwords.new_password}
                onChange={event => setPasswords(current => ({ ...current, new_password: event.target.value }))}
                required
                minLength={6}
                right={passwordToggle(showPw, () => setShowPw(!showPw), showPw ? 'Sembunyikan password' : 'Tampilkan password')}
              />
            </FormField>

            <FormField label="Konfirmasi Password">
              <TextInput
                type={showConfirmPw ? 'text' : 'password'}
                placeholder="Ulangi password baru"
                value={passwords.confirmPassword}
                onChange={event => setPasswords(current => ({ ...current, confirmPassword: event.target.value }))}
                required
                minLength={6}
                right={passwordToggle(showConfirmPw, () => setShowConfirmPw(!showConfirmPw), showConfirmPw ? 'Sembunyikan konfirmasi password' : 'Tampilkan konfirmasi password', <Lock size={16} />)}
              />
            </FormField>
          </div>
        )}

        <Button type="submit" full disabled={loading} className="min-h-[50px]">
          {loading ? (
            <>
              <span className="btn-spinner" /> {otpVerified ? 'Mereset...' : 'Memverifikasi...'}
            </>
          ) : otpVerified ? 'Reset Password' : 'Verifikasi Kode Reset'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
