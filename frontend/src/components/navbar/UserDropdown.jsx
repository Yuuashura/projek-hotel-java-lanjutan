import { Link } from 'react-router-dom';
import { Calendar, ChevronDown, LogOut, User } from 'lucide-react';
import { frostedButtonStyle } from './navbarStyles';

const dropdownLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.85rem 1.25rem',
  textDecoration: 'none',
  color: 'var(--color-text)',
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  borderBottom: '1px solid var(--color-accent)',
  transition: 'background 0.3s',
};

const hoverIn = e => { e.currentTarget.style.background = 'var(--color-background)'; };
const hoverOut = e => { e.currentTarget.style.background = 'transparent'; };

const UserDropdown = ({ user, open, setOpen, t, onLogout }) => (
  <div style={{ position: 'relative' }}>
    <button onClick={() => setOpen(!open)} className="btn btn-white btn-sm navbar-control-button" style={{ ...frostedButtonStyle, gap: '0.5rem', display: 'flex', alignItems: 'center', height: 40, padding: '0 1.25rem' }}>
      <User size={14} />
      <span>{t('nav.greeting', { name: user.first_name })}</span>
      <ChevronDown size={12} />
    </button>
    <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 220, background: 'var(--color-surface)', border: '1px solid var(--color-accent)', boxShadow: 'var(--shadow-float)', zIndex: 100, borderRadius: 'var(--radius-sm)', overflow: 'hidden', transformOrigin: 'top right', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', opacity: open ? 1 : 0, transform: open ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(-8px)', pointerEvents: open ? 'auto' : 'none' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-accent)', background: 'var(--color-background)' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '0.85rem', margin: 0, color: 'var(--color-text)' }}>{user.first_name} {user.last_name}</p>
        <span className="badge" style={{ marginTop: 6, fontSize: '0.65rem', background: 'rgba(44,82,130,0.1)', color: 'var(--color-primary)', borderColor: 'transparent' }}>{user.role?.replace('ROLE_', '')}</span>
      </div>
      {user.role === 'ROLE_USER' && (
        <Link to="/my-bookings" onClick={() => setOpen(false)} style={dropdownLinkStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
          <Calendar size={14} /> {t('nav.myBookings')}
        </Link>
      )}
      <Link to="/profile" onClick={() => setOpen(false)} style={dropdownLinkStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
        <User size={14} /> {t('nav.profile')}
      </Link>
      <button onClick={onLogout} style={{ ...dropdownLinkStyle, background: 'none', border: 'none', cursor: 'pointer', color: '#E53E3E', width: '100%', textAlign: 'left' }} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
        <LogOut size={14} /> {t('nav.logout')}
      </button>
    </div>
  </div>
);

export default UserDropdown;
