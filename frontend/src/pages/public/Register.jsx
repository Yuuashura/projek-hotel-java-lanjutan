import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import api from '../../utils/api';
import CitySearchSelect from '../../components/CitySearchSelect';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { FormField, TextInput } from '../../components/ui/FormField';

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
        <Card className="auth-card auth-card-compact text-center">
          <AlertCircle size={48} className="mx-auto mb-6 text-[var(--color-primary)]" />
          <h2 className="mb-3 font-[var(--font-heading)] text-3xl font-semibold text-[var(--color-text)]">Akun Belum Diverifikasi</h2>
          {error && <Alert type="danger" className="text-left">{error}</Alert>}
          <p className="mb-8 text-sm leading-7 text-[var(--color-muted)]">
            Email <strong>{form.email}</strong> sudah terdaftar namun belum diverifikasi. Kirim ulang OTP untuk melanjutkan verifikasi.
          </p>
          <Button onClick={resendOtp} full disabled={loading} className="min-h-12">{loading ? 'Mengirim...' : 'Kirim Ulang OTP'}</Button>
          <Button onClick={() => setStep('form')} variant="white" full className="mt-3 min-h-12">Kembali ke Form</Button>
        </Card>
      </div>
    );
  }

  return (
    <AuthLayout
      title="Buat Akun Baru"
      subtitle={<>Sudah punya akun? <Link to="/login">Masuk di sini</Link></>}
      wide
      scroll
    >
      {error && <Alert type="danger">{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <div className="auth-grid-2">
          <FormField label="Nama Depan *">
            <TextInput placeholder="Afi Naufal" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required />
          </FormField>
          <FormField label="Nama Belakang">
            <TextInput placeholder="Riski Yang" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
          </FormField>
        </div>

        <div className="auth-grid-2">
          <FormField label="Umur *">
            <TextInput type="number" min="17" placeholder="25" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} required />
          </FormField>
          <FormField label="Kota *">
            <CitySearchSelect
              cities={cities}
              value={form.city_id}
              onChange={val => setForm(f => ({ ...f, city_id: val }))}
              placeholder="Pilih Kota"
            />
          </FormField>
        </div>

        <FormField label="No. Telepon *">
          <TextInput type="tel" placeholder="08123456789" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
        </FormField>

        <FormField label="Email *">
          <TextInput type="email" placeholder="nama@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        </FormField>

        <div className="auth-grid-2 auth-grid-last">
          <FormField label="Password *">
            <TextInput
              type={showPw ? 'text' : 'password'}
              placeholder="Min 8 karakter"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              minLength={8}
              right={(
                <button type="button" onClick={() => setShowPw(!showPw)} className="flex h-9 w-9 items-center justify-center border-0 bg-transparent p-0 text-[var(--color-muted)] transition hover:text-[var(--color-primary)]">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
            />
          </FormField>
          <FormField label="Konfirmasi Password *">
            <TextInput type="password" placeholder="Ulangi password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} required />
          </FormField>
        </div>

        <Alert type="success" className="mb-8">Setelah mendaftar, kami akan mengirimkan <strong>kode OTP 6 digit</strong> ke email Anda untuk verifikasi akun.</Alert>

        <Button type="submit" full disabled={loading} className="min-h-[50px]">
          {loading ? <><span className="btn-spinner" /> Mendaftarkan...</> : 'Daftar & Kirim OTP'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Register;
