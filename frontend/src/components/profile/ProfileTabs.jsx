import { Lock, User } from 'lucide-react';

const tabs = [
  { key: 'info', label: 'Info Pribadi', icon: User },
  { key: 'password', label: 'Ganti Password', icon: Lock },
];

const ProfileTabs = ({ activeTab, onChange }) => (
  <div style={{ display: 'flex', borderBottom: '1px solid var(--color-accent)', marginBottom: '2.5rem', gap: '2rem' }}>
    {tabs.map(({ key, label, icon: Icon }) => (
      <button
        key={key}
        onClick={() => onChange(key)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.875rem 0',
          fontFamily: 'var(--font-body)',
          fontWeight: 400,
          fontSize: '0.85rem',
          textTransform: 'uppercase',
          background: 'transparent',
          color: activeTab === key ? 'var(--color-primary)' : 'var(--color-muted)',
          border: 'none',
          borderBottom: activeTab === key ? '2px solid var(--color-primary)' : '2px solid transparent',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          letterSpacing: '1px',
          marginBottom: '-1px',
        }}
      >
        <Icon size={14} /> {label}
      </button>
    ))}
  </div>
);

export default ProfileTabs;
