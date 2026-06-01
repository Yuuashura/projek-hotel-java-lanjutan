import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { adminMenu } from './adminMenu';

const AdminSidebar = ({ user, pathname, sidebarOpen, setSidebarOpen, t, onLogout }) => (
  <>
    <aside style={{ width: 260, flexShrink: 0, background: 'var(--admin-sidebar-bg)', borderRight: '1px solid var(--admin-sidebar-border)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, height: '100vh', zIndex: 50, transition: 'transform 0.25s ease', boxShadow: sidebarOpen ? 'var(--shadow-hover)' : 'none' }} className={`sidebar-fixed ${sidebarOpen ? 'open' : ''}`}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--admin-sidebar-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="brand-logo admin-sidebar-brand" style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '1.4rem', color: '#FFFFFF', fontStyle: 'italic', letterSpacing: '1px' }}>NgiNep.</div>
        <span className="admin-sidebar-kicker" style={{ color: 'var(--admin-sidebar-muted)', fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Admin</span>
      </div>

      <div className="admin-sidebar-user" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--admin-sidebar-border)', background: 'var(--admin-sidebar-user-bg)' }}>
        <div className="admin-sidebar-user-name" style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '1.1rem', color: 'var(--admin-sidebar-text)' }}>{user?.first_name} {user?.last_name}</div>
        <div className="admin-sidebar-user-email" style={{ color: 'var(--admin-sidebar-muted)', fontWeight: 300, fontSize: '0.75rem', marginBottom: '0.5rem' }}>{user?.email}</div>
        <span className="badge badge-yellow" style={{ fontSize: '0.65rem' }}>{user?.role?.replace('ROLE_', '')}</span>
      </div>

      <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
        {adminMenu.map(({ path, labelKey, icon: Icon }) => (
          <Link key={path} to={path} onClick={() => setSidebarOpen(false)} className={`sidebar-link ${pathname === path ? 'active' : ''}`}>
            <Icon size={16} />
            {t(labelKey)}
          </Link>
        ))}
      </nav>

      <div style={{ borderTop: '1px solid var(--admin-sidebar-border)', padding: '1rem' }}>
        <button className="admin-sidebar-logout" onClick={onLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(127, 29, 29, 0.1)', border: '1px solid rgba(252, 165, 165, 0.34)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '0.75rem', color: '#FECACA', textTransform: 'uppercase', letterSpacing: '1.5px', borderRadius: 'var(--radius-sm)', transition: 'all 0.3s ease' }}>
          <LogOut size={14} /> {t('admin.actions.logout')}
        </button>
      </div>
    </aside>
    {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 40 }} />}
  </>
);

export default AdminSidebar;
