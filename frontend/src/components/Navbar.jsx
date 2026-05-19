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
    navigate('/login');
  };

  const isAdmin = user?.role === 'ROLE_ADMIN_HOTEL' || user?.role === 'ROLE_ADMIN_APP';

  return (
    <nav style={{ background: 'white', borderBottom: '4px solid #121212', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'var(--neo-yellow)', border: '3px solid var(--neo-dark)', padding: '4px 14px',
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, fontSize: '1.4rem',
             letterSpacing: '-0.02em', color: 'var(--neo-dark)',
            boxShadow: '3px 3px 0px 0px #121212'
          }}>
            NgiNep.
          </div>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }} className="hidden-mobile">
          <Link to="/" style={{ fontFamily: 'Space Grotesk', fontWeight: 700, color: 'var(--neo-dark)', textDecoration: 'none', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Beranda</Link>
          <Link to="/hotels" style={{ fontFamily: 'Space Grotesk', fontWeight: 700, color: 'var(--neo-dark)', textDecoration: 'none', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hotel</Link>
          <Link to="/about" style={{ fontFamily: 'Space Grotesk', fontWeight: 700, color: 'var(--neo-dark)', textDecoration: 'none', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tentang Kami</Link>
          {isAdmin && <Link to="/admin/dashboard" style={{ fontFamily: 'Space Grotesk', fontWeight: 700, color: 'var(--neo-purple)', textDecoration: 'none', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin Panel</Link>}
        </div>

        {/* Desktop Auth */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }} className="hidden-mobile">
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="btn btn-blue btn-sm"
                style={{ gap: '0.5rem', display: 'flex', alignItems: 'center' }}
              >
                <User size={15} />
                Hai, {user.first_name}!
                <ChevronDown size={14} />
              </button>
              {dropdownOpen && (
                <div className="animate-slide-in" style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 200,
                  background: 'white', border: '3px solid var(--neo-dark)', boxShadow: 'var(--neo-shadow-lg)', zIndex: 100
                }}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '2px solid var(--neo-dark)', background: '#f9f9f9' }}>
                    <p style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '0.85rem', margin: 0 }}>{user.first_name} {user.last_name}</p>
                    <span className="badge badge-dark" style={{ marginTop: 4, fontSize: '0.65rem' }}>{user.role?.replace('ROLE_', '')}</span>
                  </div>
                  {user.role === 'ROLE_USER' && (
                    <Link to="/my-bookings" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', textDecoration: 'none', color: 'var(--neo-dark)', fontWeight: 700, fontSize: '0.875rem', borderBottom: '1px solid #e5e7eb' }}>
                      <Calendar size={15} /> Pesanan Saya
                    </Link>
                  )}
                  <Link to="/profile" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', textDecoration: 'none', color: 'var(--neo-dark)', fontWeight: 700, fontSize: '0.875rem', borderBottom: '1px solid #e5e7eb' }}>
                    <User size={15} /> Profil Saya
                  </Link>
                  <button onClick={() => { setDropdownOpen(false); handleLogout(); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neo-pink)', fontWeight: 700, fontSize: '0.875rem', width: '100%', textAlign: 'left' }}>
                    <LogOut size={15} /> Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-white btn-sm">Masuk</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Daftar</Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button onClick={() => setIsOpen(!isOpen)} style={{ background: 'white', border: '3px solid var(--neo-dark)', padding: '0.4rem', cursor: 'pointer', boxShadow: '2px 2px 0px 0px #121212', display: 'none' }} className="show-mobile">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div style={{ borderTop: '3px solid var(--neo-dark)', background: 'white', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link to="/" onClick={() => setIsOpen(false)} style={{ fontFamily: 'Space Grotesk', fontWeight: 700, textDecoration: 'none', color: 'var(--neo-dark)', textTransform: 'uppercase', fontSize: '0.9rem', paddingBottom: '0.75rem', borderBottom: '1px dashed #d1d5db' }}>Beranda</Link>
          <Link to="/hotels" onClick={() => setIsOpen(false)} style={{ fontFamily: 'Space Grotesk', fontWeight: 700, textDecoration: 'none', color: 'var(--neo-dark)', textTransform: 'uppercase', fontSize: '0.9rem', paddingBottom: '0.75rem', borderBottom: '1px dashed #d1d5db' }}>Hotel</Link>
          <Link to="/about" onClick={() => setIsOpen(false)} style={{ fontFamily: 'Space Grotesk', fontWeight: 700, textDecoration: 'none', color: 'var(--neo-dark)', textTransform: 'uppercase', fontSize: '0.9rem', paddingBottom: '0.75rem', borderBottom: '1px dashed #d1d5db' }}>Tentang Kami</Link>
          {user ? (
            <>
              {user.role === 'ROLE_USER' && <Link to="/my-bookings" onClick={() => setIsOpen(false)} className="btn btn-blue btn-sm" style={{ textAlign: 'center' }}>Pesanan Saya</Link>}
              <Link to="/profile" onClick={() => setIsOpen(false)} className="btn btn-white btn-sm" style={{ textAlign: 'center' }}>Profil</Link>
              <button onClick={handleLogout} className="btn btn-red btn-sm">Keluar</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsOpen(false)} className="btn btn-white btn-sm" style={{ textAlign: 'center' }}>Masuk</Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="btn btn-primary btn-sm" style={{ textAlign: 'center' }}>Daftar</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .hidden-mobile { display: none !important; } .show-mobile { display: block !important; } }
        @media (min-width: 769px) { .show-mobile { display: none !important; } }
      `}</style>
    </nav>
  );
};

export default Navbar;
