import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import api from '../../utils/api';
import AuthLayout from '../../components/auth/AuthLayout';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import { FormField, TextInput } from '../../components/ui/FormField';

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
      sessionStorage.setItem('ngninep-flash', JSON.stringify({ type: 'success', key: 'flash.loginSuccess' }));
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
    <AuthLayout
      title="Masuk ke Akun Anda"
      subtitle={<>Belum punya akun? <Link to="/register">Daftar sekarang</Link></>}
      footnote={<>Dengan masuk, Anda menyetujui <a href="#">Syarat & Ketentuan</a> NgiNep.</>}
    >
      {error && <Alert type="danger">{error}</Alert>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <FormField label="Alamat Email">
          <TextInput type="email" placeholder="nama@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        </FormField>

        <FormField label="Password">
          <TextInput
            type={showPw ? 'text' : 'password'}
            placeholder="Masukkan password Anda"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required
            right={(
              <button type="button" onClick={() => setShowPw(!showPw)} className="flex h-9 w-9 items-center justify-center border-0 bg-transparent p-0 text-[var(--color-muted)] transition hover:text-[var(--color-primary)]">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}
          />
          <div className="mt-2.5 text-right">
            <Link to="/forgot-password" className="text-sm font-bold text-[var(--color-primary)] no-underline">Lupa Password?</Link>
          </div>
        </FormField>

        <Button type="submit" full disabled={loading} className="mt-2 min-h-[50px]">
          {loading ? <><span className="btn-spinner" /> Memproses...</> : 'Masuk Sekarang'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Login;
