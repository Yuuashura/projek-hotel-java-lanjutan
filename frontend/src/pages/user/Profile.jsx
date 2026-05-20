import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Camera, Save, AlertCircle, CheckCircle, Eye, EyeOff, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const Profile = () => {
  const { user, login, token, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('info');
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const avatarRef = useRef();

  const [form, setForm] = useState({ first_name: '', last_name: '', age: '', city_id: '', phone: '', profile_picture: '' });
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [showPw, setShowPw] = useState({ old: false, new: false, confirm: false });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
    else {
      setForm({ first_name: user.first_name || '', last_name: user.last_name || '', age: user.age || '', city_id: user.city_id || '', phone: user.phone || '', profile_picture: user.profile_picture || '' });
    }
    api.get('/api/cities').then(r => setCities(r.data.data || [])).catch(() => {});
  }, [user]);

  const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type: '', text: '' }), 4000); };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/api/users/me', { first_name: form.first_name, last_name: form.last_name, age: parseInt(form.age), city_id: parseInt(form.city_id), phone: form.phone, profile_picture: form.profile_picture });
      login(token, res.data);
      showMsg('success', 'Profil berhasil diperbarui!');
      setIsEditing(false);
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Gagal memperbarui profil');
    } finally { setLoading(false); }
  };

  const handlePwSave = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) {
      showMsg('error', 'Konfirmasi password baru tidak cocok!');
      return;
    }
    if (pwForm.new_password.length < 6) {
      showMsg('error', 'Password baru minimal 6 karakter.');
      return;
    }
    setLoading(true);
    try {
      await api.put('/api/users/me/change-password', { old_password: pwForm.old_password, new_password: pwForm.new_password, confirm_password: pwForm.confirm });
      showMsg('success', 'Password berhasil diubah! Silakan login kembali.');
      setTimeout(() => { logout(); navigate('/login'); }, 2000);
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Gagal mengubah password. Pastikan password lama benar.');
    } finally { setLoading(false); }
  };

  const tabs = [
    { key: 'info', label: 'Info Pribadi', icon: User },
    { key: 'password', label: 'Ganti Password', icon: Lock },
  ];

  const Alert = ({ type, text }) => (
    <div style={{ background: type === 'success' ? '#f0fdf4' : '#fff0f3', border: `3px solid ${type === 'success' ? '#16a34a' : 'var(--neo-pink)'}`, padding: '0.875rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start', boxShadow: `3px 3px 0px 0px ${type === 'success' ? '#16a34a' : 'var(--neo-pink)'}`, animation: 'slideIn 0.2s ease' }}>
      {type === 'success' ? <CheckCircle size={18} style={{ color: '#16a34a', flexShrink: 0 }} /> : <AlertCircle size={18} style={{ color: 'var(--neo-pink)', flexShrink: 0 }} />}
      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: type === 'success' ? '#166534' : '#be123c' }}>{text}</span>
    </div>
  );

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ width: 80, height: 80, border: '4px solid var(--neo-dark)', background: 'var(--neo-yellow)', overflow: 'hidden', boxShadow: 'var(--neo-shadow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {user?.profile_picture ? (
              <img src={user.profile_picture} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={36} style={{ color: 'var(--neo-dark)' }} />
            )}
          </div>
        </div>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', textTransform: 'uppercase', margin: 0 }}>{user?.first_name} {user?.last_name}</h1>
          <p style={{ color: '#6b7280', fontWeight: 500, margin: '0.25rem 0 0', fontSize: '0.9rem' }}>{user?.email}</p>
          <span className="badge badge-dark" style={{ marginTop: '0.5rem', fontSize: '0.7rem' }}>{user?.role?.replace('ROLE_', '')}</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '4px solid var(--neo-dark)', marginBottom: '2rem' }}>
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => { setTab(key); setIsEditing(false); }} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem',
            fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase',
            background: tab === key ? 'var(--neo-dark)' : 'white', color: tab === key ? 'white' : '#6b7280',
            border: '3px solid var(--neo-dark)', cursor: 'pointer', transition: 'all 0.15s',
            marginBottom: tab === key ? '-4px' : 0,
          }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        {msg.text && <Alert type={msg.type} text={msg.text} />}

        {tab === 'info' && (
          !isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div><label className="label">Nama Depan</label><div style={{ fontWeight: 600 }}>{user?.first_name}</div></div>
                <div><label className="label">Nama Belakang</label><div style={{ fontWeight: 600 }}>{user?.last_name || '-'}</div></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div><label className="label">Umur</label><div style={{ fontWeight: 600 }}>{user?.age} tahun</div></div>
                <div><label className="label">Kota</label><div style={{ fontWeight: 600 }}>{cities.find(c => c.id_city === user?.city_id)?.name || '-'}</div></div>
              </div>
              <div><label className="label">No. Telepon</label><div style={{ fontWeight: 600 }}>{user?.phone}</div></div>
              <button onClick={() => setIsEditing(true)} className="btn btn-blue" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
                Edit Profil
              </button>
            </div>
          ) : (
            <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="label">Email (tidak dapat diubah)</label>
                <input className="input" type="email" value={user?.email || ''} disabled style={{ background: '#f3f4f6', cursor: 'not-allowed', color: '#9ca3af' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="label">Nama Depan *</label>
                  <input className="input" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Nama Belakang</label>
                  <input className="input" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="label">Umur *</label>
                  <input type="number" className="input" min="17" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Kota *</label>
                  <select className="input" value={form.city_id} onChange={e => setForm(f => ({ ...f, city_id: e.target.value }))} required>
                    <option value="">Pilih Kota</option>
                    {cities.map(c => <option key={c.id_city} value={c.id_city}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">No. Telepon *</label>
                <input type="tel" className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
              </div>
              <div>
                <label className="label"><Camera size={12} style={{ display: 'inline', marginRight: '0.4rem' }} />URL Foto Profil (opsional)</label>
                <input type="url" className="input" placeholder="https://..." value={form.profile_picture} onChange={e => setForm(f => ({ ...f, profile_picture: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-dark" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                  <Save size={15} /> {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-white" disabled={loading}>Batal</button>
              </div>
            </form>
          )
        )}

        {tab === 'password' && (
          <form onSubmit={handlePwSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 400 }}>
            {[
              { key: 'old_password', label: 'Password Lama *', show: showPw.old, toggle: () => setShowPw(s => ({ ...s, old: !s.old })) },
              { key: 'new_password', label: 'Password Baru *', show: showPw.new, toggle: () => setShowPw(s => ({ ...s, new: !s.new })) },
              { key: 'confirm', label: 'Konfirmasi Password Baru *', show: showPw.confirm, toggle: () => setShowPw(s => ({ ...s, confirm: !s.confirm })) },
            ].map(({ key, label, show, toggle }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <div style={{ position: 'relative' }}>
                  <input className="input" type={show ? 'text' : 'password'} value={pwForm[key]} onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} required minLength={6} style={{ paddingRight: '3rem' }} />
                  <button type="button" onClick={toggle} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ))}
            <div style={{ background: '#fff8e1', border: '2px solid var(--neo-orange)', padding: '0.75rem', fontSize: '0.8rem', fontWeight: 600, color: '#92400e' }}>
              ⚠️ Setelah password diubah, Anda akan otomatis logout dan perlu login kembali.
            </div>
            <button type="submit" className="btn btn-dark" disabled={loading} style={{ alignSelf: 'flex-start', opacity: loading ? 0.7 : 1 }}>
              <Lock size={15} /> {loading ? 'Menyimpan...' : 'Ubah Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
