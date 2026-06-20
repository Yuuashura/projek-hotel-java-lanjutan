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
    <div className="auth-page">
      <div className="auth-shell animate-slide-in">
        {/* Logo */}
        <div className="auth-header">
          <Link to="/" className="[text-decoration:none]">
            <div className="auth-brand">
              NgiNep<span className="[color:var(--color-primary)]">.</span>
            </div>
          </Link>
          <h1>Masuk ke Akun Anda</h1>
          <p>Belum punya akun? <Link to="/register">Daftar sekarang</Link></p>
        </div>

        <div className="card auth-card">
          {/* Card Top Accent Line */}
          <div className="auth-card-accent" />

          {/* Error Alert */}
          {error &&
          <div className="alert-danger [padding:0.875rem_1rem] [margin-bottom:1.5rem] [display:flex] [gap:0.5rem] [align-items:center] [border-radius:var(--radius-sm)]">
              <AlertCircle size={16} className="[color:var(--color-danger)] [flex-shrink:0]" />
              <span className="[font-weight:300] [color:var(--color-danger)] [font-size:0.85rem]">{error}</span>
            </div>
          }

          <form onSubmit={handleSubmit} className="[display:flex] [flex-direction:column] [gap:1.5rem]">
            <div className="auth-field">
              <label className="label">Alamat Email</label>
              <input className="input" type="email" placeholder="nama@email.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="auth-field">
              <label className="label">Password</label>
              <div className="[position:relative]">
                <input className="input [padding-right:2.5rem]" type={showPw ? 'text' : 'password'} placeholder="Masukkan password Anda" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />
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

            <button type="submit" className="btn btn-primary btn-full mt-2 h-[50px] bg-[var(--color-primary)] disabled:opacity-70" disabled={loading}>
              {loading ? <><span className="btn-spinner" /> Memproses...</> : 'Masuk Sekarang'}
            </button>
          </form>
        </div>

        <p className="auth-footnote">
          Dengan masuk, Anda menyetujui <a href="#">Syarat & Ketentuan</a> NgiNep.
        </p>
      </div>
    </div>);

};

export default Login;
