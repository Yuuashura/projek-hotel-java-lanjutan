import React, { useState, useEffect } from 'react';
import { Hotel, Calendar, TrendingUp, CheckCircle, Clock, XCircle, Upload, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../utils/api';
import { unwrapList } from '../../utils/response';

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', overflow: 'hidden', border: '1px solid var(--color-accent)', boxShadow: 'none' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: `rgba(212, 175, 55, 0.08)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} style={{ color: 'var(--color-primary)' }} />
      </div>
    </div>
    <div>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '2rem', lineHeight: 1, color: 'var(--color-text)' }}>{value}</div>
      <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '0.35rem' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.7rem', fontWeight: 300, color: 'var(--color-muted)', marginTop: '0.25rem' }}>{sub}</div>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({ hotels: 0, bookings: [], totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [excelUploading, setExcelUploading] = useState(false);
  const [error, setError] = useState('');
  const excelRef = React.useRef();

  const loadStats = () => {
    setLoading(true);
    Promise.all([
      api.get('/api/hotels', { params: { page: 0, size: 100 } }).catch(() => ({ data: { data: [] } })),
      api.get('/api/bookings', { params: { page: 0, size: 100 } }).catch(() => ({ data: { data: [] } })),
    ]).then(([hotels, bookings]) => {
      const hotelList = unwrapList(hotels.data);
      const bs = unwrapList(bookings.data);
      const confirmed = bs.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED');
      const totalRevenue = confirmed.reduce((sum, b) => sum + (b.total_price || 0), 0);
      setStats({ hotels: hotelList.length, bookings: bs, totalRevenue });
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleExcelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setError('File harus berformat .xlsx');
      return;
    }

    setExcelUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post('/api/hotels/upload-excel', formData);
      loadStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengunggah file Excel');
    } finally {
      setExcelUploading(false);
      if (excelRef.current) excelRef.current.value = '';
    }
  };

  const bookingStats = [
    { label: 'Menunggu', status: 'PENDING', bg: 'rgba(237,137,54,0.06)', color: '#DD6B20', icon: Clock },
    { label: 'Dikonfirmasi', status: 'CONFIRMED', bg: 'rgba(72,187,120,0.06)', color: '#276749', icon: CheckCircle },
    { label: 'Dibatalkan', status: 'CANCELLED', bg: 'rgba(229,62,62,0.06)', color: '#C53030', icon: XCircle },
  ].map(s => ({ ...s, count: stats.bookings.filter(b => b.status === s.status).length }));

  const recentBookings = stats.bookings.slice(0, 5);

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.75rem', textTransform: 'uppercase', letterSpacing: '1px', margin: 0, color: 'var(--color-text)' }}>Dashboard</h2>
            <p style={{ color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.85rem', margin: '0.25rem 0 0' }}>Selamat datang kembali! Berikut ringkasan platform NgiNep hari ini.</p>
          </div>
          <button onClick={() => excelRef.current?.click()} className="btn btn-white btn-sm" disabled={excelUploading}>
            <Upload size={14} /> {excelUploading ? 'Mengunggah...' : 'Upload Hotel Excel'}
          </button>
          <input ref={excelRef} type="file" accept=".xlsx" style={{ display: 'none' }} onChange={handleExcelUpload} />
        </div>

        {error && (
          <div style={{ background: '#fff0f3', border: '1px solid #fda4af', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <AlertCircle size={16} style={{ color: '#be123c', flexShrink: 0 }} />
            <span style={{ fontWeight: 300, color: '#be123c', fontSize: '0.85rem' }}>{error}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <StatCard label="Total Hotel" value={loading ? '...' : stats.hotels} icon={Hotel} />
          <StatCard label="Total Pemesanan" value={loading ? '...' : stats.bookings.length} icon={Calendar} />
          <StatCard label="Total Pendapatan" value={loading ? '...' : formatCurrency(stats.totalRevenue)} icon={TrendingUp} sub="dari pesanan CONFIRMED + COMPLETED" />
        </div>

        {/* Booking Status Breakdown */}
        <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--color-accent)' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-accent)', paddingBottom: '0.75rem', color: 'var(--color-text)' }}>Status Pemesanan</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {bookingStats.map(({ label, count, bg, color, icon: Icon }) => (
              <div key={label} style={{ padding: '1.25rem', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-sm)', background: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} style={{ color: color }} />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.5rem', lineHeight: 1, color: 'var(--color-text)' }}>{count}</div>
                  <div style={{ fontWeight: 300, fontSize: '0.75rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.2rem' }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="card" style={{ padding: '1.5rem', overflowX: 'auto', border: '1px solid var(--color-accent)' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-accent)', paddingBottom: '0.75rem', color: 'var(--color-text)' }}>Pesanan Terbaru</h3>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--color-muted)', padding: '2rem 0', fontWeight: 300, fontSize: '0.9rem' }}>Memuat data...</div>
          ) : recentBookings.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--color-muted)', padding: '2rem 0', fontWeight: 300, fontSize: '0.9rem' }}>Belum ada data pemesanan</div>
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
                    <td style={{ fontWeight: 400, color: 'var(--color-muted)', fontSize: '0.85rem' }}>#{b.id_booking || b.id}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--color-text)', fontWeight: 300 }}>Hotel #{b.hotel_id}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--color-text)', fontWeight: 300 }}>{b.orderer_name}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--color-text)', fontWeight: 300 }}>{b.check_in}</td>
                    <td style={{ fontWeight: 400, color: 'var(--color-primary)', fontSize: '0.85rem' }}>{formatCurrency(b.total_price)}</td>
                    <td>
                      <span className={`badge badge-${b.status === 'PENDING' ? 'orange' : b.status === 'CONFIRMED' ? 'green' : b.status === 'CANCELLED' ? 'red' : 'gray'}`} style={{ fontSize: '0.7rem' }}>
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
