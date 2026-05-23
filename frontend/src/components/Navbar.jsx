import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Calendar, Menu, X, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'ROLE_ADMIN_HOTEL' || user?.role === 'ROLE_ADMIN_APP';

  return (
    <nav style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--color-accent)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 400,
            fontSize: '1.8rem',
            color: 'var(--color-text)',
            letterSpacing: '1px'
          }}>
            NgiNep<span style={{ color: 'var(--color-primary)' }}>.</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }} className="hidden-mobile">
          <Link to="/" style={{ fontFamily: 'var(--font-body)', fontWeight: 400, color: 'var(--color-text)', textDecoration: 'none', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', transition: 'color 0.3s' }}>Beranda</Link>
          <Link to="/hotels" style={{ fontFamily: 'var(--font-body)', fontWeight: 400, color: 'var(--color-text)', textDecoration: 'none', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', transition: 'color 0.3s' }}>Hotel</Link>
          <Link to="/about" style={{ fontFamily: 'var(--font-body)', fontWeight: 400, color: 'var(--color-text)', textDecoration: 'none', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', transition: 'color 0.3s' }}>Tentang Kami</Link>
          {isAdmin && <Link to="/admin/dashboard" style={{ fontFamily: 'var(--font-body)', fontWeight: 400, color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', transition: 'color 0.3s' }}>Admin Panel</Link>}
        </div>

        {/* Desktop Auth */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} className="hidden-mobile">
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="btn btn-white btn-sm"
                style={{ gap: '0.5rem', display: 'flex', alignItems: 'center', height: 40, padding: '0 1.25rem', borderColor: 'var(--color-accent)' }}
              >
                <User size={14} />
                <span>Hai, {user.first_name}</span>
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
                    <Calendar size={14} /> Pesanan Saya
                  </Link>
                )}
                <Link to="/profile" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', textDecoration: 'none', color: 'var(--color-text)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid var(--color-accent)', transition: 'background 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-background)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <User size={14} /> Profil Saya
                </Link>
                <button onClick={() => { setDropdownOpen(false); handleLogout(); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: '#E53E3E', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', width: '100%', textAlign: 'left', transition: 'background 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-background)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <LogOut size={14} /> Keluar
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-white btn-sm" style={{ height: 40, padding: '0 1.5rem', display: 'flex', alignItems: 'center' }}>Masuk</Link>
              <Link to="/register" className="btn btn-primary btn-sm" style={{ height: 40, padding: '0 1.5rem', display: 'flex', alignItems: 'center', background: 'var(--color-primary)' }}>Daftar</Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button onClick={() => setIsOpen(!isOpen)} style={{ background: 'transparent', border: '1px solid var(--color-accent)', padding: '0.5rem', cursor: 'pointer', display: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }} className="show-mobile">
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div style={{ borderTop: '1px solid var(--color-accent)', background: 'var(--color-surface)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Link to="/" onClick={() => setIsOpen(false)} style={{ fontFamily: 'var(--font-body)', fontWeight: 400, textDecoration: 'none', color: 'var(--color-text)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-accent)' }}>Beranda</Link>
          <Link to="/hotels" onClick={() => setIsOpen(false)} style={{ fontFamily: 'var(--font-body)', fontWeight: 400, textDecoration: 'none', color: 'var(--color-text)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-accent)' }}>Hotel</Link>
          <Link to="/about" onClick={() => setIsOpen(false)} style={{ fontFamily: 'var(--font-body)', fontWeight: 400, textDecoration: 'none', color: 'var(--color-text)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-accent)' }}>Tentang Kami</Link>
          {user ? (
            <>
              {user.role === 'ROLE_USER' && <Link to="/my-bookings" onClick={() => setIsOpen(false)} className="btn btn-white btn-sm" style={{ textAlign: 'center', justifyContent: 'center' }}>Pesanan Saya</Link>}
              <Link to="/profile" onClick={() => setIsOpen(false)} className="btn btn-white btn-sm" style={{ textAlign: 'center', justifyContent: 'center' }}>Profil</Link>
              <button onClick={handleLogout} className="btn btn-primary btn-sm" style={{ background: '#E53E3E', color: 'white', justifyContent: 'center' }}>Keluar</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsOpen(false)} className="btn btn-white btn-sm" style={{ textAlign: 'center', justifyContent: 'center' }}>Masuk</Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="btn btn-primary btn-sm" style={{ textAlign: 'center', justifyContent: 'center', background: 'var(--color-primary)' }}>Daftar</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
