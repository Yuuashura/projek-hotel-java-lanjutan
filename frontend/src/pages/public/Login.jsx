import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

const Login = () => {
  const { login, token, user } = useAuth();
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
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/login', form);
      const data = res.data;
      localStorage.setItem('token', data.token);
      let userData;
      try {
        const profileRes = await api.get('/api/users/me', {
          headers: { Authorization: `Bearer ${data.token}` }
        });
        userData = profileRes.data;
      } catch {
        userData = {
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          role: data.role
        };
      }
      sessionStorage.setItem('ngninep-flash', JSON.stringify({ type: 'success', key: 'flash.loginSuccess' }));
      login(data.token, userData);
      if (userData.role === 'ROLE_ADMIN_HOTEL' || userData.role === 'ROLE_ADMIN_APP') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Email atau password salah';
      if (msg.includes('UNVERIFIED_ACCOUNT')) {
        navigate(`/verify-otp?email=${form.email}`);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,rgba(122,183,240,0.1),rgba(122,183,240,0)_42%),linear-gradient(160deg,rgba(246,211,101,0.06),rgba(246,211,101,0)_50%),var(--background-luxury)] px-5 pb-8 pt-[5.5rem] max-sm:min-h-dvh max-sm:place-items-start max-sm:p-4">
      <div className="w-full max-w-[460px] animate-[fadeInUp_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards]">
        {/* Logo */}
        <div className="mb-7 border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-4 text-center shadow-[0_16px_35px_-30px_rgba(26,54,93,0.5)] backdrop-blur-xl max-sm:mb-4 max-sm:px-2.5 max-sm:py-3">
          <Link to="/" className="[text-decoration:none]">
            <div className="font-[var(--font-heading)] text-[2.6rem] font-medium leading-none text-[var(--color-text)] max-sm:text-[2rem]">
              NgiNep<span className="[color:var(--color-primary)]">.</span>
            </div>
          </Link>
          <h1>Masuk ke Akun Anda</h1>
          <p>Belum punya akun? <Link to="/register">Daftar sekarang</Link></p>
        </div>

        <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--color-text)] shadow-[var(--shadow-float)] backdrop-blur-xl transition-all duration-300 relative overflow-hidden border-[var(--glass-border)] !bg-[var(--glass-bg-strong)] p-[2.35rem] shadow-[0_24px_70px_-28px_rgba(0,0,0,0.78)] max-sm:!p-4 [&_.input]:min-h-12 [&_.input]:font-medium [&_.label]:font-bold [&_.label]:text-[var(--color-text)]">
          {/* Card Top Accent Line */}
          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--color-primary),var(--color-gold))]" />

          {/* Error Alert */}
          {error &&
          <div className="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger)] [padding:0.875rem_1rem] [margin-bottom:1.5rem] [display:flex] [gap:0.5rem] [align-items:center] [border-radius:var(--radius-sm)]">
              <AlertCircle size={16} className="[color:var(--color-danger)] [flex-shrink:0]" />
              <span className="[font-weight:300] [color:var(--color-danger)] [font-size:0.85rem]">{error}</span>
            </div>
          }

          <form onSubmit={handleSubmit} className="[display:flex] [flex-direction:column] [gap:1.5rem]">
            <div className="mb-5">
              <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">Alamat Email</label>
              <input className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm" type="email" placeholder="nama@email.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="mb-5">
              <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">Password</label>
              <div className="[position:relative]">
                <input className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm [padding-right:2.5rem]" type={showPw ? 'text' : 'password'} placeholder="Masukkan password Anda" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="[position:absolute] [right:0.875rem] [top:50%] [transform:translateY(-50%)] [background:none] [border:none] [cursor:pointer] [color:var(--color-muted)]">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="[text-align:right] [margin-top:0.65rem]">
                <Link to="/forgot-password" className="[color:var(--color-primary)] [font-weight:700] [font-size:0.82rem] [text-decoration:none]">
                  Lupa Password?
                </Link>
              </div>
            </div>

            <button type="submit" className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[color-mix(in_srgb,var(--color-primary)_46%,transparent)] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))] text-[#061426] hover:brightness-105 w-full mt-2 h-[50px] bg-[var(--color-primary)] disabled:opacity-70" disabled={loading}>
              {loading ? <><span className="size-[15px] animate-[spin_0.75s_linear_infinite] rounded-full border-2 border-white/40 border-t-white" /> Memproses...</> : 'Masuk Sekarang'}
            </button>
          </form>
        </div>

        <p className="mt-5 border border-[var(--color-accent)] bg-[var(--glass-bg)] px-4 py-3 text-center text-[0.78rem] font-medium leading-relaxed text-[var(--color-muted)] [&_a]:font-bold [&_a]:text-[var(--color-primary)]">
          Dengan masuk, Anda menyetujui <a href="#">Syarat & Ketentuan</a> NgiNep.
        </p>
      </div>
    </div>);

};

export default Login;
