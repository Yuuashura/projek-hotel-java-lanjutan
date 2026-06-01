import React, { useState, useEffect } from 'react';
import { Hotel, Calendar, TrendingUp, CheckCircle, Clock, XCircle, Upload } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminSectionCard, { AdminStatCard } from '../../components/admin/AdminSectionCard';
import LoadingState from '../../components/LoadingState';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import api from '../../utils/api';
import { unwrapList } from '../../utils/response';
import { usePreferences } from '../../context/PreferencesContext';

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
        <AdminPageHeader
          title={t('admin.dashboard.title')}
          subtitle={t('admin.dashboard.welcome')}
          className="mb-0"
          actions={(
            <Button onClick={() => excelRef.current?.click()} variant="white" size="sm" disabled={excelUploading}>
              <Upload size={14} /> {excelUploading ? t('admin.actions.uploading') : t('admin.actions.uploadHotelExcel')}
            </Button>
          )}
        />
          <input ref={excelRef} type="file" accept=".xlsx" style={{ display: 'none' }} onChange={handleExcelUpload} />

        {error && <Alert type="danger" className="mb-0">{error}</Alert>}

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <AdminStatCard label={t('admin.dashboard.totalHotels')} value={loading ? <StatLoadingDots /> : stats.hotels} icon={Hotel} />
          <AdminStatCard label={t('admin.dashboard.totalBookings')} value={loading ? <StatLoadingDots /> : stats.bookings.length} icon={Calendar} />
          <AdminStatCard label={t('admin.dashboard.totalRevenue')} value={loading ? <StatLoadingDots /> : formatCurrency(stats.totalRevenue)} icon={TrendingUp} sub={t('admin.dashboard.revenueSub')} />
        </div>

        {/* Booking Status Breakdown */}
        <AdminSectionCard title={t('admin.dashboard.bookingStatus')}>
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
        </AdminSectionCard>

        {/* Recent Bookings */}
        <AdminSectionCard title={t('admin.dashboard.latestBookings')} className="overflow-x-auto">
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
        </AdminSectionCard>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
