import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { animate, stagger } from 'animejs';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import LogoutConfirmModal from './LogoutConfirmModal';
import DesktopNavLinks from './navbar/DesktopNavLinks';
import MobileMenu from './navbar/MobileMenu';
import PreferenceControls from './navbar/PreferenceControls';
import UserDropdown from './navbar/UserDropdown';
import { frostedButtonStyle } from './navbar/navbarStyles';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, theme, toggleTheme, t } = usePreferences();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const logoutTimerRef = useRef(null);

  const isAdmin = user?.role === 'ROLE_ADMIN_HOTEL' || user?.role === 'ROLE_ADMIN_APP';
  const preferenceControls = useMemo(() => (
    <PreferenceControls language={language} setLanguage={setLanguage} theme={theme} toggleTheme={toggleTheme} t={t} />
  ), [language, setLanguage, theme, toggleTheme, t]);

  useEffect(() => () => {
    if (logoutTimerRef.current) window.clearTimeout(logoutTimerRef.current);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    window.requestAnimationFrame(() => {
      animate('.site-mobile-menu > *', {
        opacity: [0, 1],
        translateY: [-8, 0],
        duration: 360,
        delay: stagger(36),
        ease: 'outCubic',
      });
    });
  }, [isOpen]);

  const finishLogout = () => {
    setLogoutConfirmOpen(false);
    setLogoutLoading(false);
    sessionStorage.setItem('ngninep-flash', JSON.stringify({ type: 'success', key: 'flash.logoutSuccess' }));
    logout();
    window.location.assign('/');
  };

  const requestLogout = () => {
    setDropdownOpen(false);
    setIsOpen(false);
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
    <>
      <nav className="site-navbar" style={{ background: 'linear-gradient(135deg, rgba(9, 31, 59, 0.9), rgba(30, 78, 128, 0.76)), radial-gradient(circle at 18% 10%, rgba(246,211,101,0.18), transparent 32%), radial-gradient(circle at 82% 0%, rgba(122,183,240,0.18), transparent 30%)', backdropFilter: 'blur(22px) saturate(165%)', WebkitBackdropFilter: 'blur(22px) saturate(165%)', borderBottom: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 16px 40px rgba(15, 48, 90, 0.22)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="site-navbar-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 76 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div className="brand-logo" style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '1.8rem', color: 'white', letterSpacing: '1px', textShadow: '0 10px 26px rgba(0,0,0,0.22)' }}>
              NgiNep<span style={{ color: '#F6D365' }}>.</span>
            </div>
          </Link>

          <DesktopNavLinks isAdmin={isAdmin} t={t} />

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} className="hidden-mobile site-navbar-actions">
            {preferenceControls}
            {user ? (
              <UserDropdown user={user} open={dropdownOpen} setOpen={setDropdownOpen} t={t} onLogout={requestLogout} />
            ) : (
              <>
                <Link to="/login" className="btn btn-white btn-sm navbar-control-button" style={{ ...frostedButtonStyle, height: 40, padding: '0 1.5rem', display: 'flex', alignItems: 'center' }}>{t('nav.signIn')}</Link>
                <Link to="/register" className="btn btn-primary btn-sm navbar-control-button" style={{ height: 40, padding: '0 1.5rem', display: 'flex', alignItems: 'center', background: '#F6D365', color: '#15314F', borderColor: 'transparent' }}>{t('nav.signUp')}</Link>
              </>
            )}
          </div>

          <button onClick={() => setIsOpen(open => !open)} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', padding: '0.5rem', cursor: 'pointer', display: 'none', borderRadius: 'var(--radius-sm)', color: 'white' }} className="show-mobile site-navbar-menu-button">
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {isOpen && (
          <MobileMenu
            user={user}
            isAdmin={isAdmin}
            preferenceControls={preferenceControls}
            t={t}
            onClose={() => setIsOpen(false)}
            onLogout={requestLogout}
          />
        )}
      </nav>
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
    </>
  );
};

export default Navbar;
