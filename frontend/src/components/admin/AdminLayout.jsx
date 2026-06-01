import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import LogoutConfirmModal from '../LogoutConfirmModal';
import AdminSidebar from './layout/AdminSidebar';
import AdminTopbar from './layout/AdminTopbar';
import { adminMenu } from './layout/adminMenu';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, theme, toggleTheme, t } = usePreferences();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = React.useState(false);
  const [logoutLoading, setLogoutLoading] = React.useState(false);
  const logoutTimerRef = React.useRef(null);
  const activeMenu = adminMenu.find(menu => menu.path === location.pathname);

  React.useEffect(() => () => {
    if (logoutTimerRef.current) window.clearTimeout(logoutTimerRef.current);
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
    if (!logoutLoading) setLogoutConfirmOpen(false);
  };

  return (
    <div className="admin-shell" style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-background)' }}>
      <AdminSidebar user={user} pathname={location.pathname} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} t={t} onLogout={requestLogout} />

      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column' }} className="admin-content">
        <AdminTopbar
          title={activeMenu?.labelKey ? t(activeMenu.labelKey) : t('admin.panel')}
          language={language}
          setLanguage={setLanguage}
          theme={theme}
          toggleTheme={toggleTheme}
          t={t}
          onMenuClick={() => setSidebarOpen(open => !open)}
        />
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
