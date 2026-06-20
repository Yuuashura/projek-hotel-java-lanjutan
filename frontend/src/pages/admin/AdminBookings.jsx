import { useState, useEffect, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { Search, Check, X, AlertCircle, Eye, Download } from 'lucide-react';
import { formatCurrency, formatDate, statusColor } from '../../utils/formatters';
import AdminLayout from '../../components/admin/AdminLayout';
import PaginationControls from '../../components/admin/PaginationControls';
import LoadingState from '../../components/LoadingState';
import api from '../../utils/api';
import { getErrorMessage, unwrapList } from '../../utils/response';
import { usePreferences } from '../../context/PreferencesContext';
import { useAuth } from '../../context/AuthContext';

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
const PAGE_SIZE = 25;

const AdminBookings = () => {
  const { t } = usePreferences();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [excelDownloading, setExcelDownloading] = useState(false);

  const getHotelId = (booking) => booking.hotel_id ?? booking.hotelId;
  const getUserId = () => user?.id_customer ?? user?.idCustomer ?? user?.userId ?? user?.id;
  const getHotelOwnerId = (hotel) => hotel?.admin_hotel_id ?? hotel?.adminHotelId;
  const isAdminHotel = user?.role === 'ROLE_ADMIN_HOTEL';

  const enrichHotelNames = async (items) => {
    const hotelIds = [...new Set(items.map(getHotelId).filter(Boolean))];
    const hotels = await Promise.all(
      hotelIds.map((id) => api.get(`/api/hotels/${id}`).then((res) => res.data?.data).catch(() => null))
    );
    const hotelsById = Object.fromEntries(
      hotels.filter(Boolean).map((hotel) => [hotel.id_hotel ?? hotel.idHotel, hotel])
    );

    return items.map((booking) => {
      const hotel = hotelsById[getHotelId(booking)];
      return {
        ...booking,
        hotel_name: hotel?.name || booking.hotel_name,
        hotel_city: hotel?.city?.name || booking.hotel_city
      };
    });
  };

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      if (isAdminHotel) {
        const hotelsRes = await api.get('/api/hotels');
        const ownedHotels = unwrapList(hotelsRes.data).filter((hotel) => getHotelOwnerId(hotel) === getUserId());
        const bookingResults = await Promise.all(
          ownedHotels.map((hotel) => api.get(`/api/bookings/hotel/${hotel.id_hotel ?? hotel.idHotel}`).
          then((res) => unwrapList(res.data)).
          catch(() => []))
        );
        const hotelsById = Object.fromEntries(ownedHotels.map((hotel) => [hotel.id_hotel ?? hotel.idHotel, hotel]));
        const data = bookingResults.flat().map((booking) => {
          const hotel = hotelsById[getHotelId(booking)];
          return {
            ...booking,
            hotel_name: hotel?.name || booking.hotel_name,
            hotel_city: hotel?.city?.name || booking.hotel_city
          };
        });
        setBookings(data);
        return;
      }

      const r = await api.get('/api/bookings');
      const data = unwrapList(r.data);
      const enriched = await enrichHotelNames(data);
      setBookings(enriched);
    } catch (err) {
      setError(getErrorMessage(err, t('admin.errors.loadBookings')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
    // load follows the authenticated admin.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return bookings.filter((b) =>
    (statusFilter === 'ALL' || b.status === statusFilter) && (
    b.orderer_name?.toLowerCase().includes(q) ||
    b.orderer_email?.toLowerCase().includes(q) ||
    b.hotel_name?.toLowerCase().includes(q) ||
    String(b.id_booking || b.id).includes(q))
    );
  }, [search, statusFilter, bookings]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const paginated = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const openDetail = (b) => {setSelected(b);setNewStatus(b.status);setError('');setModal('detail');};
  const getHotelName = (booking) => booking.hotel_name || `Hotel #${getHotelId(booking)}`;

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleExcelDownload = async () => {
    setExcelDownloading(true);
    setError('');
    try {
      const res = await api.get('/api/bookings/download-excel', { responseType: 'blob' });
      downloadBlob(res.data, 'data-pemesanan.xlsx');
    } catch (err) {
      setError(err.response?.data?.message || t('admin.errors.downloadExcelFailed'));
    } finally {
      setExcelDownloading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (newStatus === selected.status) return;
    setSubmitting(true);
    setError('');
    try {
      await api.patch(`/api/bookings/${selected.id_booking || selected.id}/status`, { status: newStatus });
      setModal(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || t('admin.errors.updateBookingStatusFailed'));
    } finally {setSubmitting(false);}
  };

  return (
    <AdminLayout>
      <div className="[display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:2rem] [flex-wrap:wrap] [gap:1rem]">
        <div>
          <h2 className="[font-family:var(--font-heading)] [font-weight:300] [font-size:1.75rem] [text-transform:uppercase] [letter-spacing:1px] [margin:0] [color:var(--color-text)]">{t('admin.bookings.title')}</h2>
          <p className="[color:var(--color-muted)] [font-weight:300] [font-size:0.85rem] [margin:0.25rem_0_0]">{t('admin.bookings.count', { count: filtered.length })}</p>
        </div>
        <div className="[display:flex] [gap:0.5rem] [flex-wrap:wrap] [align-items:center]">
          {!isAdminHotel &&
          <button onClick={handleExcelDownload} className="btn btn-white btn-sm" disabled={excelDownloading}>
              <Download size={14} /> {excelDownloading ? t('admin.actions.downloading') : t('admin.actions.downloadExcel')}
            </button>
          }
          {['ALL', ...STATUS_OPTIONS].map((s) => {
            const active = statusFilter === s;
            return (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(0); }} className={cn(
                'cursor-pointer rounded-lg border px-3.5 py-1.5 font-[var(--font-body)] text-xs uppercase tracking-[0.5px] transition',
                active
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)] font-normal text-white'
                  : 'border-[var(--color-accent)] bg-[var(--color-surface)] font-light text-[var(--color-muted)]',
              )}>{s}</button>);

          })}
        </div>
      </div>

      {/* Search */}
      <div className="[position:relative] [max-width:360px] [margin-bottom:1.5rem]">
        <Search size={14} className="[position:absolute] [left:0.75rem] [top:50%] [transform:translateY(-50%)] [color:var(--color-muted)]" />
        <input className="input [padding-left:2.25rem] [height:2.25rem]" placeholder={t('admin.bookings.searchPlaceholder')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
      </div>

      {error &&
      <div className="alert-danger [border-radius:var(--radius-sm)] [padding:0.75rem_1rem] [margin-bottom:1.25rem] [display:flex] [gap:0.5rem] [align-items:center]">
          <AlertCircle size={16} className="[color:var(--color-danger)] [flex-shrink:0]" />
          <span className="[font-weight:300] [color:var(--color-danger)] [font-size:0.85rem]">{error}</span>
        </div>
      }

      {loading ?
      <LoadingState text={t('admin.bookings.loading')} compact /> :

      <div className="[overflow-x:auto]">
          <table className="neo-table">
            <thead>
              <tr>{[t('admin.table.id'), t('admin.table.booker'), t('admin.table.hotel'), t('admin.table.checkIn'), t('admin.table.checkOut'), t('admin.table.total'), t('admin.table.status'), t('admin.table.actions')].map((h) => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {paginated.map((b) => {
              const { label } = statusColor(b.status);
              // Simplify status matching for styling
              const badgeClass = b.status === 'PENDING' ? 'orange' : b.status === 'CONFIRMED' ? 'green' : b.status === 'CANCELLED' ? 'red' : 'gray';
              return (
                <tr key={b.id_booking || b.id}>
                    <td className="[font-weight:400] [color:var(--color-muted)] [font-size:0.85rem]">#{b.id_booking || b.id}</td>
                    <td>
                      <div className="[font-weight:400] [font-size:0.9rem] [color:var(--color-text)]">{b.orderer_name}</div>
                      <div className="[color:var(--color-muted)] [font-size:0.75rem] [font-weight:300] [margin-top:0.15rem]">{b.orderer_email}</div>
                    </td>
                    <td className="[font-size:0.85rem] [color:var(--color-text)] [font-weight:300]">
                      <div className="[font-weight:400]">{getHotelName(b)}</div>
                      {b.hotel_city && <div className="[color:var(--color-muted)] [font-size:0.72rem] [margin-top:0.15rem]">{b.hotel_city}</div>}
                    </td>
                    <td className="[font-size:0.85rem] [color:var(--color-text)] [font-weight:300]">{formatDate(b.check_in)}</td>
                    <td className="[font-size:0.85rem] [color:var(--color-text)] [font-weight:300]">{formatDate(b.check_out)}</td>
                    <td className="[font-weight:400] [color:var(--color-primary)] [font-size:0.85rem]">{formatCurrency(b.total_price)}</td>
                    <td>
                      <span className={cn(`badge badge-${badgeClass}`, "[font-size:0.7rem]")}>{label}</span>
                    </td>
                    <td>
                      <button onClick={() => openDetail(b)} className="btn btn-white btn-sm [padding:0.4rem_0.8rem]"><Eye size={12} className="[margin-right:0.25rem]" /> {t('admin.actions.details')}</button>
                    </td>
                  </tr>);

            })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="card [text-align:center] [padding:3rem] [color:var(--color-muted)] [font-weight:300] [font-size:0.9rem]">{t('admin.bookings.empty')}</div>}
          <PaginationControls
          page={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage} />

        </div>
      }

      {/* Detail Modal */}
      {modal === 'detail' && selected &&
      <div onClick={(e) => e.target === e.currentTarget && setModal(null)} className="[position:fixed] [inset:0] [background:rgba(26,54,93,0.3)] [backdrop-filter:blur(4px)] [display:flex] [align-items:center] [justify-content:center] [z-index:200] [padding:1rem]">
          <div className="[background:var(--color-surface)] [border:1px_solid_var(--color-accent)] [border-radius:var(--radius-sm)] [padding:2rem] [width:100%] [max-width:560px] [max-height:90vh] [overflow-y:auto] [box-shadow:var(--shadow-hover)] [animation:fadeIn_0.2s_ease-out]">
            <div className="[display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:1.5rem] [border-bottom:1px_solid_var(--color-accent)] [padding-bottom:0.75rem]">
              <h3 className="[font-family:var(--font-heading)] [font-weight:300] [text-transform:uppercase] [letter-spacing:1px] [font-size:1.2rem] [margin:0] [color:var(--color-text)]">{t('admin.bookings.detailTitle', { id: selected.id_booking || selected.id })}</h3>
              <button onClick={() => setModal(null)} className="[background:none] [border:none] [cursor:pointer] [color:var(--color-muted)]"><X size={18} /></button>
            </div>

            <div className="[display:grid] [grid-template-columns:1fr_1fr] [gap:1.25rem] [margin-bottom:1.5rem]">
              {[
            { l: t('admin.table.hotel'), v: getHotelName(selected) },
            { l: t('admin.table.booker'), v: selected.orderer_name },
            { l: t('admin.table.email'), v: selected.orderer_email },
            { l: t('admin.table.phone'), v: selected.orderer_phone },
            { l: t('admin.table.checkIn'), v: formatDate(selected.check_in) },
            { l: t('admin.table.checkOut'), v: formatDate(selected.check_out) },
            { l: t('admin.table.guests'), v: t('admin.bookings.guestCount', { count: selected.number_of_guest }) },
            { l: t('admin.table.total'), v: formatCurrency(selected.total_price) },
            { l: t('admin.table.paymentMethod'), v: selected.payment_method || '-' }].
            map(({ l, v }) =>
            <div key={l}>
                  <div className="[font-family:var(--font-body)] [font-weight:300] [font-size:0.65rem] [text-transform:uppercase] [color:var(--color-muted)] [margin-bottom:0.2rem] [letter-spacing:0.5px]">{l}</div>
                  <div className="[font-weight:400] [font-size:0.875rem] [color:var(--color-text)]">{v}</div>
                </div>
            )}
            </div>

            {selected.payment_proof &&
          <div className="[margin-bottom:1.5rem]">
                <div className="[font-family:var(--font-body)] [font-weight:300] [font-size:0.65rem] [text-transform:uppercase] [color:var(--color-muted)] [margin-bottom:0.5rem] [letter-spacing:0.5px]">{t('admin.bookings.paymentProof')}</div>
                {selected.payment_proof.startsWith('data:image') || selected.payment_proof.match(/\.(jpeg|jpg|gif|png)$/) != null ?
            <img src={selected.payment_proof} alt={t('admin.bookings.paymentProof')} className="[max-width:100%] [max-height:240px] [object-fit:contain] [border:1px_solid_var(--color-accent)] [border-radius:var(--radius-sm)] [background:var(--color-background)] [padding:4px]" /> :

            <a href={selected.payment_proof} target="_blank" rel="noopener noreferrer" className="btn btn-white btn-sm [display:inline-flex] [align-items:center]">{t('admin.bookings.viewPaymentProof')}</a>
            }
              </div>
          }

            <div className="[border-top:1px_dashed_var(--color-accent)] [padding-top:1.25rem]">
              <label className="label">{t('admin.bookings.updateStatus')}</label>
              <select className="input [margin-bottom:1.25rem]" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              {error && <div className="[color:var(--color-danger)] [font-weight:300] [font-size:0.85rem] [margin-bottom:0.75rem] [display:flex] [gap:0.4rem] [align-items:center]"><AlertCircle size={14} />{error}</div>}

              <div className="[display:flex] [gap:0.75rem]">
                <button onClick={handleUpdateStatus} className="btn btn-primary btn-sm [flex:1] [justify-content:center]" disabled={submitting || newStatus === selected.status}>
                  {submitting ? t('admin.actions.saving') : <><Check size={14} /> {t('admin.actions.saveStatus')}</>}
                </button>
                <button onClick={() => setModal(null)} className="btn btn-white btn-sm">{t('admin.actions.close')}</button>
              </div>
            </div>
          </div>
        </div>
      }
    </AdminLayout>);

};

export default AdminBookings;
