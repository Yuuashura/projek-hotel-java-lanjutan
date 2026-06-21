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
    const hotelIds = [...new Set(items.filter((item) => !item.hotel_name).map(getHotelId).filter(Boolean))];
    if (hotelIds.length === 0) return items;
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
          <button onClick={handleExcelDownload} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--color-text)] backdrop-blur-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-background)] min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem]" disabled={excelDownloading}>
              <Download size={14} /> {excelDownloading ? t('admin.actions.downloading') : t('admin.actions.downloadExcel')}
            </button>
          }
          {['ALL', ...STATUS_OPTIONS].map((s) => {
            const active = statusFilter === s;
            return (
              <button key={s} onClick={() => {setStatusFilter(s);setPage(0);}} className={cn(
                'cursor-pointer rounded-lg border px-3.5 py-1.5 font-[var(--font-body)] text-xs uppercase tracking-[0.5px] transition',
                active ?
                'border-[var(--color-primary)] bg-[var(--color-primary)] font-normal text-white' :
                'border-[var(--color-accent)] bg-[var(--color-surface)] font-light text-[var(--color-muted)]'
              )}>{s}</button>);

          })}
        </div>
      </div>

      {/* Search */}
      <div className="[position:relative] [max-width:360px] [margin-bottom:1.5rem]">
        <Search size={14} className="[position:absolute] [left:0.75rem] [top:50%] [transform:translateY(-50%)] [color:var(--color-muted)]" />
        <input className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm [padding-left:2.25rem] [height:2.25rem]" placeholder={t('admin.bookings.searchPlaceholder')} value={search} onChange={(e) => {setSearch(e.target.value);setPage(0);}} />
      </div>

      {error &&
      <div className="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger)] [border-radius:var(--radius-sm)] [padding:0.75rem_1rem] [margin-bottom:1.25rem] [display:flex] [gap:0.5rem] [align-items:center]">
          <AlertCircle size={16} className="[color:var(--color-danger)] [flex-shrink:0]" />
          <span className="[font-weight:300] [color:var(--color-danger)] [font-size:0.85rem]">{error}</span>
        </div>
      }

      {loading ?
      <LoadingState text={t('admin.bookings.loading')} compact /> :

      <div className="[overflow-x:auto]">
          <table className="w-full min-w-[720px] border-collapse overflow-hidden rounded-lg border border-[var(--color-accent)] bg-[var(--glass-bg)] text-left text-sm [&_th]:border-b-2 [&_th]:border-[var(--color-accent)] [&_th]:bg-[var(--color-background)] [&_th]:px-4 [&_th]:py-3 [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:text-[var(--color-text)] [&_td]:border-b [&_td]:border-[var(--color-accent)] [&_td]:px-4 [&_td]:py-3 [&_td]:text-[var(--color-text)] [&_td]:align-middle [&_tbody_tr:hover_td]:bg-[var(--color-background)] max-sm:[&_th]:px-3 max-sm:[&_th]:py-3 max-sm:[&_td]:px-3 max-sm:[&_td]:py-3">
            <thead>
              <tr>{[t('admin.table.id'), t('admin.table.booker'), t('admin.table.hotel'), t('admin.table.checkIn'), t('admin.table.checkOut'), t('admin.table.total'), t('admin.table.status'), t('admin.table.actions')].map((h) => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {paginated.map((b) => {
              const { label } = statusColor(b.status);
              const badgeClass = b.status === 'PENDING'
                ? 'border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] text-[var(--color-warning)]'
                : b.status === 'CONFIRMED'
                  ? 'border-[var(--color-success-border)] bg-[var(--color-success-soft)] text-[var(--color-success)]'
                  : b.status === 'CANCELLED'
                    ? 'border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]'
                    : 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-muted)]';
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
                      <span className={cn('inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[0.7rem] font-medium uppercase', badgeClass)}>{label}</span>
                    </td>
                    <td>
                      <button onClick={() => openDetail(b)} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--color-text)] backdrop-blur-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-background)] min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem] [padding:0.4rem_0.8rem]"><Eye size={12} className="[margin-right:0.25rem]" /> {t('admin.actions.details')}</button>
                    </td>
                  </tr>);

            })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--color-text)] shadow-[var(--shadow-float)] backdrop-blur-xl transition-all duration-300 [text-align:center] [padding:3rem] [color:var(--color-muted)] [font-weight:300] [font-size:0.9rem]">{t('admin.bookings.empty')}</div>}
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

            <a href={selected.payment_proof} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--color-text)] backdrop-blur-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-background)] min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem] [display:inline-flex] [align-items:center]">{t('admin.bookings.viewPaymentProof')}</a>
            }
              </div>
          }

            <div className="[border-top:1px_dashed_var(--color-accent)] [padding-top:1.25rem]">
              <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">{t('admin.bookings.updateStatus')}</label>
              <select className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm [margin-bottom:1.25rem]" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              {error && <div className="[color:var(--color-danger)] [font-weight:300] [font-size:0.85rem] [margin-bottom:0.75rem] [display:flex] [gap:0.4rem] [align-items:center]"><AlertCircle size={14} />{error}</div>}

              <div className="[display:flex] [gap:0.75rem]">
                <button onClick={handleUpdateStatus} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[color-mix(in_srgb,var(--color-primary)_46%,transparent)] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))] text-[#061426] hover:brightness-105 min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem] [flex:1] [justify-content:center]" disabled={submitting || newStatus === selected.status}>
                  {submitting ? t('admin.actions.saving') : <><Check size={14} /> {t('admin.actions.saveStatus')}</>}
                </button>
                <button onClick={() => setModal(null)} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--color-text)] backdrop-blur-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-background)] min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem]">{t('admin.actions.close')}</button>
              </div>
            </div>
          </div>
        </div>
      }
    </AdminLayout>);

};

export default AdminBookings;
