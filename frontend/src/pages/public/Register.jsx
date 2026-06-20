import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import CitySearchSelect from '../../components/CitySearchSelect';
import { useAuth } from '../../context/AuthContext';

const PHONE_PATTERN = /^08\d{0,12}$/;
const PHONE_ERROR = 'Nomor telepon harus diawali 08 dan maksimal 14 digit';

const Register = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      if (user?.role === 'ROLE_ADMIN_HOTEL' || user?.role === 'ROLE_ADMIN_APP') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [token, user, navigate]);

  const [form, setForm] = useState({ first_name: '', last_name: '', age: '', city_id: '', phone: '', email: '', password: '', confirmPassword: '' });
  const [cities, setCities] = useState([]);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('form');

  useEffect(() => {
    api.get('/api/cities').then((r) => setCities(r.data.data || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!PHONE_PATTERN.test(form.phone)) return setError(PHONE_ERROR);
    if (form.password !== form.confirmPassword) return setError('Konfirmasi password tidak cocok!');
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/register', {
        first_name: form.first_name,
        last_name: form.last_name,
        age: parseInt(form.age),
        city_id: parseInt(form.city_id),
        phone: form.phone,
        email: form.email,
        password: form.password
      });
      sessionStorage.setItem('otp_email', form.email);
      navigate(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registrasi gagal';
      if (msg.includes('UNVERIFIED_ACCOUNT')) {
        setStep('unverified');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    try {
      await api.post('/api/auth/resend-otp', { email: form.email });
      sessionStorage.setItem('otp_email', form.email);
      navigate(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim ulang OTP');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'unverified') {
    return (
      <div className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,rgba(122,183,240,0.1),rgba(122,183,240,0)_42%),linear-gradient(160deg,rgba(246,211,101,0.06),rgba(246,211,101,0)_50%),var(--background-luxury)] px-5 pb-8 pt-[5.5rem] max-sm:min-h-dvh max-sm:place-items-start max-sm:p-4">
        <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--color-text)] shadow-[var(--shadow-float)] backdrop-blur-xl transition-all duration-300 relative overflow-hidden border-[var(--glass-border)] !bg-[var(--glass-bg-strong)] p-[2.35rem] shadow-[0_24px_70px_-28px_rgba(0,0,0,0.78)] max-sm:!p-4 [&_.input]:min-h-12 [&_.input]:font-medium [&_.label]:font-bold [&_.label]:text-[var(--color-text)] mx-auto w-full max-w-[430px] px-8 py-12 max-sm:!p-4 [text-align:center]">
          <AlertCircle size={48} className="[color:var(--color-primary)] [margin-bottom:1.5rem]" />
          <h2 className="[font-family:var(--font-heading)] [font-weight:300] [font-size:1.8rem] [margin-bottom:0.75rem]">Akun Belum Diverifikasi</h2>
          {error &&
          <div className="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger)] [padding:0.875rem_1rem] [margin-bottom:1.5rem] [display:flex] [gap:0.5rem] [align-items:center] [border-radius:var(--radius-sm)]">
              <AlertCircle size={16} className="[color:var(--color-danger)] [flex-shrink:0]" />
              <span className="[font-weight:300] [color:var(--color-danger)] [font-size:0.85rem] [text-align:left]">{error}</span>
            </div>
          }
          <p className="[color:var(--color-muted)] [font-weight:300] [line-height:1.6] [margin-bottom:2rem] [font-size:0.9rem]">
            Email <strong>{form.email}</strong> sudah terdaftar namun belum diverifikasi. Kirim ulang OTP untuk melanjutkan verifikasi.
          </p>
          <button onClick={resendOtp} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[color-mix(in_srgb,var(--color-primary)_46%,transparent)] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))] text-[#061426] hover:brightness-105 w-full [background:var(--color-primary)] [height:48px]" disabled={loading}>{loading ? 'Mengirim...' : 'Kirim Ulang OTP'}</button>
          <button onClick={() => setStep('form')} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--color-text)] backdrop-blur-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-background)] w-full [margin-top:0.75rem] [height:48px]">Kembali ke Form</button>
        </div>
      </div>);

  }

  return (
    <div className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,rgba(122,183,240,0.1),rgba(122,183,240,0)_42%),linear-gradient(160deg,rgba(246,211,101,0.06),rgba(246,211,101,0)_50%),var(--background-luxury)] px-5 pb-8 pt-[5.5rem] max-sm:min-h-dvh max-sm:place-items-start max-sm:p-4 items-start">
      <div className="w-full max-w-[460px] max-w-[600px] animate-[fadeInUp_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards]">
        <div className="mb-7 border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-4 text-center shadow-[0_16px_35px_-30px_rgba(26,54,93,0.5)] backdrop-blur-xl max-sm:mb-4 max-sm:px-2.5 max-sm:py-3">
          <Link to="/" className="[text-decoration:none]">
            <div className="font-[var(--font-heading)] text-[2.6rem] font-medium leading-none text-[var(--color-text)] max-sm:text-[2rem]">
              NgiNep<span className="[color:var(--color-primary)]">.</span>
            </div>
          </Link>
          <h1>Buat Akun Baru</h1>
          <p>Sudah punya akun? <Link to="/login">Masuk di sini</Link></p>
        </div>

        <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--color-text)] shadow-[var(--shadow-float)] backdrop-blur-xl transition-all duration-300 relative overflow-hidden border-[var(--glass-border)] !bg-[var(--glass-bg-strong)] p-[2.35rem] shadow-[0_24px_70px_-28px_rgba(0,0,0,0.78)] max-sm:!p-4 [&_.input]:min-h-12 [&_.input]:font-medium [&_.label]:font-bold [&_.label]:text-[var(--color-text)]">
          {/* Card Top Accent Line */}
          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--color-primary),var(--color-gold))]" />

          {error &&
          <div className="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger)] [padding:0.875rem_1rem] [margin-bottom:1.5rem] [display:flex] [gap:0.5rem] [align-items:center] [border-radius:var(--radius-sm)]">
              <AlertCircle size={16} className="[color:var(--color-danger)] [flex-shrink:0]" />
              <span className="[font-weight:300] [color:var(--color-danger)] [font-size:0.85rem]">{error}</span>
            </div>
          }

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-[1.1rem] max-[620px]:grid-cols-1">
              <div className="mb-5">
                <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">Nama Depan *</label>
                <input className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm" placeholder="Nama Depan" value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} required />
              </div>
              <div className="mb-5">
                <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">Nama Belakang</label>
                <input className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm" placeholder="Nama Belakang" value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[1.1rem] max-[620px]:grid-cols-1">
              <div className="mb-5">
                <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">Umur *</label>
                <input className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm" type="number" min="17" placeholder="25" value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))} required />
              </div>
              <div className="mb-5">
                <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">Kota *</label>
                <CitySearchSelect
                  cities={cities}
                  value={form.city_id}
                  onChange={(val) => setForm((f) => ({ ...f, city_id: val }))}
                  placeholder="Pilih Kota" />

              </div>
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">No. Telepon *</label>
              <input className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm" type="tel" inputMode="numeric" maxLength={14} pattern="^08[0-9]{0,12}$" title={PHONE_ERROR} placeholder="08123456789" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 14) }))} required />
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">Email *</label>
              <input className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm" type="email" placeholder="nama@email.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
            </div>

            <div className="grid grid-cols-2 gap-[1.1rem] max-[620px]:grid-cols-1 mb-3">
              <div className="mb-5">
                <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">Password *</label>
                <div className="[position:relative]">
                  <input className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm [padding-right:2.5rem]" type={showPw ? 'text' : 'password'} placeholder="Min 8 karakter" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required minLength={8} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="[position:absolute] [right:0.875rem] [top:50%] [transform:translateY(-50%)] [background:none] [border:none] [cursor:pointer] [color:var(--color-muted)]">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="mb-5">
                <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">Konfirmasi Password *</label>
                <input className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm" type="password" placeholder="Ulangi password" value={form.confirmPassword} onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))} required />
              </div>
            </div>

            <div className="rounded-lg border border-[var(--color-success-border)] bg-[var(--color-success-soft)] text-[var(--color-success)] [padding:0.875rem_1rem] [margin-bottom:2rem] [display:flex] [gap:0.5rem] [align-items:center] [border-radius:var(--radius-sm)]">
              <CheckCircle size={16} className="[color:var(--color-success)] [flex-shrink:0]" />
              <p className="[margin:0] [font-size:0.8rem] [font-weight:300] [color:var(--color-success)]">
                Setelah mendaftar, kami akan mengirimkan <strong>kode OTP 6 digit</strong> ke email Anda untuk verifikasi akun.
              </p>
            </div>

            <button type="submit" className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[color-mix(in_srgb,var(--color-primary)_46%,transparent)] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))] text-[#061426] hover:brightness-105 w-full h-[50px] bg-[var(--color-primary)] disabled:opacity-70" disabled={loading}>
              {loading ? <><span className="size-[15px] animate-[spin_0.75s_linear_infinite] rounded-full border-2 border-white/40 border-t-white" /> Mendaftarkan...</> : 'Daftar & Kirim OTP'}
            </button>
          </form>
        </div>
      </div>
    </div>);

};

export default Register;
