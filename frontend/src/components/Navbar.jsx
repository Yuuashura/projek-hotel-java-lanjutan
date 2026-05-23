import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { LogOut, User, Calendar, Menu, X, ChevronDown, Globe, Moon, Sun } from 'lucide-react';

const navLinkStyle = {
  fontFamily: 'var(--font-body)',
  fontWeight: 400,
  color: 'rgba(255,255,255,0.92)',
  textDecoration: 'none',
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  transition: 'color 0.3s'
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
  const { language, setLanguage, theme, toggleTheme, t } = usePreferences();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoRotating, setLogoRotating] = useState(false);
  const didMountTheme = useRef(false);

  useEffect(() => {
    if (!didMountTheme.current) {
      didMountTheme.current = true;
      return;
    }
    setLogoRotating(true);
    const timer = window.setTimeout(() => setLogoRotating(false), 560);
    return () => window.clearTimeout(timer);
  }, [theme]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'ROLE_ADMIN_HOTEL' || user?.role === 'ROLE_ADMIN_APP';
  const nextThemeLabel = theme === 'dark' ? t('nav.light') : t('nav.dark');
  const ThemeIcon = theme === 'dark' ? Sun : Moon;

  const preferenceControls = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 2, padding: 3, border: '1px solid rgba(255,255,255,0.24)', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
        <Globe size={13} style={{ color: 'rgba(255,255,255,0.85)', margin: '0 0.35rem', zIndex: 1 }} />
        <span style={{
          position: 'absolute',
          top: 3,
          bottom: 3,
          left: language === 'id' ? 35 : 71,
          width: 34,
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(246,211,101,0.95)',
          boxShadow: '0 6px 18px rgba(0,0,0,0.16)',
          transition: 'left 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        }} />
        {['id', 'en'].map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setLanguage(lang)}
            title={t('nav.language')}
            style={{
              height: 30,
              minWidth: 34,
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              zIndex: 1,
              borderRadius: 'var(--radius-sm)',
              background: 'transparent',
              color: language === lang ? '#15314F' : 'rgba(255,255,255,0.9)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.7rem',
              fontWeight: 500,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            {lang}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={toggleTheme}
        title={`${t('nav.theme')}: ${nextThemeLabel}`}
        className="btn btn-white btn-sm"
        style={{ ...frostedButtonStyle, height: 38, width: 42, padding: 0 }}
      >
        <ThemeIcon key={theme} size={15} className="theme-icon-rotate" />
      </button>
    </div>
  );

  return (
    <nav style={{
      background: 'linear-gradient(135deg, rgba(14, 45, 82, 0.82), rgba(37, 99, 154, 0.68))',
      backdropFilter: 'blur(18px) saturate(150%)',
      WebkitBackdropFilter: 'blur(18px) saturate(150%)',
      borderBottom: '1px solid rgba(255,255,255,0.18)',
      boxShadow: '0 12px 30px rgba(15, 48, 90, 0.18)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div className={`brand-logo ${logoRotating ? 'is-rotating' : ''}`} style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 400,
            fontSize: '1.8rem',
            color: 'white',
            letterSpacing: '1px'
          }}>
            NgiNep<span style={{ color: '#F6D365' }}>.</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }} className="hidden-mobile">
          <Link to="/" style={navLinkStyle}>{t('nav.home')}</Link>
          <Link to="/hotels" style={navLinkStyle}>{t('nav.hotels')}</Link>
          <Link to="/about" style={navLinkStyle}>{t('nav.about')}</Link>
          {isAdmin && <Link to="/admin/dashboard" style={{ ...navLinkStyle, color: '#F6D365' }}>{t('nav.admin')}</Link>}
        </div>

        {/* Desktop Auth */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} className="hidden-mobile">
          {preferenceControls}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="btn btn-white btn-sm"
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
                <button onClick={() => { setDropdownOpen(false); handleLogout(); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: '#E53E3E', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', width: '100%', textAlign: 'left', transition: 'background 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-background)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <LogOut size={14} /> {t('nav.logout')}
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-white btn-sm" style={{ ...frostedButtonStyle, height: 40, padding: '0 1.5rem', display: 'flex', alignItems: 'center' }}>{t('nav.signIn')}</Link>
              <Link to="/register" className="btn btn-primary btn-sm" style={{ height: 40, padding: '0 1.5rem', display: 'flex', alignItems: 'center', background: '#F6D365', color: '#15314F', borderColor: 'transparent' }}>{t('nav.signUp')}</Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button onClick={() => setIsOpen(!isOpen)} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', padding: '0.5rem', cursor: 'pointer', display: 'none', borderRadius: 'var(--radius-sm)', color: 'white' }} className="show-mobile">
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div style={{
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
            {preferenceControls}
          </div>
          <Link to="/" onClick={() => setIsOpen(false)} style={mobileLinkStyle}>{t('nav.home')}</Link>
          <Link to="/hotels" onClick={() => setIsOpen(false)} style={mobileLinkStyle}>{t('nav.hotels')}</Link>
          <Link to="/about" onClick={() => setIsOpen(false)} style={mobileLinkStyle}>{t('nav.about')}</Link>
          {user ? (
            <>
              {user.role === 'ROLE_USER' && <Link to="/my-bookings" onClick={() => setIsOpen(false)} className="btn btn-white btn-sm" style={{ ...frostedButtonStyle, textAlign: 'center', justifyContent: 'center' }}>{t('nav.myBookings')}</Link>}
              <Link to="/profile" onClick={() => setIsOpen(false)} className="btn btn-white btn-sm" style={{ ...frostedButtonStyle, textAlign: 'center', justifyContent: 'center' }}>{t('nav.profile')}</Link>
              <button onClick={handleLogout} className="btn btn-primary btn-sm" style={{ background: '#E53E3E', color: 'white', justifyContent: 'center' }}>{t('nav.logout')}</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsOpen(false)} className="btn btn-white btn-sm" style={{ ...frostedButtonStyle, textAlign: 'center', justifyContent: 'center' }}>{t('nav.signIn')}</Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="btn btn-primary btn-sm" style={{ textAlign: 'center', justifyContent: 'center', background: '#F6D365', color: '#15314F', borderColor: 'transparent' }}>{t('nav.signUp')}</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
