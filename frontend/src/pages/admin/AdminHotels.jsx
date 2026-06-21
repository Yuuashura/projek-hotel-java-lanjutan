import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Check, AlertCircle, Star, MapPin, Bed, ImageIcon, Upload, Download, UserCog, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import PaginationControls from '../../components/admin/PaginationControls';
import LoadingState from '../../components/LoadingState';
import api from '../../utils/api';
import CitySearchSelect from '../../components/CitySearchSelect';
import { getErrorMessage, unwrapList } from '../../utils/response';
import { uploadFile, validateImageFile, getImageUrl } from '../../utils/uploads';
import { usePreferences } from '../../context/PreferencesContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { cachedGet } from '../../utils/requestCache';

const EMPTY_FORM = { name: '', city_id: '', address: '', type: '', description: '', is_featured: false, is_on_sale: false, discount_percent: 0, rating: 0, image_url: '', admin_hotel_id: '', facility_ids: [] };
const PAGE_SIZE = 25;

const normalizePagination = (pagination, fallbackPage, fallbackCount) => ({
  currentPage: pagination?.current_page ?? pagination?.currentPage ?? fallbackPage,
  pageSize: pagination?.page_size ?? pagination?.pageSize ?? PAGE_SIZE,
  totalItems: pagination?.total_items ?? pagination?.totalItems ?? fallbackCount,
  totalPages: pagination?.total_pages ?? pagination?.totalPages ?? 1,
  hasNext: pagination?.has_next ?? pagination?.hasNext ?? false,
  hasPrevious: pagination?.has_previous ?? pagination?.hasPrevious ?? false
});

const AdminHotels = () => {
  const { t } = usePreferences();
  const { user } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [cities, setCities] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imagesList, setImagesList] = useState([]);
  const [page, setPage] = useState(0);
  const [adminHotelList, setAdminHotelList] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [excelUploading, setExcelUploading] = useState(false);
  const [excelDownloading, setExcelDownloading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    pageSize: PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false
  });
  const fileRef = useRef();
  const excelRef = useRef();
  const isAdminHotel = user?.role === 'ROLE_ADMIN_HOTEL';

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    const hotelParams = isAdminHotel ? {} : { page, size: PAGE_SIZE };
    Promise.all([
    api.get('/api/hotels', { params: hotelParams }),
    cachedGet('/api/cities'),
    api.get('/api/facilities'),
    !isAdminHotel ? api.get('/api/users/admin-hotels').catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } })]
    ).then(([h, c, f, a]) => {
      const hotelList = unwrapList(h.data);
      const userId = user?.id_customer ?? user?.idCustomer ?? user?.userId ?? user?.id;
      const visibleHotels = isAdminHotel ?
      hotelList.filter((hotel) => (hotel?.admin_hotel_id ?? hotel?.adminHotelId) === userId) :
      hotelList;
      setHotels(visibleHotels);
      setPagination(isAdminHotel ?
      normalizePagination(null, 0, visibleHotels.length) :
      normalizePagination(h.data?.pagination, page, visibleHotels.length));
      setCities(unwrapList(c.data));
      setFacilities(unwrapList(f.data));
      setAdminHotelList(unwrapList(a.data));
    }).catch((err) => setError(getErrorMessage(err, t('admin.errors.loadHotels')))).finally(() => setLoading(false));
  }, [isAdminHotel, page, t, user]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setImagesList([]);
    setError('');
    setModal('create');
  };

  const openEdit = async (h) => {
    setError('');
    let hotel;
    try {
      const res = await api.get(`/api/hotels/${h.id_hotel}`);
      hotel = res.data?.data || h;
    } catch {
      hotel = h;
    }

    setSelected(hotel);
    const hotelImgs = hotel.images?.map((img) => img.imageUrl || img.image_url).filter(Boolean) || [];
    const hotelFacilityIds = (hotel.facilities || []).
    map((facility) => facility.id_facility ?? facility.idFacility ?? facility.id).
    filter((id) => id != null).
    map(Number);
    setImagesList(hotelImgs);
    setForm({
      name: hotel.name,
      city_id: hotel.city?.id_city || '',
      address: hotel.address || '',
      type: hotel.type || '',
      description: hotel.description || '',
      is_featured: hotel.featured,
      is_on_sale: hotel.onSale,
      discount_percent: hotel.discount_percent || 0,
      rating: hotel.rating || 0,
      image_url: hotelImgs.join('|||'),
      admin_hotel_id: hotel.admin_hotel_id ?? hotel.adminHotelId ?? '',
      facility_ids: hotelFacilityIds
    });
    setModal('edit');
  };

  const openDelete = (h) => {setSelected(h);setModal('delete');};
  const closeModal = () => {setModal(null);setSelected(null);setError('');setImagesList([]);};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        city_id: parseInt(form.city_id),
        address: form.address,
        type: form.type,
        description: form.description,
        featured: form.is_featured,
        onSale: form.is_on_sale,
        discount_percent: parseInt(form.discount_percent || 0),
        rating: parseFloat(form.rating || 0),
        image_url: imagesList.join('|||'),
        admin_hotel_id: Number(form.admin_hotel_id) || 0,
        facility_ids: form.facility_ids.map(Number)
      };
      if (modal === 'create') await api.post('/api/hotels', payload);
      if (modal === 'edit') await api.put(`/api/hotels/${selected.id_hotel}`, payload);
      closeModal();
      if (modal === 'create' && page !== 0) setPage(0);else
      load();
    } catch (err) {
      setError(err.response?.data?.message || t('admin.errors.operationFailed'));
    } finally {setSubmitting(false);}
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await api.delete(`/api/hotels/${selected.id_hotel}`);
      closeModal();
      load();
    } catch (err) {
      setError(err.response?.data?.message || t('admin.errors.deleteHotelFailed'));
    } finally {setSubmitting(false);}
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const invalidFile = files.find((file) => validateImageFile(file));
    if (invalidFile) {
      setError(validateImageFile(invalidFile));
      return;
    }

    setImageUploading(true);
    setError('');
    try {
      const uploadedUrls = await Promise.all(files.map((file) => uploadFile('/api/hotels/upload-image', file)));
      setImagesList((list) => [...list, ...uploadedUrls.filter(Boolean)]);
    } catch (err) {
      setError(err.response?.data?.message || t('admin.errors.uploadHotelImageFailed'));
    } finally {
      setImageUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

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
      if (page !== 0) setPage(0);else
      load();
    } catch (err) {
      setError(err.response?.data?.message || t('admin.errors.uploadExcelFailed'));
    } finally {
      setExcelUploading(false);
      if (excelRef.current) excelRef.current.value = '';
    }
  };

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
      const res = await api.get('/api/hotels/download-excel', { responseType: 'blob' });
      downloadBlob(res.data, 'data-hotel.xlsx');
    } catch (err) {
      setError(err.response?.data?.message || t('admin.errors.downloadExcelFailed'));
    } finally {
      setExcelDownloading(false);
    }
  };

  const totalPages = Math.max(1, pagination.totalPages || 1);
  const currentPage = Math.min(pagination.currentPage ?? page, totalPages - 1);
  const totalItems = pagination.totalItems ?? hotels.length;
  const paginatedHotels = hotels;
  const toggleFacility = (facilityId) => {
    setForm((current) => ({
      ...current,
      facility_ids: current.facility_ids.includes(facilityId) ?
      current.facility_ids.filter((id) => id !== facilityId) :
      [...current.facility_ids, facilityId]
    }));
  };

  return (
    <AdminLayout>
      <div className="[display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:2rem] [flex-wrap:wrap] [gap:1rem]">
        <div>
          <h2 className="[font-family:var(--font-heading)] [font-weight:300] [font-size:1.75rem] [text-transform:uppercase] [letter-spacing:1px] [margin:0] [color:var(--color-text)]">{t('admin.hotels.title')}</h2>
          <p className="[color:var(--color-muted)] [font-weight:300] [font-size:0.85rem] [margin:0.25rem_0_0]">{t('admin.hotels.count', { count: totalItems })}</p>
        </div>
        <div className="[display:flex] [gap:0.75rem] [flex-wrap:wrap]">
          {!isAdminHotel &&
          <>
              <button onClick={handleExcelDownload} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--color-text)] backdrop-blur-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-background)] min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem]" disabled={excelDownloading}>
                <Download size={14} /> {excelDownloading ? t('admin.actions.downloading') : t('admin.actions.downloadExcel')}
              </button>
              <button onClick={() => excelRef.current?.click()} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--color-text)] backdrop-blur-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-background)] min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem]" disabled={excelUploading}>
                <Upload size={14} /> {excelUploading ? t('admin.actions.uploading') : t('admin.actions.uploadExcel')}
              </button>
              <button onClick={openCreate} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[color-mix(in_srgb,var(--color-primary)_46%,transparent)] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))] text-[#061426] hover:brightness-105 min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem]"><Plus size={14} /> {t('admin.actions.addHotel')}</button>
            </>
          }
          <input ref={excelRef} type="file" accept=".xlsx" onChange={handleExcelUpload} className="[display:none]" />
        </div>
      </div>

      {error &&
      <div className="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger)] [border-radius:var(--radius-sm)] [padding:0.75rem_1rem] [margin-bottom:1.25rem] [display:flex] [gap:0.5rem] [align-items:center]">
          <AlertCircle size={16} className="[color:var(--color-danger)] [flex-shrink:0]" />
          <span className="[font-weight:300] [color:var(--color-danger)] [font-size:0.85rem]">{error}</span>
        </div>
      }

      {loading ?
      <LoadingState text={t('admin.hotels.loading')} compact /> :

      <div className="[overflow-x:auto]">
          <table className="w-full min-w-[720px] border-collapse overflow-hidden rounded-lg border border-[var(--color-accent)] bg-[var(--glass-bg)] text-left text-sm [&_th]:border-b-2 [&_th]:border-[var(--color-accent)] [&_th]:bg-[var(--color-background)] [&_th]:px-4 [&_th]:py-3 [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:text-[var(--color-text)] [&_td]:border-b [&_td]:border-[var(--color-accent)] [&_td]:px-4 [&_td]:py-3 [&_td]:text-[var(--color-text)] [&_td]:align-middle [&_tbody_tr:hover_td]:bg-[var(--color-background)] max-sm:[&_th]:px-3 max-sm:[&_th]:py-3 max-sm:[&_td]:px-3 max-sm:[&_td]:py-3">
            <thead>
              <tr>{[t('admin.table.number'), t('admin.table.hotel'), t('admin.table.city'), t('admin.table.type'), t('admin.table.rating'), t('admin.table.status'), t('admin.table.actions')].map((h) => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {paginatedHotels.map((h) =>
            <tr key={h.id_hotel}>
                  <td className="[font-weight:400] [color:var(--color-muted)] [font-size:0.85rem]">#{h.id_hotel}</td>
                  <td>
                    <div className="[font-weight:400] [font-size:0.9rem] [color:var(--color-text)]">{h.name}</div>
                    <div className="[color:var(--color-muted)] [font-size:0.75rem] [font-weight:300] [display:flex] [align-items:center] [gap:0.25rem] [margin-top:0.15rem]"><MapPin size={10} />{h.address}</div>
                  </td>
                  <td className="[font-size:0.875rem] [color:var(--color-text)] [font-weight:300]">{h.city?.name}</td>
                  <td><span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-accent)] bg-[var(--color-background)] px-3 py-1 text-[0.7rem] font-medium uppercase text-[var(--color-text)] max-sm:px-2.5 max-sm:py-1 max-sm:text-[0.64rem] border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-muted)]">{h.type}</span></td>
                  <td className="[color:var(--color-primary)] [font-size:0.875rem] [font-weight:400]">
                    <div className="[display:flex] [align-items:center] [gap:0.25rem]">
                      <Star size={12} fill="var(--color-primary)" className="[stroke:var(--color-primary)]" />
                      {h.rating?.toFixed(1) || '0.0'}
                    </div>
                  </td>
                  <td>
                    <div className="[display:flex] [gap:0.35rem] [flex-wrap:wrap]">
                      {h.featured && <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-accent)] bg-[var(--color-background)] px-3 py-1 text-[0.7rem] font-medium uppercase text-[var(--color-text)] max-sm:px-2.5 max-sm:py-1 max-sm:text-[0.64rem] border-[var(--color-primary-soft)] bg-[var(--color-primary-soft)] text-[var(--color-primary)] [background:var(--color-primary)] [color:white] [border-color:transparent]">Featured</span>}
                      {h.onSale && <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-accent)] bg-[var(--color-background)] px-3 py-1 text-[0.7rem] font-medium uppercase text-[var(--color-text)] max-sm:px-2.5 max-sm:py-1 max-sm:text-[0.64rem] border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]">-{h.discount_percent}%</span>}
                    </div>
                  </td>
                  <td>
                    <div className="[display:flex] [gap:0.5rem]">
                      <Link to={`/admin/hotels/${h.id_hotel}/rooms`} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--color-text)] backdrop-blur-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-background)] min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem] [padding:0.4rem_0.8rem]" title={t('admin.hotels.manageRooms')}><Bed size={13} /></Link>
                      <button onClick={() => openEdit(h)} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--color-text)] backdrop-blur-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-background)] min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem] [padding:0.4rem_0.8rem]" title={t('admin.hotels.editHotel')}><Pencil size={13} /></button>
                       {!isAdminHotel && <button onClick={() => openDelete(h)} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--color-text)] backdrop-blur-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-background)] min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem] [padding:0.4rem_0.8rem] [color:var(--color-danger)]" title={t('admin.hotels.deleteHotel')}><Trash2 size={13} /></button>}
                    </div>
                  </td>
                </tr>
            )}
            </tbody>
          </table>
          {hotels.length === 0 && <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--color-text)] shadow-[var(--shadow-float)] backdrop-blur-xl transition-all duration-300 [text-align:center] [padding:3rem] [color:var(--color-muted)] [font-weight:300] [font-size:0.9rem]">{t('admin.hotels.empty')}</div>}
          <PaginationControls
          page={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pagination.pageSize || PAGE_SIZE}
          onPageChange={setPage} />

        </div>
      }

      {/* Create/Edit Modal */}
      {(modal === 'create' || modal === 'edit') &&
      <ModalOverlay onClose={closeModal}>
          <div className="[font-family:var(--font-heading)] [font-weight:300] [text-transform:uppercase] [letter-spacing:1px] [font-size:1.2rem] [margin-bottom:1.5rem] [border-bottom:1px_solid_var(--color-accent)] [padding-bottom:0.75rem] [display:flex] [justify-content:space-between] [align-items:center] [color:var(--color-text)]">
            {modal === 'create' ? t('admin.hotels.createTitle') : t('admin.hotels.editTitle')}
            <button onClick={closeModal} className="[background:none] [border:none] [cursor:pointer] [color:var(--color-muted)]"><X size={18} /></button>
          </div>
          {error && <div className="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger)] [border-radius:var(--radius-sm)] [padding:0.75rem] [margin-bottom:1.25rem] [font-weight:300] [color:var(--color-danger)] [font-size:0.85rem] [display:flex] [gap:0.5rem] [align-items:center]"><AlertCircle size={16} />{error}</div>}
          <form onSubmit={handleSubmit} className="[display:flex] [flex-direction:column] [gap:1.25rem]">
            <div className="[display:flex] [flex-direction:column] [gap:1.25rem]">
              <div className="[display:grid] [grid-template-columns:1fr_1fr] [gap:1.25rem]">
                <div><label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">{t('admin.hotels.name')}</label><input className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required /></div>
                <div><label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">{t('common.city')} *</label><CitySearchSelect cities={cities} value={form.city_id} onChange={(val) => setForm((f) => ({ ...f, city_id: val }))} placeholder={t('home.allCities')} /></div>
              </div>
              <div><label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">Alamat</label><input className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} /></div>
              <div className="[display:grid] [grid-template-columns:1fr_1fr] [gap:1.25rem]">
                <div><label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">{t('admin.hotels.type')}</label><select className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}><option value="">{t('admin.hotels.chooseType')}</option>{['Budget', 'Bintang 2', 'Bintang 3', 'Bintang 4', 'Bintang 5', 'Resort', 'Boutique'].map((t) => <option key={t}>{t}</option>)}</select></div>
                <div><label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">Rating (0-5)</label><input type="number" className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm" min={0} max={5} step={0.1} value={form.rating} onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))} /></div>
              </div>
              <div><label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">{t('admin.rooms.description')}</label><textarea className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm [resize:vertical]" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]"><Sparkles size={12} className="[display:inline] [margin-right:0.4rem] [vertical-align:middle]" />{t('admin.hotels.facilities')}</label>
                <p className="[color:var(--color-muted)] [font-size:0.78rem] [line-height:1.5] [margin:0_0_0.75rem]">
                  {t('admin.hotels.facilitiesHint')}
                </p>
                {facilities.length > 0 ?
              <div className="[display:grid] [grid-template-columns:repeat(auto-fit,_minmax(150px,_1fr))] [gap:0.65rem]">
                    {facilities.map((facility) => {
                  const facilityId = Number(facility.id_facility ?? facility.idFacility ?? facility.id);
                  const selectedFacility = form.facility_ids.includes(facilityId);
                  return (
                    <button
                      key={facilityId}
                      type="button"
                      onClick={() => toggleFacility(facilityId)}
                      aria-pressed={selectedFacility}
                      className={cn(
                        'flex min-h-[42px] cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-[0.82rem] text-[var(--color-text)]',
                        selectedFacility ?
                        'border-[var(--color-primary)] bg-[var(--color-primary-soft)]' :
                        'border-[var(--color-accent)] bg-[var(--color-surface)]'
                      )}>

                          <span className={cn(
                        'grid size-[18px] shrink-0 place-items-center rounded text-white',
                        selectedFacility ?
                        'border border-[var(--color-primary)] bg-[var(--color-primary)]' :
                        'border border-[var(--color-muted)] bg-transparent'
                      )}>
                            {selectedFacility && <Check size={12} />}
                          </span>
                          <span>{facility.name}</span>
                        </button>);

                })}
                  </div> :

              <div className="[color:var(--color-muted)] [font-size:0.82rem] [padding:0.75rem] [border:1px_dashed_var(--color-accent)]">
                    {t('admin.hotels.noFacilities')}
                  </div>
              }
              </div>

              {!isAdminHotel &&
            <div><label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]"><UserCog size={12} className="[display:inline] [margin-right:0.4rem] [vertical-align:middle]" />{t('admin.hotels.adminHotel')}</label>
                  <select className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm" value={form.admin_hotel_id} onChange={(e) => setForm((f) => ({ ...f, admin_hotel_id: e.target.value }))}>
                    <option value="">{t('admin.hotels.chooseAdminHotel')}</option>
                    {adminHotelList.map((ah) => <option key={ah.id_customer || ah.id} value={ah.id_customer || ah.id}>{ah.first_name} {ah.last_name} ({ah.email})</option>)}
                  </select>
                </div>
            }

              {/* Multiple Images Upload Section */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]"><ImageIcon size={12} className="[display:inline] [margin-right:0.4rem] [vertical-align:middle]" />{t('admin.hotels.gallery')}</label>
                <div className="[display:grid] [grid-template-columns:repeat(auto-fill,_minmax(90px,_1fr))] [gap:0.75rem] [margin-bottom:0.5rem]">
                  {imagesList.map((img, idx) =>
                <div key={idx} className="[position:relative] [height:75px] [border:1px_solid_var(--color-accent)] [border-radius:var(--radius-sm)] [overflow:hidden]">
                      <img src={getImageUrl(img)} alt="" className="[width:100%] [height:100%] [object-fit:cover]" />
                      <button type="button" onClick={() => setImagesList((list) => list.filter((_, i) => i !== idx))} className="[position:absolute] [top:4px] [right:4px] [background:rgba(0,0,0,0.6)] [color:white] [border:none] [border-radius:50%] [width:18px] [height:18px] [display:flex] [align-items:center] [justify-content:center] [cursor:pointer] [font-size:10px]">

                        <X size={10} />
                      </button>
                    </div>
                )}
                  <div
                  onClick={() => fileRef.current?.click()} className="[border:1px_dashed_var(--color-primary)] [border-radius:var(--radius-sm)] [height:75px] [display:flex] [flex-direction:column] [align-items:center] [justify-content:center] [cursor:pointer] [background:rgba(212,175,55,0.02)] [transition:all_0.2s]">


                    <Plus size={16} className="[color:var(--color-primary)]" />
                    <span className="[font-size:0.65rem] [color:var(--color-primary)] [margin-top:0.25rem] [text-transform:uppercase] [letter-spacing:0.5px]">{imageUploading ? 'Uploading' : 'Upload'}</span>
                  </div>
                </div>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImageUpload} className="[display:none]" />
              </div>

              <div className="[display:grid] [grid-template-columns:1fr_1fr] [gap:1.25rem]">
                <div className={cn('flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--color-accent)] p-3 transition', form.is_featured ? 'bg-[var(--color-primary-soft)]' : 'bg-[var(--color-surface)]')} onClick={() => setForm((f) => ({ ...f, is_featured: !f.is_featured }))}>
                  <input type="checkbox" checked={form.is_featured} readOnly className="[width:15px] [height:15px] [accent-color:var(--color-primary)]" />
                  <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem] [margin:0] [cursor:pointer] [color:var(--color-text)]">Is Featured</label>
                </div>
                <div className={cn('flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--color-accent)] p-3 transition', form.is_on_sale ? 'bg-[var(--color-danger-soft)]' : 'bg-[var(--color-surface)]')} onClick={() => setForm((f) => ({ ...f, is_on_sale: !f.is_on_sale }))}>
                  <input type="checkbox" checked={form.is_on_sale} readOnly className="[width:15px] [height:15px] [accent-color:var(--color-danger)]" />
                  <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem] [margin:0] [cursor:pointer] [color:var(--color-text)]">On Sale</label>
                </div>
              </div>
              {form.is_on_sale && <div><label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">Persen Diskon (%)</label><input type="number" className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm" min={0} max={100} value={form.discount_percent} onChange={(e) => setForm((f) => ({ ...f, discount_percent: e.target.value }))} /></div>}
              <button type="submit" className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[color-mix(in_srgb,var(--color-primary)_46%,transparent)] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))] text-[#061426] hover:brightness-105 w-full [margin-top:0.5rem] [justify-content:center]" disabled={submitting}>
                {submitting ? t('admin.actions.saving') : <><Check size={14} /> {modal === 'create' ? t('admin.actions.addHotel') : t('admin.actions.saveChanges')}</>}
              </button>
            </div>
          </form>
        </ModalOverlay>
      }

      {/* Delete Confirm */}
      {modal === 'delete' && selected &&
      <ModalOverlay onClose={closeModal} maxWidth={400}>
          <div className="[text-align:center] [padding:1rem_0]">
            <div className="[font-size:2.5rem] [margin-bottom:1rem]">🗑️</div>
            <h3 className="[font-family:var(--font-heading)] [font-weight:300] [text-transform:uppercase] [letter-spacing:1px] [font-size:1.25rem] [margin-bottom:0.75rem] [color:var(--color-text)]">{t('admin.hotels.deleteTitle')}</h3>
            <p className="[color:var(--color-muted)] [font-weight:300] [font-size:0.9rem] [line-height:1.5] [margin-bottom:1.75rem]">{t('admin.hotels.deleteMessage', { name: selected.name })}</p>
            {error && <div className="[color:var(--color-danger)] [font-weight:400] [margin-bottom:1rem] [font-size:0.85rem]">{error}</div>}
            <div className="[display:flex] [gap:0.75rem] [justify-content:center]">
              <button onClick={closeModal} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--color-text)] backdrop-blur-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-background)] min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem]">{t('admin.actions.cancel')}</button>
              <button onClick={handleDelete} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[color-mix(in_srgb,var(--color-primary)_46%,transparent)] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))] text-[#061426] hover:brightness-105 min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem] [background:var(--color-danger)] [color:#FFFFFF]" disabled={submitting}>{submitting ? t('admin.actions.deleting') : t('admin.actions.delete')}</button>
            </div>
          </div>
        </ModalOverlay>
      }
    </AdminLayout>);

};

const ModalOverlay = ({ children, onClose, maxWidth = 550 }) =>
<div onClick={(e) => e.target === e.currentTarget && onClose()} className="[position:fixed] [inset:0] [background:rgba(26,54,93,0.3)] [backdrop-filter:blur(4px)] [display:flex] [align-items:center] [justify-content:center] [z-index:200] [padding:1rem]">
    <div className={cn(
    'max-h-[90vh] w-full overflow-y-auto rounded-lg border border-[var(--color-accent)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-hover)] [animation:fadeIn_0.2s_ease-out]',
    maxWidth <= 400 ? 'max-w-[400px]' : 'max-w-[550px]'
  )}>
      {children}
    </div>
  </div>;


export default AdminHotels;
