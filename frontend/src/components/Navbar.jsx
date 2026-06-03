import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { animate, stagger } from 'animejs';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { LogOut, User, Calendar, Menu, X, ChevronDown } from 'lucide-react';
import LogoutConfirmModal from './LogoutConfirmModal';
import PreferenceControls from './PreferenceControls';

const navLinkStyle = {
  fontFamily: 'var(--font-body)',
  fontWeight: 400,
  color: 'rgba(255,255,255,0.92)',
  textDecoration: 'none',
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  transition: 'color 0.3s, transform 0.3s'
};

const mobileLinkStyle = {
  fontFamily: 'var(--font-body)',
  fontWeight: 400,
  textDecoration: 'none',
  color: 'rgba(255,255,255,0.94)',
  textTransform: 'uppercase',
  fontSize: '0.85rem',
  letterSpacing: '1px',
  paddingBottom: '0.75rem',
  borderBottom: '1px solid rgba(255,255,255,0.16)'
};

const frostedButtonStyle = {
  background: 'rgba(255,255,255,0.13)',
  color: 'white',
  borderColor: 'rgba(255,255,255,0.28)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.14)'
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t } = usePreferences();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const logoutTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (logoutTimerRef.current) {
        window.clearTimeout(logoutTimerRef.current);
      }
    };
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
    if (logoutLoading) return;
    setLogoutConfirmOpen(false);
  };

  const isAdmin = user?.role === 'ROLE_ADMIN_HOTEL' || user?.role === 'ROLE_ADMIN_APP';

  return (
    <>
    <nav className="site-navbar" style={{
      background: 'linear-gradient(135deg, rgba(9, 31, 59, 0.9), rgba(30, 78, 128, 0.76)), radial-gradient(circle at 18% 10%, rgba(246,211,101,0.18), transparent 32%), radial-gradient(circle at 82% 0%, rgba(122,183,240,0.18), transparent 30%)',
      backdropFilter: 'blur(22px) saturate(165%)',
      WebkitBackdropFilter: 'blur(22px) saturate(165%)',
      borderBottom: '1px solid rgba(255,255,255,0.2)',
      boxShadow: '0 16px 40px rgba(15, 48, 90, 0.22)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="site-navbar-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 76 }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div className="brand-logo" style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 400,
            fontSize: '1.8rem',
            color: 'white',
            letterSpacing: '1px',
            textShadow: '0 10px 26px rgba(0,0,0,0.22)'
          }}>
            NgiNep<span style={{ color: '#F6D365' }}>.</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }} className="hidden-mobile site-navbar-links">
          <Link to="/" className="nav-link-luxury" style={navLinkStyle}>{t('nav.home')}</Link>
          <Link to="/hotels" className="nav-link-luxury" style={navLinkStyle}>{t('nav.hotels')}</Link>
          <Link to="/about" className="nav-link-luxury" style={navLinkStyle}>{t('nav.about')}</Link>
          {isAdmin && <Link to="/admin/dashboard" className="nav-link-luxury" style={{ ...navLinkStyle, color: '#F6D365' }}>{t('nav.admin')}</Link>}
        </div>

        {/* Desktop Auth */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} className="hidden-mobile site-navbar-actions">
          <PreferenceControls tone="navbar" />
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="btn btn-white btn-sm navbar-control-button"
                style={{ ...frostedButtonStyle, gap: '0.5rem', display: 'flex', alignItems: 'center', height: 40, padding: '0 1.25rem' }}
              >
                <User size={14} />
                <span>{t('nav.greeting', { name: user.first_name })}</span>
                <ChevronDown size={12} />
              </button>
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 220,
                background: 'var(--color-surface)', border: '1px solid var(--color-accent)', boxShadow: 'var(--shadow-float)', zIndex: 100,
                borderRadius: 'var(--radius-sm)', overflow: 'hidden',
                transformOrigin: 'top right',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                opacity: dropdownOpen ? 1 : 0,
                transform: dropdownOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(-8px)',
                pointerEvents: dropdownOpen ? 'auto' : 'none',
              }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-accent)', background: 'var(--color-background)' }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '0.85rem', margin: 0, color: 'var(--color-text)' }}>{user.first_name} {user.last_name}</p>
                  <span className="badge" style={{ marginTop: 6, fontSize: '0.65rem', background: 'rgba(44,82,130,0.1)', color: 'var(--color-primary)', borderColor: 'transparent' }}>{user.role?.replace('ROLE_', '')}</span>
                </div>
                {user.role === 'ROLE_USER' && (
                  <Link to="/my-bookings" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', textDecoration: 'none', color: 'var(--color-text)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid var(--color-accent)', transition: 'background 0.3s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-background)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <Calendar size={14} /> {t('nav.myBookings')}
                  </Link>
                )}
                <Link to="/profile" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', textDecoration: 'none', color: 'var(--color-text)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid var(--color-accent)', transition: 'background 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-background)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <User size={14} /> {t('nav.profile')}
                </Link>
                <button onClick={requestLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: '#E53E3E', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', width: '100%', textAlign: 'left', transition: 'background 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-background)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <LogOut size={14} /> {t('nav.logout')}
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-white btn-sm navbar-control-button" style={{ ...frostedButtonStyle, height: 40, padding: '0 1.5rem', display: 'flex', alignItems: 'center' }}>{t('nav.signIn')}</Link>
              <Link to="/register" className="btn btn-primary btn-sm navbar-control-button" style={{ height: 40, padding: '0 1.5rem', display: 'flex', alignItems: 'center', background: '#F6D365', color: '#15314F', borderColor: 'transparent' }}>{t('nav.signUp')}</Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button onClick={() => setIsOpen(!isOpen)} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', padding: '0.5rem', cursor: 'pointer', display: 'none', borderRadius: 'var(--radius-sm)', color: 'white' }} className="show-mobile site-navbar-menu-button">
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="site-mobile-menu" style={{
          borderTop: '1px solid rgba(255,255,255,0.16)',
          background: 'linear-gradient(135deg, rgba(14,45,82,0.94), rgba(37,99,154,0.86))',
          backdropFilter: 'blur(16px) saturate(140%)',
          WebkitBackdropFilter: 'blur(16px) saturate(140%)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          boxShadow: '0 18px 35px rgba(15,48,90,0.22)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <PreferenceControls tone="navbar" />
          </div>
          <Link to="/" onClick={() => setIsOpen(false)} className="mobile-nav-link-luxury" style={mobileLinkStyle}>{t('nav.home')}</Link>
          <Link to="/hotels" onClick={() => setIsOpen(false)} className="mobile-nav-link-luxury" style={mobileLinkStyle}>{t('nav.hotels')}</Link>
          <Link to="/about" onClick={() => setIsOpen(false)} className="mobile-nav-link-luxury" style={mobileLinkStyle}>{t('nav.about')}</Link>
          {user ? (
            <>
              {user.role === 'ROLE_USER' && <Link to="/my-bookings" onClick={() => setIsOpen(false)} className="btn btn-white btn-sm" style={{ ...frostedButtonStyle, textAlign: 'center', justifyContent: 'center' }}>{t('nav.myBookings')}</Link>}
              <Link to="/profile" onClick={() => setIsOpen(false)} className="btn btn-white btn-sm" style={{ ...frostedButtonStyle, textAlign: 'center', justifyContent: 'center' }}>{t('nav.profile')}</Link>
              <button onClick={requestLogout} className="btn btn-primary btn-sm navbar-control-button" style={{ background: '#E53E3E', color: 'white', justifyContent: 'center' }}>{t('nav.logout')}</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsOpen(false)} className="btn btn-white btn-sm navbar-control-button" style={{ ...frostedButtonStyle, textAlign: 'center', justifyContent: 'center' }}>{t('nav.signIn')}</Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="btn btn-primary btn-sm navbar-control-button" style={{ textAlign: 'center', justifyContent: 'center', background: '#F6D365', color: '#15314F', borderColor: 'transparent' }}>{t('nav.signUp')}</Link>
            </>
          )}
        </div>
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
