import React, { useState, useEffect } from 'react';
import { Hotel, Users, Calendar, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../utils/api';

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', overflow: 'hidden' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ width: 48, height: 48, background: color, border: '3px solid var(--neo-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--neo-shadow-sm)' }}>
        <Icon size={22} style={{ color: 'white' }} />
      </div>
    </div>
    <div>
      <div style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '2rem', lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#9ca3af', marginTop: '0.25rem' }}>{sub}</div>}
    </div>
    <div style={{ position: 'absolute', bottom: -16, right: -16, width: 72, height: 72, border: `6px solid ${color}`, borderRadius: '50%', opacity: 0.2 }} />
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({ hotels: 0, bookings: [], totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/hotels').catch(() => ({ data: { data: [] } })),
      api.get('/api/bookings').catch(() => ({ data: { data: [] } })),
    ]).then(([hotels, bookings]) => {
      const bs = bookings.data.data || [];
      const confirmed = bs.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED');
      const totalRevenue = confirmed.reduce((sum, b) => sum + (b.total_price || 0), 0);
      setStats({ hotels: (hotels.data.data || []).length, bookings: bs, totalRevenue });
    }).finally(() => setLoading(false));
  }, []);

  const bookingStats = [
    { label: 'Menunggu', status: 'PENDING', color: 'var(--neo-yellow)', icon: Clock },
    { label: 'Dikonfirmasi', status: 'CONFIRMED', color: 'var(--neo-green)', icon: CheckCircle },
    { label: 'Dibatalkan', status: 'CANCELLED', color: 'var(--neo-pink)', icon: XCircle },
  ].map(s => ({ ...s, count: stats.bookings.filter(b => b.status === s.status).length }));

  const recentBookings = stats.bookings.slice(0, 5);

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1.5rem', textTransform: 'uppercase', margin: 0, marginBottom: '0.25rem' }}>Dashboard</h2>
          <p style={{ color: '#9ca3af', fontWeight: 500, fontSize: '0.9rem' }}>Selamat datang kembali! Berikut ringkasan platform NgiNep hari ini.</p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
          <StatCard label="Total Hotel" value={loading ? '...' : stats.hotels} icon={Hotel} color="var(--neo-purple)" />
          <StatCard label="Total Pemesanan" value={loading ? '...' : stats.bookings.length} icon={Calendar} color="var(--neo-blue)" />
          <StatCard label="Total Pendapatan" value={loading ? '...' : formatCurrency(stats.totalRevenue)} icon={TrendingUp} color="var(--neo-orange)" sub="dari pesanan CONFIRMED + COMPLETED" />
        </div>

        {/* Booking Status Breakdown */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.95rem', marginBottom: '1.25rem', borderBottom: '2px solid var(--neo-dark)', paddingBottom: '0.75rem' }}>Status Pemesanan</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
            {bookingStats.map(({ label, count, color, icon: Icon }) => (
              <div key={label} style={{ padding: '1rem', border: `3px solid var(--neo-dark)`, background: 'var(--neo-light)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 36, height: 36, background: color, border: '2px solid var(--neo-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} style={{ color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1.5rem', lineHeight: 1 }}>{count}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.95rem', marginBottom: '1.25rem', borderBottom: '2px solid var(--neo-dark)', paddingBottom: '0.75rem' }}>Pesanan Terbaru</h3>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', fontWeight: 600 }}>Memuat data...</div>
          ) : recentBookings.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', fontWeight: 600 }}>Belum ada data pemesanan</div>
          ) : (
            <table className="neo-table">
              <thead>
                <tr>
                  {['ID', 'Hotel ID', 'Pemesan', 'Check-In', 'Total', 'Status'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {recentBookings.map(b => (
                  <tr key={b.id_booking || b.id}>
                    <td style={{ fontFamily: 'Space Grotesk', fontWeight: 700 }}>#{b.id_booking || b.id}</td>
                    <td style={{ fontWeight: 600 }}>Hotel #{b.hotel_id}</td>
                    <td style={{ fontWeight: 600 }}>{b.orderer_name}</td>
                    <td style={{ fontWeight: 500 }}>{b.check_in}</td>
                    <td style={{ fontFamily: 'Space Grotesk', fontWeight: 700, color: 'var(--neo-orange)' }}>{formatCurrency(b.total_price)}</td>
                    <td>
                      <span className="badge" style={{ background: { PENDING: 'var(--neo-yellow)', CONFIRMED: 'var(--neo-green)', CANCELLED: 'var(--neo-pink)', COMPLETED: '#6b7280' }[b.status], color: ['PENDING'].includes(b.status) ? 'var(--neo-dark)' : 'white', border: '2px solid var(--neo-dark)', boxShadow: '2px 2px 0px 0px var(--neo-dark)' }}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
