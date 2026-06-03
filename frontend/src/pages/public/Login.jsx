import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarCheck, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthFrame from '../../components/auth/AuthFrame';
import AlertMessage from '../../components/auth/AlertMessage';
import PasswordField from '../../components/auth/PasswordField';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const Login = () => {
  const { login, token, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    navigate(user?.role === 'ROLE_ADMIN_HOTEL' || user?.role === 'ROLE_ADMIN_APP' ? '/admin/dashboard' : '/');
  }, [token, user, navigate]);

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
          headers: { Authorization: `Bearer ${data.token}` },
        });
        userData = profileRes.data;
      } catch {
        userData = {
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          role: data.role,
        };
      }

      sessionStorage.setItem('ngninep-flash', JSON.stringify({ type: 'success', key: 'flash.loginSuccess' }));
      login(data.token, userData);
      navigate(userData.role === 'ROLE_ADMIN_HOTEL' || userData.role === 'ROLE_ADMIN_APP' ? '/admin/dashboard' : '/');
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
    <AuthFrame
      title="Masuk ke Akun Anda"
      subtitle={<>Belum punya akun? <Link className="font-bold text-[var(--color-primary)]" to="/register">Daftar sekarang</Link></>}
      footnote={<>Dengan masuk, Anda menyetujui <a className="font-bold text-[var(--color-primary)]" href="#">Syarat & Ketentuan</a> NgiNep.</>}
    >
      <AlertMessage tone="danger">{error}</AlertMessage>

      <div className="mb-6 rounded-[var(--radius-sm)] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--color-surface)_78%,var(--color-background))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.16)] dark:bg-[rgba(15,23,42,.46)]">
        <div className="flex items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-[color-mix(in_srgb,var(--color-primary)_20%,var(--glass-border))] bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="m-0 text-sm font-extrabold text-[var(--color-text)]">Akses reservasi Anda</p>
            <p className="m-0 mt-1 text-sm leading-6 text-[var(--color-muted)]">
              Masuk untuk melihat booking, pembayaran, dan status pesanan terbaru.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold text-[var(--color-muted)]">
          <div className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--color-background)_70%,transparent)] px-3 py-2 dark:bg-white/5">
            <CalendarCheck size={14} className="text-[var(--color-primary)]" />
            Booking aktif
          </div>
          <div className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--color-background)_70%,transparent)] px-3 py-2 dark:bg-white/5">
            <ShieldCheck size={14} className="text-[var(--color-primary)]" />
            Akun aman
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="space-y-2">
          <label className="label">Alamat Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[var(--color-muted)]" />
            <Input className="pl-11" type="email" placeholder="nama@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
        </div>

        <PasswordField
          label="Password"
          icon={LockKeyhole}
          show={showPw}
          onToggleShow={() => setShowPw(current => !current)}
          placeholder="Masukkan password Anda"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          required
        />

        <div className="-mt-3 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-muted)]">
            <ShieldCheck size={13} /> Login aman
          </span>
          <Link to="/forgot-password" className="text-sm font-bold text-[var(--color-primary)] no-underline">
            Lupa Password?
          </Link>
        </div>

        <Button type="submit" full disabled={loading} className="mt-1 min-h-12 justify-between px-5">
          <span className="inline-flex items-center gap-2">
            {loading && <span className="btn-spinner" />}
            {loading ? 'Memproses...' : 'Masuk Sekarang'}
          </span>
          {!loading && <ArrowRight size={16} />}
        </Button>
      </form>

      <div className="mt-6 grid gap-3 rounded-[var(--radius-sm)] border border-[var(--glass-border)] bg-[color-mix(in_srgb,var(--color-surface)_72%,var(--color-background))] p-4 text-sm dark:bg-[rgba(15,23,42,.42)]">
        <div className="flex items-center justify-between gap-3">
          <span className="font-semibold text-[var(--color-muted)]">Belum memiliki akun?</span>
          <Link to="/register" className="font-extrabold text-[var(--color-primary)] no-underline">
            Daftar
          </Link>
        </div>
        <div className="h-px bg-[var(--glass-border)]" />
        <p className="m-0 leading-6 text-[var(--color-muted)]">
          Admin hotel akan otomatis diarahkan ke dashboard setelah login berhasil.
        </p>
      </div>
    </AuthFrame>
  );
};

export default Login;
