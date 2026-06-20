import { useEffect, useRef, useState } from 'react';
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
          otp_code: code
        });
        setVerifiedCode(code);
        setOtpVerified(true);
        setSuccess(res.data?.message || 'Kode reset valid. Silakan buat password baru.');
        return;
      }

      const res = await api.post('/api/auth/reset-password', {
        email,
        otp_code: verifiedCode,
        new_password: passwords.new_password
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
    <div className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,rgba(122,183,240,0.1),rgba(122,183,240,0)_42%),linear-gradient(160deg,rgba(246,211,101,0.06),rgba(246,211,101,0)_50%),var(--background-luxury)] px-5 pb-8 pt-[5.5rem] max-sm:min-h-dvh max-sm:place-items-start max-sm:p-4 items-start">
      <div className="w-full max-w-[460px] animate-[fadeInUp_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards]">
        <div className="mb-7 border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-4 text-center shadow-[0_16px_35px_-30px_rgba(26,54,93,0.5)] backdrop-blur-xl max-sm:mb-4 max-sm:px-2.5 max-sm:py-3">
          <Link to="/" className="[text-decoration:none]">
            <div className="font-[var(--font-heading)] text-[2.6rem] font-medium leading-none text-[var(--color-text)] max-sm:text-[2rem]">
              NgiNep<span className="[color:var(--color-primary)]">.</span>
            </div>
          </Link>
          <h1>Reset Password</h1>
          <p>{otpVerified ? 'Kode valid. Buat password baru Anda.' : 'Masukkan kode OTP reset password terlebih dahulu.'}</p>
        </div>

        <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--color-text)] shadow-[var(--shadow-float)] backdrop-blur-xl transition-all duration-300 relative overflow-hidden border-[var(--glass-border)] !bg-[var(--glass-bg-strong)] p-[2.35rem] shadow-[0_24px_70px_-28px_rgba(0,0,0,0.78)] max-sm:!p-4 [&_.input]:min-h-12 [&_.input]:font-medium [&_.label]:font-bold [&_.label]:text-[var(--color-text)]">
          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--color-primary),var(--color-gold))]" />

          {error &&
          <div className="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger)] [padding:0.875rem_1rem] [margin-bottom:1.5rem] [display:flex] [gap:0.5rem] [align-items:center] [border-radius:var(--radius-sm)]">
              <AlertCircle size={16} className="[color:var(--color-danger)] [flex-shrink:0]" />
              <span className="[font-weight:300] [color:var(--color-danger)] [font-size:0.85rem]">{error}</span>
            </div>
          }

          {success &&
          <div className="rounded-lg border border-[var(--color-success-border)] bg-[var(--color-success-soft)] text-[var(--color-success)] [padding:0.875rem_1rem] [margin-bottom:1.5rem] [display:flex] [gap:0.5rem] [align-items:center] [border-radius:var(--radius-sm)]">
              <CheckCircle size={16} className="[color:var(--color-success)] [flex-shrink:0]" />
              <span className="[font-weight:300] [color:var(--color-success)] [font-size:0.85rem]">{success}</span>
            </div>
          }

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">Alamat Email</label>
              <input className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm" type="email" placeholder="nama@email.com" value={email} required disabled readOnly />
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">Kode Reset</label>
              <div className="flex justify-center gap-2 max-sm:gap-1.5">
                {otp.map((digit, index) =>
                <input
                  key={index}
                  ref={(el) => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                  className="h-[54px] w-[46px] rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-center text-xl font-semibold text-[var(--color-text)] outline-none transition focus:-translate-y-px focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:h-12 max-sm:w-10 max-sm:text-lg max-[380px]:h-11 max-[380px]:w-9"
                  aria-label={`Digit OTP ${index + 1}`}
                  disabled={otpVerified} />

                )}
              </div>
            </div>

            {otpVerified &&
            <div className="animate-[authVerifiedIn_0.28s_ease_both]">
                <div className="mb-5">
                  <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">Password Baru</label>
                  <div className="[position:relative]">
                    <input className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm [padding-right:2.5rem]" type={showPw ? 'text' : 'password'} placeholder="Minimal 6 karakter" value={passwords.new_password} onChange={(e) => setPasswords((p) => ({ ...p, new_password: e.target.value }))} required minLength={6} />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="[position:absolute] [right:0.875rem] [top:50%] [transform:translateY(-50%)] [background:none] [border:none] [cursor:pointer] [color:var(--color-muted)]">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">Konfirmasi Password</label>
                  <div className="[position:relative]">
                    <input className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm [padding-right:2.5rem]" type={showConfirmPw ? 'text' : 'password'} placeholder="Ulangi password baru" value={passwords.confirmPassword} onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))} required minLength={6} />
                    <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="[position:absolute] [right:0.875rem] [top:50%] [transform:translateY(-50%)] [background:none] [border:none] [cursor:pointer] [color:var(--color-muted)]">
                      {showConfirmPw ? <EyeOff size={16} /> : <Lock size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            }

            <button type="submit" className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[color-mix(in_srgb,var(--color-primary)_46%,transparent)] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))] text-[#061426] hover:brightness-105 w-full h-[50px] bg-[var(--color-primary)] disabled:opacity-70" disabled={loading}>
              {loading ? <><span className="size-[15px] animate-[spin_0.75s_linear_infinite] rounded-full border-2 border-white/40 border-t-white" /> {otpVerified ? 'Mereset...' : 'Memverifikasi...'}</> : otpVerified ? 'Reset Password' : 'Verifikasi Kode Reset'}
            </button>
          </form>
        </div>

        <p className="mt-5 border border-[var(--color-accent)] bg-[var(--glass-bg)] px-4 py-3 text-center text-[0.78rem] font-medium leading-relaxed text-[var(--color-muted)] [&_a]:font-bold [&_a]:text-[var(--color-primary)]">
          Belum menerima kode? <Link to="/forgot-password">Kirim ulang kode reset</Link>
        </p>
      </div>
    </div>);

};

export default ResetPassword;
