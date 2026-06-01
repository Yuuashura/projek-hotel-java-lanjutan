import { Link } from 'react-router-dom';
import { frostedButtonStyle, mobileLinkStyle } from './navbarStyles';

const MobileMenu = ({ user, isAdmin, preferenceControls, t, onClose, onLogout }) => (
  <div className="site-mobile-menu" style={{ borderTop: '1px solid rgba(255,255,255,0.16)', background: 'linear-gradient(135deg, rgba(14,45,82,0.94), rgba(37,99,154,0.86))', backdropFilter: 'blur(16px) saturate(140%)', WebkitBackdropFilter: 'blur(16px) saturate(140%)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: '0 18px 35px rgba(15,48,90,0.22)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
      {preferenceControls}
    </div>
    <Link to="/" onClick={onClose} className="mobile-nav-link-luxury" style={mobileLinkStyle}>{t('nav.home')}</Link>
    <Link to="/hotels" onClick={onClose} className="mobile-nav-link-luxury" style={mobileLinkStyle}>{t('nav.hotels')}</Link>
    <Link to="/about" onClick={onClose} className="mobile-nav-link-luxury" style={mobileLinkStyle}>{t('nav.about')}</Link>
    {isAdmin && <Link to="/admin/dashboard" onClick={onClose} className="mobile-nav-link-luxury" style={mobileLinkStyle}>{t('nav.admin')}</Link>}
    {user ? (
      <>
        {user.role === 'ROLE_USER' && <Link to="/my-bookings" onClick={onClose} className="btn btn-white btn-sm" style={{ ...frostedButtonStyle, textAlign: 'center', justifyContent: 'center' }}>{t('nav.myBookings')}</Link>}
        <Link to="/profile" onClick={onClose} className="btn btn-white btn-sm" style={{ ...frostedButtonStyle, textAlign: 'center', justifyContent: 'center' }}>{t('nav.profile')}</Link>
        <button onClick={onLogout} className="btn btn-primary btn-sm navbar-control-button" style={{ background: '#E53E3E', color: 'white', justifyContent: 'center' }}>{t('nav.logout')}</button>
      </>
    ) : (
      <>
        <Link to="/login" onClick={onClose} className="btn btn-white btn-sm navbar-control-button" style={{ ...frostedButtonStyle, textAlign: 'center', justifyContent: 'center' }}>{t('nav.signIn')}</Link>
        <Link to="/register" onClick={onClose} className="btn btn-primary btn-sm navbar-control-button" style={{ textAlign: 'center', justifyContent: 'center', background: '#F6D365', color: '#15314F', borderColor: 'transparent' }}>{t('nav.signUp')}</Link>
      </>
    )}
  </div>
);

export default MobileMenu;
