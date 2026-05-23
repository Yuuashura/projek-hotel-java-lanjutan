import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
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
    <div style={{ minHeight: '100vh', background: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '2.2rem', color: 'var(--color-text)', letterSpacing: '1px' }}>
              NgiNep<span style={{ color: 'var(--color-primary)' }}>.</span>
            </div>
          </Link>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.8rem', marginTop: '1.5rem', marginBottom: '0.25rem', color: 'var(--color-text)' }}>Masuk ke Akun Anda</h1>
          <p style={{ color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.9rem' }}>Belum punya akun? <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 400, textDecoration: 'none' }}>Daftar sekarang</Link></p>
        </div>

        <div className="card" style={{ padding: '2.5rem 2.5rem', border: '1px solid var(--color-accent)', boxShadow: 'var(--shadow-float)' }}>
          {/* Error Alert */}
          {error && (
            <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', padding: '0.875rem 1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', borderRadius: 'var(--radius-sm)' }}>
              <AlertCircle size={16} style={{ color: '#E53E3E', flexShrink: 0 }} />
              <span style={{ fontWeight: 300, color: '#C53030', fontSize: '0.85rem' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label className="label">Email Address</label>
              <input className="input" style={{ border: 'none', borderBottom: '1px solid var(--color-accent)', background: 'transparent', borderRadius: 0, paddingLeft: 0 }} type="email" placeholder="nama@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input" style={{ border: 'none', borderBottom: '1px solid var(--color-accent)', background: 'transparent', borderRadius: 0, paddingLeft: 0, paddingRight: '2rem' }} type={showPw ? 'text' : 'password'} placeholder="Masukkan password Anda" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ height: 50, marginTop: '0.5rem', background: 'var(--color-primary)', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Memproses...' : 'Masuk Sekarang'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.75rem', marginTop: '1.5rem' }}>
          Dengan masuk, Anda menyetujui <a href="#" style={{ fontWeight: 400, color: 'var(--color-text)' }}>Syarat & Ketentuan</a> NgiNep.
        </p>
      </div>
    </div>
  );
};

export default Login;
