import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Hotel, Users, Calendar, LogOut, Menu, Globe, House, UserCog } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import LogoutConfirmModal from '../LogoutConfirmModal';

const adminMenu = [
  { path: '/admin/dashboard', labelKey: 'admin.menu.dashboard', icon: LayoutDashboard },
  { path: '/admin/hotels', labelKey: 'admin.menu.hotels', icon: Hotel },
  { path: '/admin/admin-hotels', labelKey: 'admin.menu.adminHotels', icon: UserCog, roles: ['ROLE_ADMIN_APP'] },
  { path: '/admin/visitors', labelKey: 'admin.menu.visitors', icon: Users, roles: ['ROLE_ADMIN_APP'] },
  { path: '/admin/bookings', labelKey: 'admin.menu.bookings', icon: Calendar },
];

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = usePreferences();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = React.useState(false);
  const [logoutLoading, setLogoutLoading] = React.useState(false);
  const logoutTimerRef = React.useRef(null);
  const visibleMenu = adminMenu.filter(menu => !menu.roles || menu.roles.includes(user?.role));
  const activeMenu = visibleMenu.find(m => m.path === location.pathname);

  React.useEffect(() => {
    return () => {
      if (logoutTimerRef.current) {
        window.clearTimeout(logoutTimerRef.current);
      }
    };
  }, []);

  const finishLogout = () => {
    setLogoutConfirmOpen(false);
    setLogoutLoading(false);
    sessionStorage.setItem('ngninep-flash', JSON.stringify({ type: 'success', key: 'flash.logoutSuccess' }));
    logout();
    window.location.assign('/');
  };

  const requestLogout = () => {
    setSidebarOpen(false);
    setLogoutConfirmOpen(true);
  };

  const confirmLogout = () => {
    if (logoutLoading) return;
    setLogoutLoading(true);
    logoutTimerRef.current = window.setTimeout(finishLogout, 2000);
  };

  const cancelLogout = () => {
    if (logoutLoading) return;
    setLogoutConfirmOpen(false);
  };

  const preferenceControls = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '30px 38px 38px',
        alignItems: 'center',
        height: 40,
        padding: 3,
        border: '1px solid var(--color-accent)',
        background: 'var(--color-background)',
        borderRadius: 999,
        overflow: 'hidden',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)'
      }}>
        <Globe size={13} style={{ color: 'var(--color-muted)', justifySelf: 'center', zIndex: 2 }} />
        <span style={{
          position: 'absolute',
          top: 3,
          bottom: 3,
          left: 33,
          width: 38,
          borderRadius: 999,
          background: 'var(--color-primary)',
          boxShadow: 'var(--shadow-float)',
          transform: language === 'id' ? 'translateX(0)' : 'translateX(38px)',
          transition: 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
        }} />
        {['id', 'en'].map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setLanguage(lang)}
            title="Language"
            style={{
              height: 34,
              width: 38,
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              zIndex: 2,
              borderRadius: 999,
              background: 'transparent',
              color: language === lang ? 'white' : 'var(--color-muted)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.7px',
              lineHeight: 1,
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.24s ease, transform 0.24s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {lang}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="admin-shell" style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-background)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 260, flexShrink: 0, background: 'var(--admin-sidebar-bg)', borderRight: '1px solid var(--admin-sidebar-border)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, height: '100vh', zIndex: 50,
        transition: 'transform 0.25s ease',
        boxShadow: sidebarOpen ? 'var(--shadow-hover)' : 'none',
      }} className={`sidebar-fixed ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
         <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--admin-sidebar-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
           <Link to="/" style={{ textDecoration: 'none' }}>
             <div className="brand-logo admin-sidebar-brand" style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '1.4rem', color: '#FFFFFF', fontStyle: 'italic', letterSpacing: '1px' }}>NgiNep.</div>
           </Link>
           <span className="admin-sidebar-kicker" style={{ color: 'var(--admin-sidebar-muted)', fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Admin</span>
         </div>

        {/* User Info */}
        <div className="admin-sidebar-user" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--admin-sidebar-border)', background: 'var(--admin-sidebar-user-bg)' }}>
          <div className="admin-sidebar-user-name" style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '1.1rem', color: 'var(--admin-sidebar-text)' }}>{user?.first_name} {user?.last_name}</div>
          <div className="admin-sidebar-user-email" style={{ color: 'var(--admin-sidebar-muted)', fontWeight: 300, fontSize: '0.75rem', marginBottom: '0.5rem' }}>{user?.email}</div>
          <span className="badge badge-yellow" style={{ fontSize: '0.65rem' }}>{user?.role?.replace('ROLE_', '')}</span>
        </div>

         {/* Nav Links */}
         <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
           {visibleMenu.map(({ path, labelKey, icon: Icon }) => {
             const active = location.pathname === path;
             return (
               <Link key={path} to={path} onClick={() => setSidebarOpen(false)} className={`sidebar-link ${active ? 'active' : ''}`}>
                 <Icon size={16} />
                 {t(labelKey)}
               </Link>
             );
           })}
         </nav>
         
         {/* Home Link */}
         <Link to="/" onClick={() => setSidebarOpen(false)} style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.5rem', textDecoration: 'none', color: 'var(--admin-sidebar-text)', borderTop: '1px solid var(--admin-sidebar-border)' }}>
           <House size={16} />
           <span style={{ marginLeft: '0.75rem', fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
             {t('nav.home')}
           </span>
         </Link>

        {/* Logout */}
        <div style={{ borderTop: '1px solid var(--admin-sidebar-border)', padding: '1rem' }}>
          <button className="admin-sidebar-logout" onClick={requestLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(127, 29, 29, 0.1)', border: '1px solid rgba(252, 165, 165, 0.34)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '0.75rem', color: '#FECACA', textTransform: 'uppercase', letterSpacing: '1.5px', borderRadius: 'var(--radius-sm)', transition: 'all 0.3s ease' }}>
            <LogOut size={14} /> {t('admin.actions.logout')}
          </button>
        </div>
      </aside>

      {/* Overlay (mobile) */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 40 }} />}

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column' }} className="admin-content">
        {/* Top Bar */}
        <div className="admin-topbar" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-accent)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 30 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="show-mobile-admin" style={{ background: 'none', border: '1px solid var(--color-accent)', padding: '0.5rem', cursor: 'pointer', display: 'none', borderRadius: 'var(--radius-sm)' }}>
            <Menu size={16} />
          </button>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: '1px', flex: 1, margin: 0, color: 'var(--color-text)' }}>
            {activeMenu?.labelKey ? t(activeMenu.labelKey) : t('admin.panel')}
          </h1>
          {preferenceControls}
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '0.75rem', color: 'var(--color-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>{t('admin.brand')}</span>
        </div>

        {/* Page Content */}
        <main className="admin-page-main" style={{ flex: 1, padding: '2.5rem 2rem' }}>
          {children}
        </main>
      </div>

      <style>{`
        .sidebar-fixed { transform: translateX(0); }
        @media (max-width: 768px) {
          .sidebar-fixed { transform: translateX(-264px) !important; }
          .sidebar-fixed.open { transform: translateX(0) !important; }
          .admin-content { margin-left: 0 !important; }
          .show-mobile-admin { display: block !important; }
        }
      `}</style>
      <LogoutConfirmModal
        open={logoutConfirmOpen}
        loading={logoutLoading}
        title={t('nav.logoutConfirmTitle')}
        message={t('nav.logoutConfirmMessage')}
        confirmLabel={t('nav.logoutConfirmAction')}
        cancelLabel={t('nav.logoutCancelAction')}
        loadingLabel={t('nav.logoutLoading')}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </div>
  );
};

export default AdminLayout;
