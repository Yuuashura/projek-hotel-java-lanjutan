import React, { useState, useEffect } from 'react';
import { Hotel, Calendar, TrendingUp, CheckCircle, Clock, XCircle, Upload, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingState from '../../components/LoadingState';
import api from '../../utils/api';
import { unwrapList } from '../../utils/response';
import { usePreferences } from '../../context/PreferencesContext';

const StatCard = ({ label, value, icon: Icon, sub }) => (
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

const StatLoadingDots = () => (
  <span className="stat-loading-dots" aria-label="Loading">
    <i />
    <i />
    <i />
  </span>
);

const AdminDashboard = () => {
  const { t } = usePreferences();
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
      setError(t('admin.errors.uploadExcelFormat'));
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
      setError(err.response?.data?.message || t('admin.errors.uploadExcelFailed'));
    } finally {
      setExcelUploading(false);
      if (excelRef.current) excelRef.current.value = '';
    }
  };

  const bookingStats = [
    { label: t('admin.dashboard.pending'), status: 'PENDING', bg: 'var(--color-warning-soft)', color: 'var(--color-warning)', icon: Clock },
    { label: t('admin.dashboard.confirmed'), status: 'CONFIRMED', bg: 'var(--color-success-soft)', color: 'var(--color-success)', icon: CheckCircle },
    { label: t('admin.dashboard.cancelled'), status: 'CANCELLED', bg: 'var(--color-danger-soft)', color: 'var(--color-danger)', icon: XCircle },
  ].map(s => ({ ...s, count: stats.bookings.filter(b => b.status === s.status).length }));

  const recentBookings = stats.bookings.slice(0, 5);

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.75rem', textTransform: 'uppercase', letterSpacing: '1px', margin: 0, color: 'var(--color-text)' }}>{t('admin.dashboard.title')}</h2>
            <p style={{ color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.85rem', margin: '0.25rem 0 0' }}>{t('admin.dashboard.welcome')}</p>
          </div>
          <button onClick={() => excelRef.current?.click()} className="btn btn-white btn-sm" disabled={excelUploading}>
            <Upload size={14} /> {excelUploading ? t('admin.actions.uploading') : t('admin.actions.uploadHotelExcel')}
          </button>
          <input ref={excelRef} type="file" accept=".xlsx" style={{ display: 'none' }} onChange={handleExcelUpload} />
        </div>

        {error && (
          <div className="alert-danger" style={{ borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <AlertCircle size={16} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
            <span style={{ fontWeight: 300, color: 'var(--color-danger)', fontSize: '0.85rem' }}>{error}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <StatCard label={t('admin.dashboard.totalHotels')} value={loading ? <StatLoadingDots /> : stats.hotels} icon={Hotel} />
          <StatCard label={t('admin.dashboard.totalBookings')} value={loading ? <StatLoadingDots /> : stats.bookings.length} icon={Calendar} />
          <StatCard label={t('admin.dashboard.totalRevenue')} value={loading ? <StatLoadingDots /> : formatCurrency(stats.totalRevenue)} icon={TrendingUp} sub={t('admin.dashboard.revenueSub')} />
        </div>

        {/* Booking Status Breakdown */}
        <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--color-accent)' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-accent)', paddingBottom: '0.75rem', color: 'var(--color-text)' }}>{t('admin.dashboard.bookingStatus')}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {bookingStats.map(({ label, count, bg, color, icon: Icon }) => (
              <div key={label} style={{ padding: '1.25rem', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-accent)', paddingBottom: '0.75rem', color: 'var(--color-text)' }}>{t('admin.dashboard.latestBookings')}</h3>
          {loading ? (
            <LoadingState text={t('admin.dashboard.loading')} compact />
          ) : recentBookings.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--color-muted)', padding: '2rem 0', fontWeight: 300, fontSize: '0.9rem' }}>{t('admin.dashboard.emptyBookings')}</div>
          ) : (
            <table className="neo-table">
              <thead>
                <tr>
                  {[t('admin.table.id'), t('admin.table.hotelId'), t('admin.table.booker'), t('admin.table.checkIn'), t('admin.table.total'), t('admin.table.status')].map(h => <th key={h}>{h}</th>)}
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
