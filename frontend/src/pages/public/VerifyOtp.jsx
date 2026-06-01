import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MailCheck, RefreshCw } from 'lucide-react';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
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
  const [timeLeft, setTimeLeft] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) navigate('/register');
  }, [email, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return undefined;
    }

    const timer = setTimeout(() => setTimeLeft(left => left - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    const paste = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    setOtp([...paste, ...Array(6 - paste.length).fill('')]);
    inputRefs.current[Math.min(paste.length, 5)]?.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const code = otp.join('');

    if (code.length < 6) {
      setError('Masukkan 6 digit kode OTP');
      return;
    }

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
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-5 py-10 sm:px-8">
      <section className="w-full max-w-[420px] animate-slide-in">
        <header className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-soft)]">
            <MailCheck size={32} className="text-[var(--color-primary)]" />
          </div>
          <h1 className="mb-2 font-[var(--font-heading)] text-3xl font-light text-[var(--color-text)]">
            Verifikasi Email
          </h1>
          <p className="text-sm font-light text-[var(--color-muted)]">
            Kode OTP 6 digit telah dikirim ke{' '}
            <strong className="font-normal text-[var(--color-text)]">{email}</strong>
          </p>
        </header>

        <Card className="px-5 py-8 sm:px-8 sm:py-10">
          {error && <Alert type="danger">{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <div className="mb-8 flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={element => inputRefs.current[index] = element}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={event => handleChange(index, event.target.value)}
                  onKeyDown={event => handleKeyDown(index, event)}
                  onPaste={handlePaste}
                  className="h-14 w-11 border-0 border-b bg-transparent text-center font-[var(--font-body)] text-2xl font-light text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] sm:w-12"
                  style={{
                    borderBottomColor: digit ? 'var(--color-primary)' : 'var(--color-muted)',
                    borderBottomWidth: digit ? 2 : 1,
                  }}
                  aria-label={`Digit OTP ${index + 1}`}
                />
              ))}
            </div>

            <div className="mb-6 text-center">
              {!canResend ? (
                <p className="text-xs font-light text-[var(--color-muted)]">
                  OTP kadaluarsa dalam{' '}
                  <span className={timeLeft < 60 ? 'font-normal text-[var(--color-danger)]' : 'font-normal text-[var(--color-primary)]'}>
                    {formatTime(timeLeft)}
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="inline-flex items-center gap-2 border-0 bg-transparent font-[var(--font-body)] text-sm font-normal text-[var(--color-primary)] underline underline-offset-4 transition hover:text-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw size={13} className={resendLoading ? 'animate-spin' : ''} />
                  {resendLoading ? 'Mengirim...' : 'Kirim Ulang OTP'}
                </button>
              )}
            </div>

            <Button type="submit" full disabled={loading || otp.join('').length < 6} className="min-h-[50px]">
              {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/register"
              className="font-[var(--font-body)] text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)] no-underline transition hover:text-[var(--color-primary)]"
            >
              Kembali ke Register
            </Link>
          </div>
        </Card>
      </section>
    </main>
  );
};

export default VerifyOtp;
