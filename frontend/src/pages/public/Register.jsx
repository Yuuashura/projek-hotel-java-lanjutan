import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthFrame from '../../components/auth/AuthFrame';
import AlertMessage from '../../components/auth/AlertMessage';
import PasswordField from '../../components/auth/PasswordField';
import CitySearchSelect from '../../components/CitySearchSelect';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const Register = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: '', last_name: '', age: '', city_id: '', phone: '', email: '', password: '', confirmPassword: '' });
  const [cities, setCities] = useState([]);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('form');

  useEffect(() => {
    if (!token) return;
    navigate(user?.role === 'ROLE_ADMIN_HOTEL' || user?.role === 'ROLE_ADMIN_APP' ? '/admin/dashboard' : '/');
  }, [token, user, navigate]);

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
      <AuthFrame title="Akun Belum Diverifikasi" subtitle="Kirim ulang OTP untuk melanjutkan verifikasi." centerOnly>
        <AlertCircle size={48} className="mx-auto mb-5 text-[var(--color-primary)]" />
        <AlertMessage tone="danger" className="text-left">{error}</AlertMessage>
        <p className="mb-7 text-sm leading-6 text-[var(--color-muted)]">
          Email <strong>{form.email}</strong> sudah terdaftar namun belum diverifikasi.
        </p>
        <div className="grid gap-3">
          <Button type="button" full disabled={loading} onClick={resendOtp} className="min-h-12">
            {loading ? 'Mengirim...' : 'Kirim Ulang OTP'}
          </Button>
          <Button type="button" full variant="secondary" onClick={() => setStep('form')} className="min-h-12">
            Kembali ke Form
          </Button>
        </div>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame
      title="Buat Akun Baru"
      subtitle={<>Sudah punya akun? <Link className="font-bold text-[var(--color-primary)]" to="/login">Masuk di sini</Link></>}
      wide
    >
      <AlertMessage tone="danger">{error}</AlertMessage>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="label">Nama Depan *</label>
            <Input placeholder="Afi Naufal" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <label className="label">Nama Belakang</label>
            <Input placeholder="Riski Yang" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="label">Umur *</label>
            <Input type="number" min="17" placeholder="25" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <label className="label">Kota *</label>
            <CitySearchSelect cities={cities} value={form.city_id} onChange={val => setForm(f => ({ ...f, city_id: val }))} placeholder="Pilih Kota" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="label">No. Telepon *</label>
          <Input type="tel" placeholder="08123456789" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
        </div>

        <div className="space-y-2">
          <label className="label">Email *</label>
          <Input type="email" placeholder="nama@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <PasswordField
            label="Password *"
            show={showPw}
            onToggleShow={() => setShowPw(current => !current)}
            placeholder="Min 8 karakter"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required
            minLength={8}
          />
          <div className="space-y-2">
            <label className="label">Konfirmasi Password *</label>
            <Input type="password" placeholder="Ulangi password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} required />
          </div>
        </div>

        <div className="flex gap-2 rounded-[var(--radius-sm)] border border-[var(--color-success-border)] bg-[var(--color-success-soft)] px-4 py-3 text-sm font-medium text-[var(--color-success)]">
          <CheckCircle size={16} className="mt-0.5 shrink-0" />
          <p className="m-0 leading-6">
            Setelah mendaftar, kami akan mengirimkan <strong>kode OTP 6 digit</strong> ke email Anda untuk verifikasi akun.
          </p>
        </div>

        <Button type="submit" full disabled={loading} className="min-h-12">
          {loading ? <><span className="btn-spinner" /> Mendaftarkan...</> : 'Daftar & Kirim OTP'}
        </Button>
      </form>
    </AuthFrame>
  );
};

export default Register;
