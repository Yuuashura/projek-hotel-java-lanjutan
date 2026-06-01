import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import AuthLayout from '../../components/auth/AuthLayout';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import { FormField, TextInput } from '../../components/ui/FormField';

const ForgotPassword = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (token) {
      navigate(user?.role === 'ROLE_ADMIN_HOTEL' || user?.role === 'ROLE_ADMIN_APP' ? '/admin/dashboard' : '/');
    }
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
      window.setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 900);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim kode reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Lupa Password"
      subtitle="Masukkan email akun Anda untuk menerima kode reset."
      footnote={<>Ingat password Anda? <Link to="/login">Masuk kembali</Link></>}
    >
      {error && <Alert type="danger">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      <form onSubmit={handleSubmit}>
        <FormField label="Alamat Email">
          <TextInput
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            right={<Mail size={16} />}
          />
        </FormField>

        <Button type="submit" full disabled={loading} className="min-h-[50px]">
          {loading ? <><span className="btn-spinner" /> Mengirim...</> : 'Kirim Kode Reset'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
