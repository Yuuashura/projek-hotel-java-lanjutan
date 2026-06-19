import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Hotel, Calendar, TrendingUp, CheckCircle, Clock, XCircle, Upload, AlertCircle, MapPin, UserPlus, DollarSign, Layout, Star } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingState from '../../components/LoadingState';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/uploads';
import { unwrapList } from '../../utils/response';
import { usePreferences } from '../../context/PreferencesContext';
import { useAuth } from '../../context/AuthContext';

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
  const { user } = useAuth();
   const [stats, setStats] = useState({ hotels: 0, bookings: [], totalRevenue: 0, hotelList: [] });
  const [loading, setLoading] = useState(true);
  const [excelUploading, setExcelUploading] = useState(false);
  const [error, setError] = useState('');
  const excelRef = React.useRef();

  const getUserId = () => user?.id_customer ?? user?.idCustomer ?? user?.userId ?? user?.id;
  const getHotelOwnerId = (hotel) => hotel?.admin_hotel_id ?? hotel?.adminHotelId;
  const isAdminHotel = user?.role === 'ROLE_ADMIN_HOTEL';

   const loadStats = async () => {
     setLoading(true);
     try {
       // Fetch all hotels
       const hotels = await api.get('/api/hotels', { params: { page: 0, size: 100 } }).catch(() => ({ data: { data: [] } }));
       let hotelList = unwrapList(hotels.data);
       
       // For admin hotel, filter to only their hotels
       if (isAdminHotel) {
         hotelList = hotelList.filter(hotel => getHotelOwnerId(hotel) === getUserId());
       }
       
       // Fetch bookings based on role
       let bookings = [];
       if (isAdminHotel) {
         // For admin hotel, fetch bookings for each of their hotels
         const bookingResults = await Promise.all(
           hotelList.map(hotel => api.get(`/api/bookings/hotel/${hotel.id_hotel ?? hotel.idHotel}`)
             .then(res => unwrapList(res.data))
             .catch(() => []))
         );
         bookings = bookingResults.flat();
       } else {
         // For admin app, fetch all bookings
         const bookingsResp = await api.get('/api/bookings', { params: { page: 0, size: 100 } }).catch(() => ({ data: { data: [] } }));
         bookings = unwrapList(bookingsResp.data);
       }

       const confirmed = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED');
       const totalRevenue = confirmed.reduce((sum, b) => sum + (b.total_price || 0), 0);
       
       // Store both filtered hotel list and all bookings for different uses
       setStats({ 
         hotels: hotelList.length, 
         bookings: bookings, 
         totalRevenue,
         hotelList // Store the actual hotel list for admin hotel view
       });
     } finally {
       setLoading(false);
     }
   };

  useEffect(() => {
    loadStats();
  }, [user]);

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
       {isAdminHotel ? (
         // Admin Hotel View - Show cards for each hotel they own
         <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
             <div>
               <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.75rem', textTransform: 'uppercase', letterSpacing: '1px', margin: 0, color: 'var(--color-text)' }}>{t('admin.dashboard.title')}</h2>
               <p style={{ color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.85rem', margin: '0.25rem 0 0' }}>{t('admin.dashboard.welcome')}</p>
             </div>
             {/* No Excel upload for admin hotel users */}
           </div>

           {error && (
              <div className="alert-danger" style={{ borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <AlertCircle size={16} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
                <span style={{ fontWeight: 300, color: 'var(--color-danger)', fontSize: '0.85rem' }}>{error}</span>
              </div>
            )}

            {/* Summary Stats */}
            {!loading && stats.hotelList.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                <StatCard label={t('admin.dashboard.totalHotels')} value={stats.hotels} icon={Hotel} />
                <StatCard label={t('admin.dashboard.totalBookings')} value={stats.bookings.length} icon={Calendar} />
                <StatCard label={t('admin.dashboard.totalRevenue')} value={formatCurrency(stats.totalRevenue)} icon={TrendingUp} sub={t('admin.dashboard.revenueSub')} />
              </div>
            )}

            {/* Hotel Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
               {loading ? (
                 <LoadingState text={t('admin.dashboard.loading')} compact />
               ) : stats.hotelList.length === 0 ? (
               <div style={{ textAlign: 'center', color: 'var(--color-muted)', padding: '3rem 0', fontWeight: 300, fontSize: '1.1rem' }}>
                 {t('admin.hotel.nohotels')}
               </div>
             ) : (
                stats.hotelList.map(hotel => {
                  const hotelBookings = stats.bookings.filter(b => b.hotel_id === (hotel.id_hotel ?? hotel.idHotel));
                  const confirmedBookings = hotelBookings.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED');
                  return (
                   <div key={hotel.id_hotel ?? hotel.idHotel} className="card" style={{ padding: 0, border: '1px solid var(--color-accent)', overflow: 'hidden', transition: 'box-shadow 0.2s', cursor: 'default' }} onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-hover)' }} onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}>
                     {/* Hotel Image */}
                     <div style={{ width: '100%', height: 160, overflow: 'hidden', background: 'var(--color-surface)', position: 'relative' }}>
                       {hotel.images?.[0]?.image_url || hotel.image_url ? (
                         <img src={getImageUrl(hotel.images?.[0]?.image_url || hotel.image_url)} alt={hotel.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                       ) : (
                         <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)', fontSize: '0.85rem', background: 'var(--color-background)' }}>
                           <Hotel size={32} style={{ opacity: 0.3 }} />
                         </div>
                       )}
                       {hotel.type && <span className="badge badge-gray" style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', fontSize: '0.65rem', fontWeight: 400 }}>{hotel.type}</span>}
                       {hotel.rating > 0 && (
                         <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(0,0,0,0.5)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'white' }}>
                           <Star size={12} fill="var(--color-primary)" style={{ stroke: 'var(--color-primary)' }} />
                           {hotel.rating.toFixed(1)}
                         </div>
                       )}
                     </div>

                     {/* Hotel Info */}
                     <div style={{ padding: '1.25rem' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                         <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '1.2rem', margin: 0, color: 'var(--color-text)' }}>
                           {hotel.name}
                         </h3>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--color-primary)', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>
                           <MapPin size={12} style={{ flexShrink: 0 }} />
                           <span>{hotel.city?.name ?? t('admin.hotel.unknowncity')}</span>
                         </div>
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                           <UserPlus size={12} style={{ color: 'var(--color-success)' }} />
                           <span>{hotel.room_types?.length || 0} {t('admin.hotel.roomtypes')}</span>
                         </div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                           <DollarSign size={12} style={{ color: 'var(--color-warning)' }} />
                           <span>{t('admin.hotel.avgprice')}: {formatCurrency(hotel.price_per_night ?? 0)}</span>
                         </div>
                       </div>

                    {/* Hotel Stats */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '1.5rem', color: 'var(--color-text)' }}>
                            {stats.hotels > 1 ? hotelBookings.length : stats.bookings.length}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>{t('admin.hotel.totalbookings')}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '1.5rem', color: 'var(--color-warning)' }}>
                            {hotelBookings.filter(b => b.status === 'PENDING').length}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>{t('admin.hotel.pending')}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '1.5rem', color: 'var(--color-success)' }}>
                            {hotelBookings.filter(b => b.status === 'CONFIRMED').length}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>{t('admin.hotel.confirmed')}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '1.5rem', color: 'var(--color-danger)' }}>
                            {hotelBookings.filter(b => b.status === 'CANCELLED').length}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>{t('admin.hotel.cancelled')}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '1.5rem', color: 'var(--color-primary)' }}>
                            {formatCurrency(hotelBookings.reduce((sum, b) => sum + (b.total_price || 0), 0))}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>{t('admin.hotel.revenue')}</div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                       <Link to={`/admin/hotels/${hotel.id_hotel ?? hotel.idHotel}/rooms`} className="btn btn-outline btn-sm" style={{ flex: 1, minWidth: 80 }}>
                         <Layout size={14} /> {t('admin.hotel.managerooms')}
                       </Link>
                       <Link to={`/admin/bookings?hotel_id=${hotel.id_hotel ?? hotel.idHotel}`} className="btn btn-outline btn-sm" style={{ flex: 1, minWidth: 80 }}>
                         <Calendar size={14} /> {t('admin.hotel.viewbookings')}
                       </Link>
                       <Link to={`/admin/hotels/${hotel.id_hotel ?? hotel.idHotel}`} className="btn btn-outline btn-sm" style={{ flex: 1, minWidth: 80 }}>
                         <Hotel size={14} /> {t('admin.hotel.edithotel')}
                       </Link>
                     </div>
                    </div>
                  </div>
                    );
                  })
             )}
           </div>
         </div>
       ) : (
         // Admin App View - Original dashboard (with minor updates)
         <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
             <div>
               <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.75rem', textTransform: 'uppercase', letterSpacing: '1px', margin: 0, color: 'var(--color-text)' }}>{t('admin.dashboard.title')}</h2>
               <p style={{ color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.85rem', margin: '0.25rem 0 0' }}>{t('admin.dashboard.welcome')}</p>
             </div>
             {!isAdminHotel && (
               <button onClick={() => excelRef.current?.click()} className="btn btn-white btn-sm" disabled={excelUploading}>
                 <Upload size={14} /> {excelUploading ? t('admin.actions.uploading') : t('admin.actions.uploadHotelExcel')}
               </button>
             )}
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
       )}
     </AdminLayout>
   );
};

export default AdminDashboard;
