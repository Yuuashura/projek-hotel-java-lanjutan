import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Hotel, Users, Calendar, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const adminMenu = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/hotels', label: 'Hotel', icon: Hotel },
  { path: '/admin/visitors', label: 'Pengunjung', icon: Users },
  { path: '/admin/bookings', label: 'Pemesanan', icon: Calendar },
];

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--neo-light)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 260, flexShrink: 0, background: 'white', borderRight: '4px solid var(--neo-dark)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, height: '100vh', zIndex: 50,
        transition: 'transform 0.25s ease',
        boxShadow: sidebarOpen ? 'var(--neo-shadow-lg)' : 'none',
      }} className={`sidebar-fixed ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '1.25rem 1rem', borderBottom: '4px solid var(--neo-dark)', background: 'var(--neo-dark)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ background: 'var(--neo-yellow)', border: '2px solid white', padding: '3px 12px', fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1.1rem', color: 'var(--neo-dark)', boxShadow: '2px 2px 0px 0px rgba(255,255,255,0.5)' }}>NgiNep.</div>
          <span style={{ color: '#9ca3af', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}>Admin Panel</span>
        </div>

        {/* User Info */}
        <div style={{ padding: '1rem', borderBottom: '2px solid var(--neo-dark)', background: '#f9f9f9' }}>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '0.9rem' }}>{user?.first_name} {user?.last_name}</div>
          <div style={{ color: '#9ca3af', fontWeight: 500, fontSize: '0.75rem', marginBottom: '0.35rem' }}>{user?.email}</div>
          <span className="badge badge-dark" style={{ fontSize: '0.65rem' }}>{user?.role?.replace('ROLE_', '')}</span>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '0.75rem 0', overflowY: 'auto' }}>
          {adminMenu.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path} onClick={() => setSidebarOpen(false)} className={`sidebar-link ${active ? 'active' : ''}`}>
                <Icon size={18} style={{ color: active ? 'var(--neo-dark)' : '#6b7280' }} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ borderTop: '3px solid var(--neo-dark)', padding: '0.75rem' }}>
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', background: 'none', border: '3px solid var(--neo-dark)', cursor: 'pointer', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.875rem', color: 'var(--neo-pink)', textTransform: 'uppercase', transition: 'all 0.1s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--neo-pink)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--neo-pink)'; }}>
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      {/* Overlay (mobile) */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />}

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column' }} className="admin-content">
        {/* Top Bar */}
        <div style={{ background: 'white', borderBottom: '4px solid var(--neo-dark)', padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 30 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="show-mobile-admin" style={{ background: 'none', border: '3px solid var(--neo-dark)', padding: '0.5rem', cursor: 'pointer', display: 'none' }}>
            <Menu size={18} />
          </button>
          <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1rem', textTransform: 'uppercase', flex: 1, margin: 0 }}>
            {adminMenu.find(m => m.path === location.pathname)?.label || 'Admin Panel'}
          </h1>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.8rem', color: '#9ca3af' }}>NgiNep Admin</span>
        </div>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '2rem 1.5rem' }}>
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
    </div>
  );
};

export default AdminLayout;
