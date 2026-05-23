import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../utils/api';

const Register = () => {
  const navigate = useNavigate();
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
      <div style={{ minHeight: '100vh', background: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="card" style={{ maxWidth: 420, width: '100%', padding: '3rem 2rem', textAlign: 'center', border: '1px solid var(--color-accent)', boxShadow: 'var(--shadow-float)' }}>
          <AlertCircle size={48} style={{ color: 'var(--color-primary)', marginBottom: '1.5rem' }} />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.8rem', marginBottom: '0.75rem' }}>Akun Belum Diverifikasi</h2>
          <p style={{ color: 'var(--color-muted)', fontWeight: 300, lineHeight: 1.6, marginBottom: '2rem', fontSize: '0.9rem' }}>
            Email <strong>{form.email}</strong> sudah terdaftar namun belum diverifikasi. Kirim ulang OTP untuk melanjutkan verifikasi.
          </p>
          <button onClick={resendOtp} className="btn btn-primary btn-full" disabled={loading} style={{ background: 'var(--color-primary)', height: 48 }}>{loading ? 'Mengirim...' : 'Kirim Ulang OTP'}</button>
          <button onClick={() => setStep('form')} className="btn btn-white btn-full" style={{ marginTop: '0.75rem', height: 48 }}>Kembali ke Form</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)', padding: '5rem 1rem' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '2.2rem', color: 'var(--color-text)', letterSpacing: '1px' }}>
              NgiNep<span style={{ color: 'var(--color-primary)' }}>.</span>
            </div>
          </Link>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.8rem', marginTop: '1.5rem', marginBottom: '0.25rem', color: 'var(--color-text)' }}>Buat Akun Baru</h1>
          <p style={{ color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.9rem' }}>Sudah punya akun? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 400, textDecoration: 'none' }}>Masuk di sini</Link></p>
        </div>

        <div className="card" style={{ padding: '2.5rem 2.5rem', border: '1px solid var(--color-accent)', boxShadow: 'var(--shadow-float)' }}>
          {error && (
            <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', padding: '0.875rem 1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', borderRadius: 'var(--radius-sm)' }}>
              <AlertCircle size={16} style={{ color: '#E53E3E', flexShrink: 0 }} />
              <span style={{ fontWeight: 300, color: '#C53030', fontSize: '0.85rem' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.25rem' }}>
              <div>
                <label className="label">Nama Depan *</label>
                <input className="input" style={{ border: 'none', borderBottom: '1px solid var(--color-accent)', background: 'transparent', borderRadius: 0, paddingLeft: 0 }} placeholder="Budi" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Nama Belakang</label>
                <input className="input" style={{ border: 'none', borderBottom: '1px solid var(--color-accent)', background: 'transparent', borderRadius: 0, paddingLeft: 0 }} placeholder="Santoso" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.25rem' }}>
              <div>
                <label className="label">Umur *</label>
                <input className="input" style={{ border: 'none', borderBottom: '1px solid var(--color-accent)', background: 'transparent', borderRadius: 0, paddingLeft: 0 }} type="number" min="17" placeholder="22" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Kota *</label>
                <select className="input" style={{ border: 'none', borderBottom: '1px solid var(--color-accent)', background: 'transparent', borderRadius: 0, paddingLeft: 0, color: 'var(--color-text)' }} value={form.city_id} onChange={e => setForm(f => ({ ...f, city_id: e.target.value }))} required>
                  <option value="">Pilih Kota</option>
                  {cities.map(c => <option key={c.id_city} value={c.id_city}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="label">No. Telepon *</label>
              <input className="input" style={{ border: 'none', borderBottom: '1px solid var(--color-accent)', background: 'transparent', borderRadius: 0, paddingLeft: 0 }} type="tel" placeholder="08123456789" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="label">Email *</label>
              <input className="input" style={{ border: 'none', borderBottom: '1px solid var(--color-accent)', background: 'transparent', borderRadius: 0, paddingLeft: 0 }} type="email" placeholder="nama@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <label className="label">Password *</label>
                <div style={{ position: 'relative' }}>
                  <input className="input" style={{ border: 'none', borderBottom: '1px solid var(--color-accent)', background: 'transparent', borderRadius: 0, paddingLeft: 0, paddingRight: '2rem' }} type={showPw ? 'text' : 'password'} placeholder="Min 8 karakter" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={8} />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}>
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Konfirmasi Password *</label>
                <input className="input" style={{ border: 'none', borderBottom: '1px solid var(--color-accent)', background: 'transparent', borderRadius: 0, paddingLeft: 0 }} type="password" placeholder="Ulangi password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} required />
              </div>
            </div>

            <div style={{ background: 'rgba(72,187,120,0.05)', border: '1px solid rgba(72,187,120,0.2)', padding: '0.875rem 1rem', marginBottom: '2rem', display: 'flex', gap: '0.5rem', alignItems: 'center', borderRadius: 'var(--radius-sm)' }}>
              <CheckCircle size={16} style={{ color: '#38A169', flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 300, color: '#276749' }}>
                Setelah mendaftar, kami akan mengirimkan <strong>kode OTP 6 digit</strong> ke email Anda untuk verifikasi akun.
              </p>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ height: 50, background: 'var(--color-primary)', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Mendaftarkan...' : 'Daftar & Kirim OTP'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
