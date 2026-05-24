import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '../../utils/api';
import CitySearchSelect from '../../components/CitySearchSelect';
import { useAuth } from '../../context/AuthContext';

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
    api.get('/api/cities').then(r => setCities(r.data.data || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        password: form.password,
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
        <div className="card auth-card auth-card-compact" style={{ textAlign: 'center' }}>
          <AlertCircle size={48} style={{ color: 'var(--color-primary)', marginBottom: '1.5rem' }} />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.8rem', marginBottom: '0.75rem' }}>Akun Belum Diverifikasi</h2>
          {error && (
            <div className="alert-danger" style={{ padding: '0.875rem 1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', borderRadius: 'var(--radius-sm)' }}>
              <AlertCircle size={16} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
              <span style={{ fontWeight: 300, color: 'var(--color-danger)', fontSize: '0.85rem', textAlign: 'left' }}>{error}</span>
            </div>
          )}
          <p style={{ color: 'var(--color-muted)', fontWeight: 300, lineHeight: 1.6, marginBottom: '2rem', fontSize: '0.9rem' }}>
            Email <strong>{form.email}</strong> sudah terdaftar namun belum diverifikasi. Kirim ulang OTP untuk melanjutkan verifikasi.
          </p>
          <button onClick={resendOtp} className="btn btn-primary btn-full" disabled={loading} style={{ background: 'var(--color-primary)', height: 48 }}>{loading ? 'Mengirim...' : 'Kirim Ulang OTP'}</button>
          <button onClick={() => setStep('form')} className="btn btn-white btn-full" style={{ marginTop: '0.75rem', height: 48 }}>Kembali ke Form</button>
          <Link to="/" className="btn btn-white btn-full" style={{ marginTop: '0.75rem', height: 48 }}>
            <ArrowLeft size={14} /> Kembali ke Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page auth-page-scroll">
      <div className="auth-shell auth-shell-wide animate-slide-in">
        <Link to="/" className="btn btn-white btn-sm auth-back-link">
          <ArrowLeft size={14} /> Kembali ke Home
        </Link>

        <div className="auth-header">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div className="auth-brand">
              NgiNep<span style={{ color: 'var(--color-primary)' }}>.</span>
            </div>
          </Link>
          <h1>Buat Akun Baru</h1>
          <p>Sudah punya akun? <Link to="/login">Masuk di sini</Link></p>
        </div>

        <div className="card auth-card">
          {/* Card Top Accent Line */}
          <div className="auth-card-accent" />

          {error && (
            <div className="alert-danger" style={{ padding: '0.875rem 1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', borderRadius: 'var(--radius-sm)' }}>
              <AlertCircle size={16} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
              <span style={{ fontWeight: 300, color: 'var(--color-danger)', fontSize: '0.85rem' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-grid-2">
              <div className="auth-field">
                <label className="label">Nama Depan *</label>
                <input className="input" placeholder="Budi" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required />
              </div>
              <div className="auth-field">
                <label className="label">Nama Belakang</label>
                <input className="input" placeholder="Santoso" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
              </div>
            </div>

            <div className="auth-grid-2">
              <div className="auth-field">
                <label className="label">Umur *</label>
                <input className="input" type="number" min="17" placeholder="22" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} required />
              </div>
              <div className="auth-field">
                <label className="label">Kota *</label>
                <CitySearchSelect
                  cities={cities}
                  value={form.city_id}
                  onChange={val => setForm(f => ({ ...f, city_id: val }))}
                  placeholder="Pilih Kota"
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="label">No. Telepon *</label>
              <input className="input" type="tel" placeholder="08123456789" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
            </div>

            <div className="auth-field">
              <label className="label">Email *</label>
              <input className="input" type="email" placeholder="nama@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>

            <div className="auth-grid-2 auth-grid-last">
              <div className="auth-field">
                <label className="label">Password *</label>
                <div style={{ position: 'relative' }}>
                  <input className="input" style={{ paddingRight: '2.5rem' }} type={showPw ? 'text' : 'password'} placeholder="Min 8 karakter" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={8} />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="auth-field">
                <label className="label">Konfirmasi Password *</label>
                <input className="input" type="password" placeholder="Ulangi password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} required />
              </div>
            </div>

            <div className="alert-success" style={{ padding: '0.875rem 1rem', marginBottom: '2rem', display: 'flex', gap: '0.5rem', alignItems: 'center', borderRadius: 'var(--radius-sm)' }}>
              <CheckCircle size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 300, color: 'var(--color-success)' }}>
                Setelah mendaftar, kami akan mengirimkan <strong>kode OTP 6 digit</strong> ke email Anda untuk verifikasi akun.
              </p>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ height: 50, background: 'var(--color-primary)', opacity: loading ? 0.7 : 1 }}>
              {loading ? <><span className="btn-spinner" /> Mendaftarkan...</> : 'Daftar & Kirim OTP'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
