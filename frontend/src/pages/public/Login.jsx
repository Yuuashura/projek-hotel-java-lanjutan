import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
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
      // Simpan token dulu agar request berikutnya bisa auth
      localStorage.setItem('token', data.token);
      // Fetch profil lengkap dari /api/users/me untuk dapat age, city_id, phone, dll.
      let userData;
      try {
        const profileRes = await api.get('/api/users/me', {
          headers: { Authorization: `Bearer ${data.token}` }
        });
        userData = profileRes.data;
      } catch {
        // Fallback ke data login response jika gagal fetch profil
        userData = {
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          role: data.role
        };
      }
      login(data.token, userData);
      // Redirect berdasarkan role
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
    <div style={{ minHeight: '100vh', background: 'var(--neo-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>
      {/* Decorative */}
      <div style={{ position: 'absolute', top: 40, left: 40, width: 80, height: 80, border: '4px solid var(--neo-dark)', background: 'var(--neo-orange)', opacity: 0.3 }} />
      <div style={{ position: 'absolute', bottom: 60, right: 80, width: 120, height: 120, border: '4px solid var(--neo-dark)', background: 'var(--neo-purple)', opacity: 0.2, transform: 'rotate(20deg)' }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'var(--neo-dark)', border: '3px solid var(--neo-dark)', padding: '6px 18px', fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1.6rem', color: 'var(--neo-yellow)', boxShadow: 'var(--neo-shadow)', display: 'inline-block' }}>NgiNep.</div>
          </Link>
          <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1.5rem', textTransform: 'uppercase', marginTop: '1rem', marginBottom: '0.25rem' }}>Masuk ke Akun Anda</h1>
          <p style={{ color: '#374151', fontWeight: 500, fontSize: '0.9rem' }}>Belum punya akun? <Link to="/register" style={{ color: 'var(--neo-orange)', fontWeight: 700, textDecoration: 'none' }}>Daftar sekarang</Link></p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {/* Error Alert */}
          {error && (
            <div style={{ background: '#fff0f3', border: '3px solid var(--neo-pink)', padding: '0.875rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start', boxShadow: '3px 3px 0px 0px var(--neo-pink)' }}>
              <AlertCircle size={18} style={{ color: 'var(--neo-pink)', flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontWeight: 600, color: '#be123c', fontSize: '0.875rem' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="nama@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPw ? 'text' : 'password'} placeholder="Masukkan password Anda" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required style={{ paddingRight: '3rem' }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-dark btn-full" disabled={loading} style={{ marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Memproses...' : <><LogIn size={16} /> Masuk Sekarang</>}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: '#374151', fontWeight: 500, fontSize: '0.8rem', marginTop: '1.5rem' }}>
          Dengan masuk, Anda menyetujui <a href="#" style={{ fontWeight: 700, color: 'var(--neo-dark)' }}>Syarat & Ketentuan</a> NgiNep.
        </p>
      </div>
    </div>
  );
};

export default Login;
