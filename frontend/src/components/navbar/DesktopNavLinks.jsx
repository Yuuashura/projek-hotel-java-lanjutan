import { Link } from 'react-router-dom';
import { navLinkStyle } from './navbarStyles';

const DesktopNavLinks = ({ isAdmin, t }) => (
  <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }} className="hidden-mobile site-navbar-links">
    <Link to="/" className="nav-link-luxury" style={navLinkStyle}>{t('nav.home')}</Link>
    <Link to="/hotels" className="nav-link-luxury" style={navLinkStyle}>{t('nav.hotels')}</Link>
    <Link to="/about" className="nav-link-luxury" style={navLinkStyle}>{t('nav.about')}</Link>
    {isAdmin && <Link to="/admin/dashboard" className="nav-link-luxury" style={{ ...navLinkStyle, color: '#F6D365' }}>{t('nav.admin')}</Link>}
  </div>
);

export default DesktopNavLinks;
