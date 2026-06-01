import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminBookingDetailModal, { STATUS_OPTIONS } from '../../components/admin/bookings/AdminBookingDetailModal';
import AdminBookingsTable from '../../components/admin/bookings/AdminBookingsTable';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminSearchInput from '../../components/admin/AdminSearchInput';
import LoadingState from '../../components/LoadingState';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import api from '../../utils/api';
import { getErrorMessage, unwrapList } from '../../utils/response';
import { usePreferences } from '../../context/PreferencesContext';

const PAGE_SIZE = 25;

const AdminBookings = () => {
  const { t } = usePreferences();
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
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

  const enrichHotelNames = async (items) => {
    const hotelIds = [...new Set(items.map(getHotelId).filter(Boolean))];
    const hotels = await Promise.all(
      hotelIds.map(id => api.get(`/api/hotels/${id}`).then(res => res.data?.data).catch(() => null))
    );
    const hotelsById = Object.fromEntries(
      hotels.filter(Boolean).map(hotel => [hotel.id_hotel ?? hotel.idHotel, hotel])
    );

    return items.map(booking => {
      const hotel = hotelsById[getHotelId(booking)];
      return {
        ...booking,
        hotel_name: hotel?.name || booking.hotel_name,
        hotel_city: hotel?.city?.name || booking.hotel_city,
      };
    });
  };

  const load = () => {
    setLoading(true);
    setError('');
    api.get('/api/bookings').then(async r => {
      const data = unwrapList(r.data);
      const enriched = await enrichHotelNames(data);
      setBookings(enriched);
      setFiltered(enriched);
    }).catch((err) => setError(getErrorMessage(err, t('admin.errors.loadBookings')))).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(bookings.filter(b =>
      (statusFilter === 'ALL' || b.status === statusFilter) &&
      (b.orderer_name?.toLowerCase().includes(q)
        || b.orderer_email?.toLowerCase().includes(q)
        || b.hotel_name?.toLowerCase().includes(q)
        || String(b.id_booking || b.id).includes(q))
    ));
  }, [search, statusFilter, bookings]);

  useEffect(() => { setPage(0); }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const paginated = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const openDetail = (b) => { setSelected(b); setNewStatus(b.status); setError(''); setModal('detail'); };
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
    } finally { setSubmitting(false); }
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title={t('admin.bookings.title')}
        subtitle={t('admin.bookings.count', { count: filtered.length })}
        actions={(
          <>
          <Button onClick={handleExcelDownload} variant="white" size="sm" disabled={excelDownloading}>
            <Download size={14} /> {excelDownloading ? t('admin.actions.downloading') : t('admin.actions.downloadExcel')}
          </Button>
          {['ALL', ...STATUS_OPTIONS].map(s => {
            const active = statusFilter === s;
            return (
              <Button key={s} onClick={() => setStatusFilter(s)} variant={active ? 'primary' : 'white'} size="sm">
                {s}
              </Button>
            );
          })}
          </>
        )}
      />

      <AdminSearchInput placeholder={t('admin.bookings.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} className="mb-6" />

      {error && <Alert type="danger">{error}</Alert>}

      {loading ? (
        <LoadingState text={t('admin.bookings.loading')} compact />
      ) : (
        <AdminBookingsTable
          bookings={paginated}
          filteredCount={filtered.length}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
          t={t}
          getHotelName={getHotelName}
          onDetail={openDetail}
          onPageChange={setPage}
        />
      )}

      {modal === 'detail' && selected && (
        <AdminBookingDetailModal
          booking={selected}
          t={t}
          error={error}
          newStatus={newStatus}
          setNewStatus={setNewStatus}
          submitting={submitting}
          getHotelName={getHotelName}
          onClose={() => setModal(null)}
          onSave={handleUpdateStatus}
        />
      )}
    </AdminLayout>
  );
};

export default AdminBookings;
