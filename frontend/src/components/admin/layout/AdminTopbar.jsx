import { Menu } from 'lucide-react';
import AdminPreferenceControls from './AdminPreferenceControls';

const AdminTopbar = ({ title, language, setLanguage, theme, toggleTheme, t, onMenuClick }) => (
  <div className="admin-topbar" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-accent)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 30 }}>
    <button onClick={onMenuClick} className="show-mobile-admin" style={{ background: 'none', border: '1px solid var(--color-accent)', padding: '0.5rem', cursor: 'pointer', display: 'none', borderRadius: 'var(--radius-sm)' }}>
      <Menu size={16} />
    </button>
    <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: '1px', flex: 1, margin: 0, color: 'var(--color-text)' }}>
      {title}
    </h1>
    <AdminPreferenceControls language={language} setLanguage={setLanguage} theme={theme} toggleTheme={toggleTheme} />
    <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '0.75rem', color: 'var(--color-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>{t('admin.brand')}</span>
  </div>
);

export default AdminTopbar;
