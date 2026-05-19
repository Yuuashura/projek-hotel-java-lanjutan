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
  const [step, setStep] = useState('form'); // 'form' | 'unverified'

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

  if (step === 'unverified') return (
    <div style={{ minHeight: '100vh', background: 'var(--neo-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="card" style={{ maxWidth: 420, width: '100%', padding: '2.5rem', textAlign: 'center' }}>
        <AlertCircle size={48} style={{ color: 'var(--neo-orange)', marginBottom: '1rem' }} />
        <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Akun Belum Diverifikasi</h2>
        <p style={{ color: '#6b7280', fontWeight: 500, lineHeight: 1.6, marginBottom: '1.5rem' }}>Email <strong>{form.email}</strong> sudah terdaftar namun belum diverifikasi. Kirim ulang OTP untuk melanjutkan verifikasi.</p>
        <button onClick={resendOtp} className="btn btn-orange btn-full" disabled={loading}>{loading ? 'Mengirim...' : 'Kirim Ulang OTP'}</button>
        <button onClick={() => setStep('form')} className="btn btn-white btn-full" style={{ marginTop: '0.75rem' }}>Kembali ke Form</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--neo-light)', padding: '3rem 1rem' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'var(--neo-dark)', border: '3px solid var(--neo-dark)', padding: '6px 18px', fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1.6rem', color: 'var(--neo-yellow)', boxShadow: 'var(--neo-shadow)', display: 'inline-block' }}>NgiNep.</div>
          </Link>
          <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1.5rem', textTransform: 'uppercase', marginTop: '1rem', marginBottom: '0.25rem' }}>Buat Akun Baru</h1>
          <p style={{ color: '#374151', fontWeight: 500, fontSize: '0.9rem' }}>Sudah punya akun? <Link to="/login" style={{ color: 'var(--neo-orange)', fontWeight: 700, textDecoration: 'none' }}>Masuk di sini</Link></p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {error && (
            <div style={{ background: '#fff0f3', border: '3px solid var(--neo-pink)', padding: '0.875rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start', boxShadow: '3px 3px 0px 0px var(--neo-pink)' }}>
              <AlertCircle size={18} style={{ color: 'var(--neo-pink)', flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontWeight: 600, color: '#be123c', fontSize: '0.875rem' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="label">Nama Depan *</label>
                <input className="input" placeholder="Budi" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Nama Belakang</label>
                <input className="input" placeholder="Santoso" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="label">Umur *</label>
                <input className="input" type="number" min="17" placeholder="22" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Kota *</label>
                <select className="input" value={form.city_id} onChange={e => setForm(f => ({ ...f, city_id: e.target.value }))} required>
                  <option value="">Pilih Kota</option>
                  {cities.map(c => <option key={c.id_city} value={c.id_city}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="label">No. Telepon *</label>
              <input className="input" type="tel" placeholder="08123456789" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="label">Email *</label>
              <input className="input" type="email" placeholder="nama@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="label">Password *</label>
                <div style={{ position: 'relative' }}>
                  <input className="input" type={showPw ? 'text' : 'password'} placeholder="Min 8 karakter" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} style={{ paddingRight: '3rem' }} />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Konfirmasi Password *</label>
                <input className="input" type="password" placeholder="Ulangi password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} required />
              </div>
            </div>

            <div style={{ background: '#f0fdf4', border: '2px solid #86efac', padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <CheckCircle size={16} style={{ color: '#16a34a', marginTop: 1, flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#166534' }}>
                Setelah mendaftar, kami akan mengirimkan <strong>kode OTP 6 digit</strong> ke email Anda untuk verifikasi akun.
              </p>
            </div>

            <button type="submit" className="btn btn-dark btn-full" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Mendaftarkan...' : <><UserPlus size={16} /> Daftar & Kirim OTP</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
