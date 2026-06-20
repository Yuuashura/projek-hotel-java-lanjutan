import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
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

const StatCard = ({ label, value, icon: Icon, sub }) =>
<div className="card [padding:1.75rem] [display:flex] [flex-direction:column] [gap:0.75rem] [position:relative] [overflow:hidden] [border:1px_solid_var(--color-accent)] [box-shadow:none]">
    <div className="[display:flex] [justify-content:space-between] [align-items:flex-start]">
      <div className="[width:44px] [height:44px] [border-radius:50%] [background:rgba(212,_175,_55,_0.08)] [display:flex] [align-items:center] [justify-content:center]">
        <Icon size={18} className="[color:var(--color-primary)]" />
      </div>
    </div>
    <div>
      <div className="[font-family:var(--font-heading)] [font-weight:300] [font-size:2rem] [line-height:1] [color:var(--color-text)]">{value}</div>
      <div className="[font-family:var(--font-body)] [font-weight:300] [text-transform:uppercase] [letter-spacing:1px] [font-size:0.75rem] [color:var(--color-muted)] [margin-top:0.35rem]">{label}</div>
      {sub && <div className="[font-size:0.7rem] [font-weight:300] [color:var(--color-muted)] [margin-top:0.25rem]">{sub}</div>}
    </div>
  </div>;


const StatLoadingDots = () =>
<span className="stat-loading-dots" aria-label="Loading">
    <i />
    <i />
    <i />
  </span>;


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
        hotelList = hotelList.filter((hotel) => getHotelOwnerId(hotel) === getUserId());
      }

      // Fetch bookings based on role
      let bookings = [];
      if (isAdminHotel) {
        // For admin hotel, fetch bookings for each of their hotels
        const bookingResults = await Promise.all(
          hotelList.map((hotel) => api.get(`/api/bookings/hotel/${hotel.id_hotel ?? hotel.idHotel}`).
          then((res) => unwrapList(res.data)).
          catch(() => []))
        );
        bookings = bookingResults.flat();
      } else {
        // For admin app, fetch all bookings
        const bookingsResp = await api.get('/api/bookings', { params: { page: 0, size: 100 } }).catch(() => ({ data: { data: [] } }));
        bookings = unwrapList(bookingsResp.data);
      }

      const confirmed = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED');
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
    const timer = window.setTimeout(loadStats, 0);
    return () => window.clearTimeout(timer);
    // loadStats follows the authenticated admin.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  { label: t('admin.dashboard.pending'), status: 'PENDING', wrapperClass: 'bg-[var(--color-warning-soft)]', iconClass: 'text-[var(--color-warning)]', icon: Clock },
  { label: t('admin.dashboard.confirmed'), status: 'CONFIRMED', wrapperClass: 'bg-[var(--color-success-soft)]', iconClass: 'text-[var(--color-success)]', icon: CheckCircle },
  { label: t('admin.dashboard.cancelled'), status: 'CANCELLED', wrapperClass: 'bg-[var(--color-danger-soft)]', iconClass: 'text-[var(--color-danger)]', icon: XCircle }].
  map((s) => ({ ...s, count: stats.bookings.filter((b) => b.status === s.status).length }));

  const recentBookings = stats.bookings.slice(0, 5);

  return (
    <AdminLayout>
       {isAdminHotel ?
      // Admin Hotel View - Show cards for each hotel they own
      <div className="[display:flex] [flex-direction:column] [gap:2rem]">
           <div className="[display:flex] [justify-content:space-between] [align-items:center] [gap:1rem] [flex-wrap:wrap]">
             <div>
               <h2 className="[font-family:var(--font-heading)] [font-weight:300] [font-size:1.75rem] [text-transform:uppercase] [letter-spacing:1px] [margin:0] [color:var(--color-text)]">{t('admin.dashboard.title')}</h2>
               <p className="[color:var(--color-muted)] [font-weight:300] [font-size:0.85rem] [margin:0.25rem_0_0]">{t('admin.dashboard.welcome')}</p>
             </div>
             {/* No Excel upload for admin hotel users */}
           </div>

           {error &&
        <div className="alert-danger [border-radius:var(--radius-sm)] [padding:0.75rem_1rem] [display:flex] [gap:0.5rem] [align-items:center]">
                <AlertCircle size={16} className="[color:var(--color-danger)] [flex-shrink:0]" />
                <span className="[font-weight:300] [color:var(--color-danger)] [font-size:0.85rem]">{error}</span>
              </div>
        }

            {/* Summary Stats */}
            {!loading && stats.hotelList.length > 0 &&
        <div className="[display:grid] [grid-template-columns:repeat(auto-fill,_minmax(200px,_1fr))] [gap:1rem]">
                <StatCard label={t('admin.dashboard.totalHotels')} value={stats.hotels} icon={Hotel} />
                <StatCard label={t('admin.dashboard.totalBookings')} value={stats.bookings.length} icon={Calendar} />
                <StatCard label={t('admin.dashboard.totalRevenue')} value={formatCurrency(stats.totalRevenue)} icon={TrendingUp} sub={t('admin.dashboard.revenueSub')} />
              </div>
        }

            {/* Hotel Cards Grid */}
            <div className="[display:grid] [grid-template-columns:repeat(auto-fill,_minmax(320px,_1fr))] [gap:1.5rem]">
               {loading ?
          <LoadingState text={t('admin.dashboard.loading')} compact /> :
          stats.hotelList.length === 0 ?
          <div className="[text-align:center] [color:var(--color-muted)] [padding:3rem_0] [font-weight:300] [font-size:1.1rem]">
                 {t('admin.hotel.nohotels')}
               </div> :

          stats.hotelList.map((hotel) => {
            const hotelBookings = stats.bookings.filter((b) => b.hotel_id === (hotel.id_hotel ?? hotel.idHotel));
            return (
              <div key={hotel.id_hotel ?? hotel.idHotel} className="card cursor-default overflow-hidden border border-[var(--color-accent)] p-0 transition-shadow duration-200 hover:shadow-[var(--shadow-hover)]">
                     {/* Hotel Image */}
                     <div className="[width:100%] [height:160px] [overflow:hidden] [background:var(--color-surface)] [position:relative]">
                       {hotel.images?.[0]?.image_url || hotel.image_url ?
                  <img src={getImageUrl(hotel.images?.[0]?.image_url || hotel.image_url)} alt={hotel.name} className="[width:100%] [height:100%] [object-fit:cover]" /> :

                  <div className="[width:100%] [height:100%] [display:flex] [align-items:center] [justify-content:center] [color:var(--color-muted)] [font-size:0.85rem] [background:var(--color-background)]">
                           <Hotel size={32} className="[opacity:0.3]" />
                         </div>
                  }
                       {hotel.type && <span className="badge badge-gray [position:absolute] [top:0.75rem] [left:0.75rem] [font-size:0.65rem] [font-weight:400]">{hotel.type}</span>}
                       {hotel.rating > 0 &&
                  <div className="[position:absolute] [top:0.75rem] [right:0.75rem] [display:flex] [align-items:center] [gap:0.25rem] [background:rgba(0,0,0,0.5)] [padding:0.2rem_0.5rem] [border-radius:var(--radius-sm)] [font-size:0.75rem] [color:white]">
                           <Star size={12} fill="var(--color-primary)" className="[stroke:var(--color-primary)]" />
                           {hotel.rating.toFixed(1)}
                         </div>
                  }
                     </div>

                     {/* Hotel Info */}
                     <div className="[padding:1.25rem]">
                       <div className="[display:flex] [justify-content:space-between] [align-items:start] [margin-bottom:0.75rem]">
                         <h3 className="[font-family:var(--font-heading)] [font-weight:400] [font-size:1.2rem] [margin:0] [color:var(--color-text)]">
                           {hotel.name}
                         </h3>
                         <div className="[display:flex] [align-items:center] [gap:0.35rem] [font-size:0.8rem] [color:var(--color-primary)] [white-space:nowrap] [margin-left:0.5rem]">
                           <MapPin size={12} className="[flex-shrink:0]" />
                           <span>{hotel.city?.name ?? t('admin.hotel.unknowncity')}</span>
                         </div>
                       </div>
                       <div className="[display:flex] [align-items:center] [gap:1rem] [font-size:0.8rem] [color:var(--color-muted)] [margin-bottom:1rem]">
                         <div className="[display:flex] [align-items:center] [gap:0.3rem]">
                           <UserPlus size={12} className="[color:var(--color-success)]" />
                           <span>{hotel.room_types?.length || 0} {t('admin.hotel.roomtypes')}</span>
                         </div>
                         <div className="[display:flex] [align-items:center] [gap:0.3rem]">
                           <DollarSign size={12} className="[color:var(--color-warning)]" />
                           <span>{t('admin.hotel.avgprice')}: {formatCurrency(hotel.price_per_night ?? 0)}</span>
                         </div>
                       </div>

                    {/* Hotel Stats */}
                    <div className="[margin-bottom:1.5rem]">
                      <div className="[display:grid] [grid-template-columns:repeat(auto-fit,_minmax(100px,_1fr))] [gap:1rem]">
                        <div className="[text-align:center]">
                          <div className="[font-family:var(--font-heading)] [font-weight:400] [font-size:1.5rem] [color:var(--color-text)]">
                            {stats.hotels > 1 ? hotelBookings.length : stats.bookings.length}
                          </div>
                          <div className="[font-size:0.75rem] [color:var(--color-muted)] [text-transform:uppercase]">{t('admin.hotel.totalbookings')}</div>
                        </div>
                        <div className="[text-align:center]">
                          <div className="[font-family:var(--font-heading)] [font-weight:400] [font-size:1.5rem] [color:var(--color-warning)]">
                            {hotelBookings.filter((b) => b.status === 'PENDING').length}
                          </div>
                          <div className="[font-size:0.75rem] [color:var(--color-muted)] [text-transform:uppercase]">{t('admin.hotel.pending')}</div>
                        </div>
                        <div className="[text-align:center]">
                          <div className="[font-family:var(--font-heading)] [font-weight:400] [font-size:1.5rem] [color:var(--color-success)]">
                            {hotelBookings.filter((b) => b.status === 'CONFIRMED').length}
                          </div>
                          <div className="[font-size:0.75rem] [color:var(--color-muted)] [text-transform:uppercase]">{t('admin.hotel.confirmed')}</div>
                        </div>
                        <div className="[text-align:center]">
                          <div className="[font-family:var(--font-heading)] [font-weight:400] [font-size:1.5rem] [color:var(--color-danger)]">
                            {hotelBookings.filter((b) => b.status === 'CANCELLED').length}
                          </div>
                          <div className="[font-size:0.75rem] [color:var(--color-muted)] [text-transform:uppercase]">{t('admin.hotel.cancelled')}</div>
                        </div>
                        <div className="[text-align:center]">
                          <div className="[font-family:var(--font-heading)] [font-weight:400] [font-size:1.5rem] [color:var(--color-primary)]">
                            {formatCurrency(hotelBookings.reduce((sum, b) => sum + (b.total_price || 0), 0))}
                          </div>
                          <div className="[font-size:0.75rem] [color:var(--color-muted)] [text-transform:uppercase]">{t('admin.hotel.revenue')}</div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="[display:flex] [gap:0.75rem] [flex-wrap:wrap]">
                       <Link to={`/admin/hotels/${hotel.id_hotel ?? hotel.idHotel}/rooms`} className="btn btn-outline btn-sm [flex:1] [min-width:80px]">
                         <Layout size={14} /> {t('admin.hotel.managerooms')}
                       </Link>
                       <Link to={`/admin/bookings?hotel_id=${hotel.id_hotel ?? hotel.idHotel}`} className="btn btn-outline btn-sm [flex:1] [min-width:80px]">
                         <Calendar size={14} /> {t('admin.hotel.viewbookings')}
                       </Link>
                       <Link to={`/admin/hotels/${hotel.id_hotel ?? hotel.idHotel}`} className="btn btn-outline btn-sm [flex:1] [min-width:80px]">
                         <Hotel size={14} /> {t('admin.hotel.edithotel')}
                       </Link>
                     </div>
                    </div>
                  </div>);

          })
          }
           </div>
         </div> :

      // Admin App View - Original dashboard (with minor updates)
      <div className="[display:flex] [flex-direction:column] [gap:2rem]">
           <div className="[display:flex] [justify-content:space-between] [align-items:center] [gap:1rem] [flex-wrap:wrap]">
             <div>
               <h2 className="[font-family:var(--font-heading)] [font-weight:300] [font-size:1.75rem] [text-transform:uppercase] [letter-spacing:1px] [margin:0] [color:var(--color-text)]">{t('admin.dashboard.title')}</h2>
               <p className="[color:var(--color-muted)] [font-weight:300] [font-size:0.85rem] [margin:0.25rem_0_0]">{t('admin.dashboard.welcome')}</p>
             </div>
             {!isAdminHotel &&
          <button onClick={() => excelRef.current?.click()} className="btn btn-white btn-sm" disabled={excelUploading}>
                 <Upload size={14} /> {excelUploading ? t('admin.actions.uploading') : t('admin.actions.uploadHotelExcel')}
               </button>
          }
             <input ref={excelRef} type="file" accept=".xlsx" onChange={handleExcelUpload} className="[display:none]" />
           </div>

           {error &&
        <div className="alert-danger [border-radius:var(--radius-sm)] [padding:0.75rem_1rem] [display:flex] [gap:0.5rem] [align-items:center]">
               <AlertCircle size={16} className="[color:var(--color-danger)] [flex-shrink:0]" />
               <span className="[font-weight:300] [color:var(--color-danger)] [font-size:0.85rem]">{error}</span>
             </div>
        }

           {/* Stats Grid */}
           <div className="[display:grid] [grid-template-columns:repeat(auto-fill,_minmax(240px,_1fr))] [gap:1.25rem]">
             <StatCard label={t('admin.dashboard.totalHotels')} value={loading ? <StatLoadingDots /> : stats.hotels} icon={Hotel} />
             <StatCard label={t('admin.dashboard.totalBookings')} value={loading ? <StatLoadingDots /> : stats.bookings.length} icon={Calendar} />
             <StatCard label={t('admin.dashboard.totalRevenue')} value={loading ? <StatLoadingDots /> : formatCurrency(stats.totalRevenue)} icon={TrendingUp} sub={t('admin.dashboard.revenueSub')} />
           </div>

           {/* Booking Status Breakdown */}
           <div className="card [padding:1.5rem] [border:1px_solid_var(--color-accent)]">
             <h3 className="[font-family:var(--font-heading)] [font-weight:300] [text-transform:uppercase] [letter-spacing:1px] [font-size:1rem] [margin-bottom:1.25rem] [border-bottom:1px_solid_var(--color-accent)] [padding-bottom:0.75rem] [color:var(--color-text)]">{t('admin.dashboard.bookingStatus')}</h3>
             <div className="[display:grid] [grid-template-columns:repeat(auto-fill,_minmax(200px,_1fr))] [gap:1rem]">
               {bookingStats.map(({ label, count, wrapperClass, iconClass, icon: Icon }) =>
            <div key={label} className="[padding:1.25rem] [border:1px_solid_var(--color-accent)] [border-radius:var(--radius-sm)] [background:var(--color-surface)] [display:flex] [align-items:center] [gap:1rem]">
                   <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-full', wrapperClass)}>
                     <Icon size={16} className={iconClass} />
                   </div>
                   <div>
                     <div className="[font-family:var(--font-heading)] [font-weight:300] [font-size:1.5rem] [line-height:1] [color:var(--color-text)]">{count}</div>
                     <div className="[font-weight:300] [font-size:0.75rem] [color:var(--color-muted)] [text-transform:uppercase] [letter-spacing:0.5px] [margin-top:0.2rem]">{label}</div>
                   </div>
                 </div>
            )}
             </div>
           </div>

           {/* Recent Bookings */}
           <div className="card [padding:1.5rem] [overflow-x:auto] [border:1px_solid_var(--color-accent)]">
             <h3 className="[font-family:var(--font-heading)] [font-weight:300] [text-transform:uppercase] [letter-spacing:1px] [font-size:1rem] [margin-bottom:1.25rem] [border-bottom:1px_solid_var(--color-accent)] [padding-bottom:0.75rem] [color:var(--color-text)]">{t('admin.dashboard.latestBookings')}</h3>
             {loading ?
          <LoadingState text={t('admin.dashboard.loading')} compact /> :
          recentBookings.length === 0 ?
          <div className="[text-align:center] [color:var(--color-muted)] [padding:2rem_0] [font-weight:300] [font-size:0.9rem]">{t('admin.dashboard.emptyBookings')}</div> :

          <table className="neo-table">
                 <thead>
                   <tr>
                     {[t('admin.table.id'), t('admin.table.hotelId'), t('admin.table.booker'), t('admin.table.checkIn'), t('admin.table.total'), t('admin.table.status')].map((h) => <th key={h}>{h}</th>)}
                   </tr>
                 </thead>
                 <tbody>
                   {recentBookings.map((b) =>
              <tr key={b.id_booking || b.id}>
                       <td className="[font-weight:400] [color:var(--color-muted)] [font-size:0.85rem]">#{b.id_booking || b.id}</td>
                       <td className="[font-size:0.85rem] [color:var(--color-text)] [font-weight:300]">Hotel #{b.hotel_id}</td>
                       <td className="[font-size:0.85rem] [color:var(--color-text)] [font-weight:300]">{b.orderer_name}</td>
                       <td className="[font-size:0.85rem] [color:var(--color-text)] [font-weight:300]">{b.check_in}</td>
                       <td className="[font-weight:400] [color:var(--color-primary)] [font-size:0.85rem]">{formatCurrency(b.total_price)}</td>
                       <td>
                         <span className={cn(`badge badge-${b.status === 'PENDING' ? 'orange' : b.status === 'CONFIRMED' ? 'green' : b.status === 'CANCELLED' ? 'red' : 'gray'}`, "[font-size:0.7rem]")}>
                           {b.status}
                         </span>
                       </td>
                     </tr>
              )}
                 </tbody>
               </table>
          }
           </div>
         </div>
      }
     </AdminLayout>);

};

export default AdminDashboard;
