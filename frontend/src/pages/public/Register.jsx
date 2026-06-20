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
      <div className="auth-page">
        <div className="card auth-card auth-card-compact [text-align:center]">
          <AlertCircle size={48} className="[color:var(--color-primary)] [margin-bottom:1.5rem]" />
          <h2 className="[font-family:var(--font-heading)] [font-weight:300] [font-size:1.8rem] [margin-bottom:0.75rem]">Akun Belum Diverifikasi</h2>
          {error &&
          <div className="alert-danger [padding:0.875rem_1rem] [margin-bottom:1.5rem] [display:flex] [gap:0.5rem] [align-items:center] [border-radius:var(--radius-sm)]">
              <AlertCircle size={16} className="[color:var(--color-danger)] [flex-shrink:0]" />
              <span className="[font-weight:300] [color:var(--color-danger)] [font-size:0.85rem] [text-align:left]">{error}</span>
            </div>
          }
          <p className="[color:var(--color-muted)] [font-weight:300] [line-height:1.6] [margin-bottom:2rem] [font-size:0.9rem]">
            Email <strong>{form.email}</strong> sudah terdaftar namun belum diverifikasi. Kirim ulang OTP untuk melanjutkan verifikasi.
          </p>
          <button onClick={resendOtp} className="btn btn-primary btn-full [background:var(--color-primary)] [height:48px]" disabled={loading}>{loading ? 'Mengirim...' : 'Kirim Ulang OTP'}</button>
          <button onClick={() => setStep('form')} className="btn btn-white btn-full [margin-top:0.75rem] [height:48px]">Kembali ke Form</button>
        </div>
      </div>);

  }

  return (
    <div className="auth-page auth-page-scroll">
      <div className="auth-shell auth-shell-wide animate-slide-in">
        <div className="auth-header">
          <Link to="/" className="[text-decoration:none]">
            <div className="auth-brand">
              NgiNep<span className="[color:var(--color-primary)]">.</span>
            </div>
          </Link>
          <h1>Buat Akun Baru</h1>
          <p>Sudah punya akun? <Link to="/login">Masuk di sini</Link></p>
        </div>

        <div className="card auth-card">
          {/* Card Top Accent Line */}
          <div className="auth-card-accent" />

          {error &&
          <div className="alert-danger [padding:0.875rem_1rem] [margin-bottom:1.5rem] [display:flex] [gap:0.5rem] [align-items:center] [border-radius:var(--radius-sm)]">
              <AlertCircle size={16} className="[color:var(--color-danger)] [flex-shrink:0]" />
              <span className="[font-weight:300] [color:var(--color-danger)] [font-size:0.85rem]">{error}</span>
            </div>
          }

          <form onSubmit={handleSubmit}>
            <div className="auth-grid-2">
              <div className="auth-field">
                <label className="label">Nama Depan *</label>
                <input className="input" placeholder="Nama Depan" value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} required />
              </div>
              <div className="auth-field">
                <label className="label">Nama Belakang</label>
                <input className="input" placeholder="Nama Belakang" value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} />
              </div>
            </div>

            <div className="auth-grid-2">
              <div className="auth-field">
                <label className="label">Umur *</label>
                <input className="input" type="number" min="17" placeholder="25" value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))} required />
              </div>
              <div className="auth-field">
                <label className="label">Kota *</label>
                <CitySearchSelect
                  cities={cities}
                  value={form.city_id}
                  onChange={(val) => setForm((f) => ({ ...f, city_id: val }))}
                  placeholder="Pilih Kota" />
                
              </div>
            </div>

            <div className="auth-field">
              <label className="label">No. Telepon *</label>
              <input className="input" type="tel" inputMode="numeric" maxLength={14} pattern="^08[0-9]{0,12}$" title={PHONE_ERROR} placeholder="08123456789" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 14) }))} required />
            </div>

            <div className="auth-field">
              <label className="label">Email *</label>
              <input className="input" type="email" placeholder="nama@email.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
            </div>

            <div className="auth-grid-2 auth-grid-last">
              <div className="auth-field">
                <label className="label">Password *</label>
                <div className="[position:relative]">
                  <input className="input [padding-right:2.5rem]" type={showPw ? 'text' : 'password'} placeholder="Min 8 karakter" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required minLength={8} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="[position:absolute] [right:0.875rem] [top:50%] [transform:translateY(-50%)] [background:none] [border:none] [cursor:pointer] [color:var(--color-muted)]">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="auth-field">
                <label className="label">Konfirmasi Password *</label>
                <input className="input" type="password" placeholder="Ulangi password" value={form.confirmPassword} onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))} required />
              </div>
            </div>

            <div className="alert-success [padding:0.875rem_1rem] [margin-bottom:2rem] [display:flex] [gap:0.5rem] [align-items:center] [border-radius:var(--radius-sm)]">
              <CheckCircle size={16} className="[color:var(--color-success)] [flex-shrink:0]" />
              <p className="[margin:0] [font-size:0.8rem] [font-weight:300] [color:var(--color-success)]">
                Setelah mendaftar, kami akan mengirimkan <strong>kode OTP 6 digit</strong> ke email Anda untuk verifikasi akun.
              </p>
            </div>

            <button type="submit" className="btn btn-primary btn-full h-[50px] bg-[var(--color-primary)] disabled:opacity-70" disabled={loading}>
              {loading ? <><span className="btn-spinner" /> Mendaftarkan...</> : 'Daftar & Kirim OTP'}
            </button>
          </form>
        </div>
      </div>
    </div>);

};

export default Register;
