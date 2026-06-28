import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Camera, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { cachedGet } from '../../utils/requestCache';
import { getImageUrl, validateImageFile } from '../../utils/uploads';
import { cn } from '../../lib/utils';

const PHONE_PATTERN = /^08\d{0,12}$/;
const PHONE_ERROR = 'Nomor telepon harus diawali 08 dan maksimal 14 digit';

const ProfileAlert = ({ type, text }) =>
<div className={cn(
  'mb-6 flex items-center gap-2 rounded-lg border px-4 py-3.5 text-sm [animation:slideIn_0.2s_ease]',
  type === 'success' ?
  'border-emerald-500/20 bg-emerald-500/5 text-[#276749]' :
  'border-[#FEB2B2] bg-[#FFF5F5] text-[#C53030]'
)}>
    {type === 'success' ?
  <CheckCircle size={16} className="shrink-0 text-[#38A169]" /> :
  <AlertCircle size={16} className="shrink-0 text-[#E53E3E]" />}
    <span className="font-light">{text}</span>
  </div>;


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
    const timer = window.setTimeout(() => {
      if (user) {
        setForm({ first_name: user.first_name || '', last_name: user.last_name || '', age: user.age || '', city_id: user.city_id || '', phone: user.phone || '', profile_picture: user.profile_picture || '' });
      }
    }, 0);
    cachedGet('/api/cities').then((r) => setCities(r.data.data || [])).catch(() => {});
    return () => window.clearTimeout(timer);
  }, [user, navigate]);

  const showMsg = (type, text) => {setMsg({ type, text });setTimeout(() => setMsg({ type: '', text: '' }), 4000);};

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
      setForm((f) => ({ ...f, profile_picture: res.data.profile_picture || '' }));
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
    } finally {setLoading(false);}
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
      setTimeout(() => {logout();navigate('/login');}, 2000);
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Gagal mengubah password. Pastikan password lama benar.');
    } finally {setLoading(false);}
  };

  const tabs = [
  { key: 'info', label: 'Info Pribadi', icon: User },
  { key: 'password', label: 'Ganti Password', icon: Lock }];


  return (
    <div className="[background:var(--color-background)] [min-height:100vh] [padding:6rem_1.5rem]">
      <div className="[max-width:760px] [margin:0_auto]">

        {/* Header */}
        <div className="[display:flex] [gap:2rem] [align-items:center] [margin-bottom:3rem] [flex-wrap:wrap]">
          <div className="[position:relative]">
            <div className="[width:88px] [height:88px] [border-radius:50%] [border:1px_solid_var(--color-accent)] [background:var(--color-surface)] [overflow:hidden] [display:flex] [align-items:center] [justify-content:center]">
              {user?.profile_picture ?
              <img src={getImageUrl(user.profile_picture)} alt="avatar" className="[width:100%] [height:100%] [object-fit:cover]" /> :

              <User size={36} className="[color:var(--color-muted)]" />
              }
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={profileUploading}
              title="Upload foto profil"
              className="absolute -bottom-1 -right-1 flex size-[34px] cursor-pointer items-center justify-center rounded-full border border-[var(--color-accent)] bg-white text-[var(--color-primary)] shadow-[var(--shadow-float)] disabled:cursor-not-allowed">

              <Camera size={15} />
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleProfilePictureChange} className="[display:none]" />
          </div>
          <div>
            <h1 className="[font-family:var(--font-heading)] [font-weight:300] [font-size:2rem] [margin:0] [color:var(--color-text)]">{user?.first_name} {user?.last_name}</h1>
            <p className="[color:var(--color-muted)] [font-weight:300] [margin:0.25rem_0_0] [font-size:0.9rem]">{user?.email}</p>
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-accent)] bg-[var(--color-background)] px-3 py-1 text-[0.7rem] font-medium uppercase text-[var(--color-text)] max-sm:px-2.5 max-sm:py-1 max-sm:text-[0.64rem] [margin-top:0.5rem] [font-size:0.65rem] [background:rgba(212,175,55,0.1)] [color:var(--color-primary)] [border-color:transparent]">{user?.role?.replace('ROLE_', '')}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="[display:flex] [border-bottom:1px_solid_var(--color-accent)] [margin-bottom:2.5rem] [gap:2rem]">
          {tabs.map(({ key, label, icon: Icon }) =>
          <button key={key} onClick={() => {setTab(key);setIsEditing(false);}}
          className={cn(
            '-mb-px flex cursor-pointer items-center gap-2 border-0 border-b-2 bg-transparent py-3.5 font-[var(--font-body)] text-[0.85rem] font-normal uppercase tracking-[1px] transition',
            tab === key ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-muted)]'
          )}>
              <Icon size={14} /> {label}
            </button>
          )}
        </div>

        <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--color-text)] shadow-[var(--shadow-float)] backdrop-blur-xl transition-all duration-300 [padding:2.5rem_2rem] [border:1px_solid_var(--color-accent)] [background:var(--color-surface)] [border-radius:var(--radius-sm)]">
          {msg.text && <ProfileAlert type={msg.type} text={msg.text} />}

          {tab === 'info' && (
          !isEditing ?
          <div className="[display:flex] [flex-direction:column] [gap:1.5rem]">
                <div className="[display:grid] [grid-template-columns:repeat(2,1fr)] [gap:1.5rem_2.5rem] max-sm:[grid-template-columns:1fr]">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem] [color:var(--color-muted)] [font-size:0.7rem] [text-transform:uppercase] [letter-spacing:0.5px]">Nama Depan</label>
                    <div className="[font-weight:400] [color:var(--color-text)] [margin-top:0.25rem]">{user?.first_name}</div>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem] [color:var(--color-muted)] [font-size:0.7rem] [text-transform:uppercase] [letter-spacing:0.5px]">Nama Belakang</label>
                    <div className="[font-weight:400] [color:var(--color-text)] [margin-top:0.25rem]">{user?.last_name || '-'}</div>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem] [color:var(--color-muted)] [font-size:0.7rem] [text-transform:uppercase] [letter-spacing:0.5px]">Email</label>
                    <div className="[font-weight:400] [color:var(--color-text)] [margin-top:0.25rem]">{user?.email || '-'}</div>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem] [color:var(--color-muted)] [font-size:0.7rem] [text-transform:uppercase] [letter-spacing:0.5px]">No. Telepon</label>
                    <div className="[font-weight:400] [color:var(--color-text)] [margin-top:0.25rem]">{user?.phone || '-'}</div>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem] [color:var(--color-muted)] [font-size:0.7rem] [text-transform:uppercase] [letter-spacing:0.5px]">Umur</label>
                    <div className="[font-weight:400] [color:var(--color-text)] [margin-top:0.25rem]">{user?.age} tahun</div>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem] [color:var(--color-muted)] [font-size:0.7rem] [text-transform:uppercase] [letter-spacing:0.5px]">Kota asal</label>
                    <div className="[font-weight:400] [color:var(--color-text)] [margin-top:0.25rem]">{cities.find((c) => c.id_city === user?.city_id)?.name || '-'}</div>
                  </div>
                </div>
                <button onClick={() => setIsEditing(true)} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[color-mix(in_srgb,var(--color-primary)_46%,transparent)] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))] text-[#061426] hover:brightness-105 [align-self:flex-start] [margin-top:1rem] [background:var(--color-primary)] [padding:0_2rem] [height:44px]">
                  Edit Profil
                </button>
              </div> :

          <form onSubmit={handleProfileSave} className="[display:flex] [flex-direction:column] [gap:1.5rem]">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">Email (tidak dapat diubah)</label>
                  <input className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm [border:none] [border-bottom:1px_solid_var(--color-accent)] [background:transparent] [border-radius:0] [padding-left:0] [color:var(--color-muted)] [cursor:not-allowed]" type="email" value={user?.email || ''} disabled />
                </div>
                <div className="[display:grid] [grid-template-columns:1fr_1fr] [gap:1.5rem]">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">Nama Depan *</label>
                    <input className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm [border:none] [border-bottom:1px_solid_var(--color-accent)] [background:transparent] [border-radius:0] [padding-left:0]" value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">Nama Belakang</label>
                    <input className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm [border:none] [border-bottom:1px_solid_var(--color-accent)] [background:transparent] [border-radius:0] [padding-left:0]" value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} />
                  </div>
                </div>
                <div className="[display:grid] [grid-template-columns:1fr_1fr] [gap:1.5rem]">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">Umur *</label>
                    <input type="number" className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm [border:none] [border-bottom:1px_solid_var(--color-accent)] [background:transparent] [border-radius:0] [padding-left:0]" min="17" value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">Kota *</label>
                    <select className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm [border:none] [border-bottom:1px_solid_var(--color-accent)] [background:transparent] [border-radius:0] [padding-left:0] [color:var(--color-text)]" value={form.city_id} onChange={(e) => setForm((f) => ({ ...f, city_id: e.target.value }))} required>
                      <option value="">Pilih Kota</option>
                      {cities.map((c) => <option key={c.id_city} value={c.id_city}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">No. Telepon *</label>
                  <input type="tel" inputMode="numeric" maxLength={14} pattern="^08[0-9]{0,12}$" title={PHONE_ERROR} className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm [border:none] [border-bottom:1px_solid_var(--color-accent)] [background:transparent] [border-radius:0] [padding-left:0]" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 14) }))} required />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">Foto Profil</label>
                  <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--color-text)] backdrop-blur-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-background)] [height:42px] [padding:0_1.25rem]" disabled={profileUploading}>
                    <Camera size={14} /> {profileUploading ? 'Mengunggah...' : 'Upload Foto Profil'}
                  </button>
                </div>
                <div className="[display:flex] [gap:1rem] [margin-top:1rem]">
                  <button type="submit" className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[color-mix(in_srgb,var(--color-primary)_46%,transparent)] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))] text-[#061426] hover:brightness-105 [background:var(--color-primary)] [padding:0_2rem] [height:44px]" disabled={loading}>
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--color-text)] backdrop-blur-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-background)] [padding:0_2rem] [height:44px]" disabled={loading}>Batal</button>
                </div>
              </form>)

          }

          {tab === 'password' &&
          <form onSubmit={handlePwSave} className="[display:flex] [flex-direction:column] [gap:1.5rem] [max-width:460px]">
              {[
            { key: 'old_password', label: 'Password Lama *', show: showPw.old, toggle: () => setShowPw((s) => ({ ...s, old: !s.old })) },
            { key: 'new_password', label: 'Password Baru *', show: showPw.new, toggle: () => setShowPw((s) => ({ ...s, new: !s.new })) },
            { key: 'confirm', label: 'Konfirmasi Password Baru *', show: showPw.confirm, toggle: () => setShowPw((s) => ({ ...s, confirm: !s.confirm })) }].
            map(({ key, label, show, toggle }) =>
            <div key={key}>
                  <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">{label}</label>
                  <div className="[position:relative]">
                    <input className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm [border:none] [border-bottom:1px_solid_var(--color-accent)] [background:transparent] [border-radius:0] [padding-left:0] [padding-right:2rem]" type={show ? 'text' : 'password'} value={pwForm[key]} onChange={(e) => setPwForm((f) => ({ ...f, [key]: e.target.value }))} required minLength={8} />
                    <button type="button" onClick={toggle} className="[position:absolute] [right:0] [top:50%] [transform:translateY(-50%)] [background:none] [border:none] [cursor:pointer] [color:var(--color-muted)]">
                      {show ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
            )}
              <div className="[border:1px_solid_var(--color-warning-border)] [background:var(--color-warning-soft)] [color:var(--color-warning)] [padding:0.875rem_1rem] [font-size:0.8rem] [border-radius:var(--radius-sm)]">
                Setelah password berhasil diubah, Anda akan otomatis keluar dan perlu masuk kembali.
              </div>
              <button type="submit" className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[color-mix(in_srgb,var(--color-primary)_46%,transparent)] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))] text-[#061426] hover:brightness-105 h-11 self-start bg-[var(--color-primary)] px-8 disabled:opacity-70" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Ubah Password'}
              </button>
            </form>
          }
        </div>
      </div>
    </div>);

};

export default Profile;
