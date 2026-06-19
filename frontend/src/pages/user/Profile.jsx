import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Camera, Save, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { getImageUrl, validateImageFile } from '../../utils/uploads';

const PHONE_PATTERN = /^08\d{0,12}$/;
const PHONE_ERROR = 'Nomor telepon harus diawali 08 dan maksimal 14 digit';

const Profile = () => {
  const { user, login, token, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('info');
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileUploading, setProfileUploading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const fileRef = useRef();

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

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      showMsg('error', validationError);
      return;
    }

    setProfileUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/api/users/me/profile-picture', formData);
      login(token, res.data);
      setForm(f => ({ ...f, profile_picture: res.data.profile_picture || '' }));
      showMsg('success', 'Foto profil berhasil diunggah!');
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Gagal mengunggah foto profil');
    } finally {
      setProfileUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!PHONE_PATTERN.test(form.phone)) {
      showMsg('error', PHONE_ERROR);
      return;
    }
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
    <div style={{ background: type === 'success' ? 'rgba(72,187,120,0.05)' : '#FFF5F5', border: `1px solid ${type === 'success' ? 'rgba(72,187,120,0.2)' : '#FEB2B2'}`, padding: '0.875rem 1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', borderRadius: 'var(--radius-sm)', animation: 'slideIn 0.2s ease' }}>
      {type === 'success' ? <CheckCircle size={16} style={{ color: '#38A169', flexShrink: 0 }} /> : <AlertCircle size={16} style={{ color: '#E53E3E', flexShrink: 0 }} />}
      <span style={{ fontWeight: 300, fontSize: '0.85rem', color: type === 'success' ? '#276749' : '#C53030' }}>{text}</span>
    </div>
  );

  return (
    <div style={{ background: 'var(--color-background)', minHeight: '100vh', padding: '6rem 1.5rem' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: 88, height: 88, borderRadius: '50%', border: '1px solid var(--color-accent)', background: 'var(--color-surface)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {user?.profile_picture ? (
                <img src={getImageUrl(user.profile_picture)} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={36} style={{ color: 'var(--color-muted)' }} />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={profileUploading}
              title="Upload foto profil"
              style={{ position: 'absolute', right: -4, bottom: -4, width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--color-accent)', background: 'white', color: 'var(--color-primary)', cursor: profileUploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-float)' }}
            >
              <Camera size={15} />
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleProfilePictureChange} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '2rem', margin: 0, color: 'var(--color-text)' }}>{user?.first_name} {user?.last_name}</h1>
            <p style={{ color: 'var(--color-muted)', fontWeight: 300, margin: '0.25rem 0 0', fontSize: '0.9rem' }}>{user?.email}</p>
            <span className="badge" style={{ marginTop: '0.5rem', fontSize: '0.65rem', background: 'rgba(212,175,55,0.1)', color: 'var(--color-primary)', borderColor: 'transparent' }}>{user?.role?.replace('ROLE_', '')}</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-accent)', marginBottom: '2.5rem', gap: '2rem' }}>
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => { setTab(key); setIsEditing(false); }} 
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 0',
                fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '0.85rem', textTransform: 'uppercase',
                background: 'transparent', color: tab === key ? 'var(--color-primary)' : 'var(--color-muted)',
                border: 'none', borderBottom: tab === key ? '2px solid var(--color-primary)' : '2px solid transparent',
                cursor: 'pointer', transition: 'all 0.3s ease', letterSpacing: '1px',
                marginBottom: '-1px'
              }}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: '2.5rem 2rem', border: '1px solid var(--color-accent)', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)' }}>
          {msg.text && <Alert type={msg.type} text={msg.text} />}

          {tab === 'info' && (
            !isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label className="label" style={{ color: 'var(--color-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nama Depan</label>
                    <div style={{ fontWeight: 400, color: 'var(--color-text)', marginTop: '0.25rem' }}>{user?.first_name}</div>
                  </div>
                  <div>
                    <label className="label" style={{ color: 'var(--color-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nama Belakang</label>
                    <div style={{ fontWeight: 400, color: 'var(--color-text)', marginTop: '0.25rem' }}>{user?.last_name || '-'}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label className="label" style={{ color: 'var(--color-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Umur</label>
                    <div style={{ fontWeight: 400, color: 'var(--color-text)', marginTop: '0.25rem' }}>{user?.age} tahun</div>
                  </div>
                  <div>
                    <label className="label" style={{ color: 'var(--color-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kota asal</label>
                    <div style={{ fontWeight: 400, color: 'var(--color-text)', marginTop: '0.25rem' }}>{cities.find(c => c.id_city === user?.city_id)?.name || '-'}</div>
                  </div>
                </div>
                <div>
                  <label className="label" style={{ color: 'var(--color-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>No. Telepon</label>
                  <div style={{ fontWeight: 400, color: 'var(--color-text)', marginTop: '0.25rem' }}>{user?.phone}</div>
                </div>
                <button onClick={() => setIsEditing(true)} className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '1rem', background: 'var(--color-primary)', padding: '0 2rem', height: 44 }}>
                  Edit Profil
                </button>
              </div>
            ) : (
              <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label className="label">Email (tidak dapat diubah)</label>
                  <input className="input" style={{ border: 'none', borderBottom: '1px solid var(--color-accent)', background: 'transparent', borderRadius: 0, paddingLeft: 0, color: 'var(--color-muted)', cursor: 'not-allowed' }} type="email" value={user?.email || ''} disabled />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label className="label">Nama Depan *</label>
                    <input className="input" style={{ border: 'none', borderBottom: '1px solid var(--color-accent)', background: 'transparent', borderRadius: 0, paddingLeft: 0 }} value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="label">Nama Belakang</label>
                    <input className="input" style={{ border: 'none', borderBottom: '1px solid var(--color-accent)', background: 'transparent', borderRadius: 0, paddingLeft: 0 }} value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label className="label">Umur *</label>
                    <input type="number" className="input" style={{ border: 'none', borderBottom: '1px solid var(--color-accent)', background: 'transparent', borderRadius: 0, paddingLeft: 0 }} min="17" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="label">Kota *</label>
                    <select className="input" style={{ border: 'none', borderBottom: '1px solid var(--color-accent)', background: 'transparent', borderRadius: 0, paddingLeft: 0, color: 'var(--color-text)' }} value={form.city_id} onChange={e => setForm(f => ({ ...f, city_id: e.target.value }))} required>
                      <option value="">Pilih Kota</option>
                      {cities.map(c => <option key={c.id_city} value={c.id_city}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">No. Telepon *</label>
                  <input type="tel" inputMode="numeric" maxLength={14} pattern="^08[0-9]{0,12}$" title={PHONE_ERROR} className="input" style={{ border: 'none', borderBottom: '1px solid var(--color-accent)', background: 'transparent', borderRadius: 0, paddingLeft: 0 }} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 14) }))} required />
                </div>
                <div>
                  <label className="label">Foto Profil</label>
                  <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-white" disabled={profileUploading} style={{ height: 42, padding: '0 1.25rem' }}>
                    <Camera size={14} /> {profileUploading ? 'Mengunggah...' : 'Upload Foto Profil'}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={loading} style={{ background: 'var(--color-primary)', padding: '0 2rem', height: 44 }}>
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="btn btn-white" style={{ padding: '0 2rem', height: 44 }} disabled={loading}>Batal</button>
                </div>
              </form>
            )
          )}

          {tab === 'password' && (
            <form onSubmit={handlePwSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 460 }}>
              {[
                { key: 'old_password', label: 'Password Lama *', show: showPw.old, toggle: () => setShowPw(s => ({ ...s, old: !s.old })) },
                { key: 'new_password', label: 'Password Baru *', show: showPw.new, toggle: () => setShowPw(s => ({ ...s, new: !s.new })) },
                { key: 'confirm', label: 'Konfirmasi Password Baru *', show: showPw.confirm, toggle: () => setShowPw(s => ({ ...s, confirm: !s.confirm })) },
              ].map(({ key, label, show, toggle }) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <div style={{ position: 'relative' }}>
                    <input className="input" style={{ border: 'none', borderBottom: '1px solid var(--color-accent)', background: 'transparent', borderRadius: 0, paddingLeft: 0, paddingRight: '2rem' }} type={show ? 'text' : 'password'} value={pwForm[key]} onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} required minLength={8} />
                    <button type="button" onClick={toggle} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}>
                      {show ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              ))}
              <div style={{ background: '#FFFDF3', border: '1px solid #FEEBC8', padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#DD6B20', borderRadius: 'var(--radius-sm)' }}>
                Setelah password berhasil diubah, Anda akan otomatis keluar dan perlu masuk kembali.
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start', background: 'var(--color-primary)', padding: '0 2rem', height: 44, opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Menyimpan...' : 'Ubah Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
