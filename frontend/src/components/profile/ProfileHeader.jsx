import { Camera, User } from 'lucide-react';
import { getImageUrl } from '../../utils/uploads';

const ProfileHeader = ({ user, fileRef, profileUploading, onPhotoChange }) => (
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
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={onPhotoChange} />
    </div>
    <div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '2rem', margin: 0, color: 'var(--color-text)' }}>{user?.first_name} {user?.last_name}</h1>
      <p style={{ color: 'var(--color-muted)', fontWeight: 300, margin: '0.25rem 0 0', fontSize: '0.9rem' }}>{user?.email}</p>
      <span className="badge" style={{ marginTop: '0.5rem', fontSize: '0.65rem', background: 'rgba(212,175,55,0.1)', color: 'var(--color-primary)', borderColor: 'transparent' }}>{user?.role?.replace('ROLE_', '')}</span>
    </div>
  </div>
);

export default ProfileHeader;
