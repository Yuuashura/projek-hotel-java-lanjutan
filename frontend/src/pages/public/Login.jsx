import React, { useState, useEffect } from 'react';
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
    <div style={{ minHeight: '100vh', background: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative Glowing Blobs */}
      <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(44, 82, 130, 0.12) 0%, rgba(44, 82, 130, 0) 70%)', top: '-10%', left: '-5%', pointerEvents: 'none', filter: 'blur(50px)' }} />
      <div style={{ position: 'absolute', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(49, 130, 206, 0.08) 0%, rgba(49, 130, 206, 0) 70%)', bottom: '-15%', right: '-5%', pointerEvents: 'none', filter: 'blur(60px)' }} />
      
      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }} className="animate-slide-in">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '2.5rem', color: 'var(--color-text)', letterSpacing: '1px' }}>
              NgiNep<span style={{ color: 'var(--color-primary)' }}>.</span>
            </div>
          </Link>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.8rem', marginTop: '1.25rem', marginBottom: '0.25rem', color: 'var(--color-text)' }}>Masuk ke Akun Anda</h1>
          <p style={{ color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.9rem' }}>Belum punya akun? <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 400, textDecoration: 'none' }}>Daftar sekarang</Link></p>
        </div>

        <div className="card" style={{ padding: '2.5rem 2.5rem', border: '1px solid var(--color-accent)', boxShadow: 'var(--shadow-float)', background: 'var(--color-surface-glass)', backdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden' }}>
          {/* Card Top Accent Line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--color-primary), #3182ce)' }} />

          {/* Error Alert */}
          {error && (
            <div className="alert-danger" style={{ padding: '0.875rem 1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', borderRadius: 'var(--radius-sm)' }}>
              <AlertCircle size={16} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
              <span style={{ fontWeight: 300, color: 'var(--color-danger)', fontSize: '0.85rem' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label className="label">Alamat Email</label>
              <input className="input" type="email" placeholder="nama@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input" style={{ paddingRight: '2.5rem' }} type={showPw ? 'text' : 'password'} placeholder="Masukkan password Anda" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ height: 50, marginTop: '0.5rem', background: 'var(--color-primary)', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Memproses...' : 'Masuk Sekarang'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.75rem', marginTop: '1.5rem' }}>
          Dengan masuk, Anda menyetujui <a href="#" style={{ fontWeight: 400, color: 'var(--color-text)', textDecoration: 'none' }}>Syarat & Ketentuan</a> NgiNep.
        </p>
      </div>
    </div>
  );
};

export default Login;
