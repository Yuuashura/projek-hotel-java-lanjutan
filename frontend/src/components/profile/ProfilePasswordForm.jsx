import { Eye, EyeOff } from 'lucide-react';

const passwordFields = [
  { key: 'old_password', label: 'Password Lama *', visibilityKey: 'old' },
  { key: 'new_password', label: 'Password Baru *', visibilityKey: 'new' },
  { key: 'confirm', label: 'Konfirmasi Password Baru *', visibilityKey: 'confirm' },
];

const inputStyle = { border: 'none', borderBottom: '1px solid var(--color-accent)', background: 'transparent', borderRadius: 0, paddingLeft: 0, paddingRight: '2rem' };

const ProfilePasswordForm = ({ form, setForm, showPassword, setShowPassword, loading, onSubmit }) => (
  <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 460 }}>
    {passwordFields.map(({ key, label, visibilityKey }) => {
      const visible = showPassword[visibilityKey];

      return (
        <div key={key}>
          <label className="label">{label}</label>
          <div style={{ position: 'relative' }}>
            <input
              className="input"
              style={inputStyle}
              type={visible ? 'text' : 'password'}
              value={form[key]}
              onChange={e => setForm(current => ({ ...current, [key]: e.target.value }))}
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(current => ({ ...current, [visibilityKey]: !current[visibilityKey] }))}
              style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}
            >
              {visible ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
      );
    })}
    <div style={{ background: '#FFFDF3', border: '1px solid #FEEBC8', padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#DD6B20', borderRadius: 'var(--radius-sm)' }}>
      Setelah password berhasil diubah, Anda akan otomatis keluar dan perlu masuk kembali.
    </div>
    <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start', background: 'var(--color-primary)', padding: '0 2rem', height: 44, opacity: loading ? 0.7 : 1 }}>
      {loading ? 'Menyimpan...' : 'Ubah Password'}
    </button>
  </form>
);

export default ProfilePasswordForm;
