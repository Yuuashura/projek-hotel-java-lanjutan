const fieldStyle = { color: 'var(--color-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' };
const valueStyle = { fontWeight: 400, color: 'var(--color-text)', marginTop: '0.25rem' };

const ProfileField = ({ label, value }) => (
  <div>
    <label className="label" style={fieldStyle}>{label}</label>
    <div style={valueStyle}>{value || '-'}</div>
  </div>
);

const ProfileInfoView = ({ user, cities, onEdit }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      <ProfileField label="Nama Depan" value={user?.first_name} />
      <ProfileField label="Nama Belakang" value={user?.last_name} />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      <ProfileField label="Umur" value={user?.age ? `${user.age} tahun` : '-'} />
      <ProfileField label="Kota asal" value={cities.find(city => city.id_city === user?.city_id)?.name} />
    </div>
    <ProfileField label="No. Telepon" value={user?.phone} />
    <button onClick={onEdit} className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '1rem', background: 'var(--color-primary)', padding: '0 2rem', height: 44 }}>
      Edit Profil
    </button>
  </div>
);

export default ProfileInfoView;
