import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { validateImageFile } from '../../utils/uploads';
import Alert from '../../components/ui/Alert';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileTabs from '../../components/profile/ProfileTabs';
import ProfileInfoView from '../../components/profile/ProfileInfoView';
import ProfileEditForm from '../../components/profile/ProfileEditForm';
import ProfilePasswordForm from '../../components/profile/ProfilePasswordForm';

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

  return (
    <div style={{ background: 'var(--color-background)', minHeight: '100vh', padding: '6rem 1.5rem' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <ProfileHeader user={user} fileRef={fileRef} profileUploading={profileUploading} onPhotoChange={handleProfilePictureChange} />
        <ProfileTabs activeTab={tab} onChange={key => { setTab(key); setIsEditing(false); }} />

        <div className="card" style={{ padding: '2.5rem 2rem', border: '1px solid var(--color-accent)', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)' }}>
          {msg.text && <Alert type={msg.type === 'success' ? 'success' : 'danger'}>{msg.text}</Alert>}

          {tab === 'info' && (
            isEditing ? (
              <ProfileEditForm
                user={user}
                form={form}
                setForm={setForm}
                cities={cities}
                loading={loading}
                profileUploading={profileUploading}
                fileRef={fileRef}
                onSubmit={handleProfileSave}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <ProfileInfoView user={user} cities={cities} onEdit={() => setIsEditing(true)} />
            )
          )}

          {tab === 'password' && (
            <ProfilePasswordForm
              form={pwForm}
              setForm={setPwForm}
              showPassword={showPw}
              setShowPassword={setShowPw}
              loading={loading}
              onSubmit={handlePwSave}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
