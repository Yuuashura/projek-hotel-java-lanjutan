import { useState, useEffect, useRef } from 'react';
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
  }, [email, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) {
      const timer = window.setTimeout(() => setCanResend(true), 0);
      return () => window.clearTimeout(timer);
    }
    const t = setTimeout(() => setTimeLeft((l) => l - 1), 1000);
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
    <div className="[min-height:100vh] [background:var(--color-background)] [display:flex] [align-items:center] [justify-content:center] [padding:2rem]">

      <div className="[width:100%] [max-width:420px]">
        <div className="[text-align:center] [margin-bottom:2.5rem]">
          <div className="[width:64px] [height:64px] [background:rgba(212,175,55,0.1)] [margin:0_auto_1.5rem] [display:flex] [align-items:center] [justify-content:center] [border-radius:50%]">
            <MailCheck size={32} className="[color:var(--color-primary)]" />
          </div>
          <h1 className="[font-family:var(--font-heading)] [font-weight:300] [font-size:2rem] [margin:0_0_0.5rem] [color:var(--color-text)]">Verifikasi Email</h1>
          <p className="[font-weight:300] [color:var(--color-muted)] [font-size:0.9rem]">
            Kode OTP 6 digit telah dikirim ke <strong className="[color:var(--color-text)] [font-weight:400]">{email}</strong>
          </p>
        </div>

        <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--color-text)] shadow-[var(--shadow-float)] backdrop-blur-xl transition-all duration-300 [padding:2.5rem_2rem] [border:1px_solid_var(--color-accent)] [box-shadow:var(--shadow-float)]">
          {error &&
          <div className="[background:#FFF5F5] [border:1px_solid_#FEB2B2] [padding:0.875rem] [margin-bottom:1.5rem] [display:flex] [gap:0.5rem] [align-items:center] [border-radius:var(--radius-sm)]">
              <AlertCircle size={16} className="[color:#E53E3E] [flex-shrink:0]" />
              <span className="[font-weight:300] [color:#C53030] [font-size:0.85rem]">{error}</span>
            </div>
          }
          {success &&
          <div className="[background:rgba(72,187,120,0.05)] [border:1px_solid_rgba(72,187,120,0.2)] [padding:0.875rem] [margin-bottom:1.5rem] [display:flex] [gap:0.5rem] [align-items:center] [border-radius:var(--radius-sm)]">
              <CheckCircle size={16} className="[color:#38A169] [flex-shrink:0]" />
              <span className="[font-weight:300] [color:#276749] [font-size:0.85rem]">{success}</span>
            </div>
          }

          <form onSubmit={handleSubmit}>
            {/* OTP Input Boxes */}
            <div className="[display:flex] [gap:0.5rem] [justify-content:center] [margin-bottom:2rem]">
              {otp.map((digit, i) =>
              <input key={i} ref={(el) => inputRefs.current[i] = el}
              type="text" inputMode="numeric" maxLength={1} value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className={`h-14 w-12 border-0 border-b bg-transparent text-center font-[var(--font-body)] text-2xl font-light text-[var(--color-text)] outline-none transition ${
              digit ? 'border-b-2 border-[var(--color-primary)]' : 'border-[var(--color-muted)]'}`
              } />

              )}
            </div>

            {/* Timer */}
            <div className="[text-align:center] [margin-bottom:1.5rem]">
              {!canResend ?
              <p className="[font-size:0.8rem] [color:var(--color-muted)] [font-weight:300]">
                  OTP kadaluarsa dalam&nbsp;
                  <span className={timeLeft < 60 ? 'font-normal text-[#E53E3E]' : 'font-normal text-[var(--color-primary)]'}>{formatTime(timeLeft)}</span>
                </p> :

              <button type="button" onClick={handleResend} disabled={resendLoading} className="[background:none] [border:none] [cursor:pointer] [color:var(--color-primary)] [font-family:var(--font-body)] [font-weight:400] [font-size:0.85rem] [display:inline-flex] [align-items:center] [gap:0.4rem] [text-decoration:underline]">

                  <RefreshCw size={12} /> {resendLoading ? 'Mengirim...' : 'Kirim Ulang OTP'}
                </button>
              }
            </div>

            <button type="submit" className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[color-mix(in_srgb,var(--color-primary)_46%,transparent)] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))] text-[#061426] hover:brightness-105 w-full h-[50px] bg-[var(--color-primary)] disabled:opacity-65" disabled={loading || otp.join('').length < 6}>
              {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
            </button>
          </form>

          <div className="[text-align:center] [margin-top:1.5rem]">
            <Link to="/register" className="[font-family:var(--font-body)] [font-size:0.8rem] [color:var(--color-muted)] [text-decoration:none] [text-transform:uppercase] [letter-spacing:0.5px]">← Back to Register</Link>
          </div>
        </div>
      </div>
    </div>);

};

export default VerifyOtp;
