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

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-background)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 260, flexShrink: 0, background: 'white', borderRight: '1px solid var(--color-accent)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, height: '100vh', zIndex: 50,
        transition: 'transform 0.25s ease',
        boxShadow: sidebarOpen ? 'var(--shadow-hover)' : 'none',
      }} className={`sidebar-fixed ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '1.4rem', color: 'var(--color-primary)', fontStyle: 'italic', letterSpacing: '1px' }}>NgiNep.</div>
          <span style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Admin</span>
        </div>

        {/* User Info */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-accent)', background: '#FAFBFD' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '1.1rem', color: 'var(--color-text)' }}>{user?.first_name} {user?.last_name}</div>
          <div style={{ color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.75rem', marginBottom: '0.5rem' }}>{user?.email}</div>
          <span className="badge badge-yellow" style={{ fontSize: '0.65rem' }}>{user?.role?.replace('ROLE_', '')}</span>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
          {adminMenu.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path} onClick={() => setSidebarOpen(false)} className={`sidebar-link ${active ? 'active' : ''}`}>
                <Icon size={16} style={{ color: active ? 'var(--color-primary)' : 'var(--color-muted)' }} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ borderTop: '1px solid var(--color-accent)', padding: '1rem' }}>
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'none', border: '1px solid var(--color-accent)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '0.75rem', color: '#be123c', textTransform: 'uppercase', letterSpacing: '1.5px', borderRadius: 'var(--radius-sm)', transition: 'all 0.3s ease' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#be123c'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#be123c'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#be123c'; e.currentTarget.style.borderColor = 'var(--color-accent)'; }}>
            <LogOut size={14} /> Keluar
          </button>
        </div>
      </aside>

      {/* Overlay (mobile) */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 40 }} />}

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column' }} className="admin-content">
        {/* Top Bar */}
        <div style={{ background: 'white', borderBottom: '1px solid var(--color-accent)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 30 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="show-mobile-admin" style={{ background: 'none', border: '1px solid var(--color-accent)', padding: '0.5rem', cursor: 'pointer', display: 'none', borderRadius: 'var(--radius-sm)' }}>
            <Menu size={16} />
          </button>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: '1px', flex: 1, margin: 0, color: 'var(--color-text)' }}>
            {adminMenu.find(m => m.path === location.pathname)?.label || 'Admin Panel'}
          </h1>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '0.75rem', color: 'var(--color-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>NgiNep Admin</span>
        </div>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '2.5rem 2rem' }}>
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
