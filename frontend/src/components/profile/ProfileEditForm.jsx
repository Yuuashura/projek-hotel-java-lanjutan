import { Camera } from 'lucide-react';

const inputStyle = { border: 'none', borderBottom: '1px solid var(--color-accent)', background: 'transparent', borderRadius: 0, paddingLeft: 0 };

const ProfileEditForm = ({ user, form, setForm, cities, loading, profileUploading, fileRef, onSubmit, onCancel }) => (
  <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
    <div>
      <label className="label">Email (tidak dapat diubah)</label>
      <input className="input" style={{ ...inputStyle, color: 'var(--color-muted)', cursor: 'not-allowed' }} type="email" value={user?.email || ''} disabled />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      <div>
        <label className="label">Nama Depan *</label>
        <input className="input" style={inputStyle} value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required />
      </div>
      <div>
        <label className="label">Nama Belakang</label>
        <input className="input" style={inputStyle} value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      <div>
        <label className="label">Umur *</label>
        <input type="number" className="input" style={inputStyle} min="17" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} required />
      </div>
      <div>
        <label className="label">Kota *</label>
        <select className="input" style={{ ...inputStyle, color: 'var(--color-text)' }} value={form.city_id} onChange={e => setForm(f => ({ ...f, city_id: e.target.value }))} required>
          <option value="">Pilih Kota</option>
          {cities.map(city => <option key={city.id_city} value={city.id_city}>{city.name}</option>)}
        </select>
      </div>
    </div>
    <div>
      <label className="label">No. Telepon *</label>
      <input type="tel" className="input" style={inputStyle} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
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
      <button type="button" onClick={onCancel} className="btn btn-white" style={{ padding: '0 2rem', height: 44 }} disabled={loading}>Batal</button>
    </div>
  </form>
);

export default ProfileEditForm;
