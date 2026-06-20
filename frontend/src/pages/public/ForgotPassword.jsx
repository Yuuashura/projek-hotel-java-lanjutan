import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Mail } from 'lucide-react';
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
    <div className="auth-page">
      <div className="auth-shell animate-slide-in">
        <div className="auth-header">
          <Link to="/" className="[text-decoration:none]">
            <div className="auth-brand">
              NgiNep<span className="[color:var(--color-primary)]">.</span>
            </div>
          </Link>
          <h1>Lupa Password</h1>
          <p>Masukkan email akun Anda untuk menerima kode reset.</p>
        </div>

        <div className="card auth-card">
          <div className="auth-card-accent" />

          {error &&
          <div className="alert-danger [padding:0.875rem_1rem] [margin-bottom:1.5rem] [display:flex] [gap:0.5rem] [align-items:center] [border-radius:var(--radius-sm)]">
              <AlertCircle size={16} className="[color:var(--color-danger)] [flex-shrink:0]" />
              <span className="[font-weight:300] [color:var(--color-danger)] [font-size:0.85rem]">{error}</span>
            </div>
          }

          {success &&
          <div className="alert-success [padding:0.875rem_1rem] [margin-bottom:1.5rem] [display:flex] [gap:0.5rem] [align-items:center] [border-radius:var(--radius-sm)]">
              <CheckCircle size={16} className="[color:var(--color-success)] [flex-shrink:0]" />
              <span className="[font-weight:300] [color:var(--color-success)] [font-size:0.85rem]">{success}</span>
            </div>
          }

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="label">Alamat Email</label>
              <div className="[position:relative]">
                <input className="input [padding-right:2.5rem]" type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <Mail size={16} className="[position:absolute] [right:0.875rem] [top:50%] [transform:translateY(-50%)] [color:var(--color-muted)]" />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full h-[50px] bg-[var(--color-primary)] disabled:opacity-70" disabled={loading}>
              {loading ? <><span className="btn-spinner" /> Mengirim...</> : 'Kirim Kode Reset'}
            </button>
          </form>
        </div>

        <p className="auth-footnote">
          Ingat password Anda? <Link to="/login">Masuk kembali</Link>
        </p>
      </div>
    </div>);

};

export default ForgotPassword;
