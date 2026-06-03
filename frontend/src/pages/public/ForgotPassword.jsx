import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthFrame from '../../components/auth/AuthFrame';
import AlertMessage from '../../components/auth/AlertMessage';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const ForgotPassword = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!token) return;
    navigate(user?.role === 'ROLE_ADMIN_HOTEL' || user?.role === 'ROLE_ADMIN_APP' ? '/admin/dashboard' : '/');
  }, [token, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      const message = res.data?.message || 'Jika email terdaftar, kode reset password akan dikirim.';
      sessionStorage.setItem('reset_password_email', email);
      setSuccess(message);
      window.setTimeout(() => navigate(`/reset-password?email=${encodeURIComponent(email)}`), 900);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim kode reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame
      title="Lupa Password"
      subtitle="Masukkan email akun Anda untuk menerima kode reset."
      footnote={<>Ingat password Anda? <Link className="font-bold text-[var(--color-primary)]" to="/login">Masuk kembali</Link></>}
    >
      <AlertMessage tone="danger">{error}</AlertMessage>
      <AlertMessage tone="success">{success}</AlertMessage>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="space-y-2">
          <label className="label">Alamat Email</label>
          <div className="relative">
            <Input className="pr-11" type="email" placeholder="nama@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            <Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          </div>
        </div>

        <Button type="submit" full disabled={loading} className="min-h-12">
          {loading ? <><span className="btn-spinner" /> Mengirim...</> : 'Kirim Kode Reset'}
        </Button>
      </form>
    </AuthFrame>
  );
};

export default ForgotPassword;
