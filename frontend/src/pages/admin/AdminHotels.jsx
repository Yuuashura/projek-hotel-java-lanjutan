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

const EMPTY_FORM = { name: '', city_id: '', address: '', type: '', description: '', is_featured: false, is_on_sale: false, discount_percent: 0, rating: 0, image_url: '', admin_hotel_id: '', facility_ids: [] };
const PAGE_SIZE = 25;

const normalizePagination = (pagination, fallbackPage, fallbackCount) => ({
  currentPage: pagination?.current_page ?? pagination?.currentPage ?? fallbackPage,
  pageSize: pagination?.page_size ?? pagination?.pageSize ?? PAGE_SIZE,
  totalItems: pagination?.total_items ?? pagination?.totalItems ?? fallbackCount,
  totalPages: pagination?.total_pages ?? pagination?.totalPages ?? 1,
  hasNext: pagination?.has_next ?? pagination?.hasNext ?? false,
  hasPrevious: pagination?.has_previous ?? pagination?.hasPrevious ?? false,
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
    hasPrevious: false,
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
      api.get('/api/cities'),
      api.get('/api/facilities'),
      !isAdminHotel ? api.get('/api/users/admin-hotels').catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } }),
    ]).then(([h, c, f, a]) => {
      const hotelList = unwrapList(h.data);
      const userId = user?.id_customer ?? user?.idCustomer ?? user?.userId ?? user?.id;
      const visibleHotels = isAdminHotel
        ? hotelList.filter(hotel => (hotel?.admin_hotel_id ?? hotel?.adminHotelId) === userId)
        : hotelList;
      setHotels(visibleHotels);
      setPagination(isAdminHotel
        ? normalizePagination(null, 0, visibleHotels.length)
        : normalizePagination(h.data?.pagination, page, visibleHotels.length));
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
    const hotelImgs = hotel.images?.map(img => img.imageUrl || img.image_url).filter(Boolean) || [];
    const hotelFacilityIds = (hotel.facilities || [])
      .map(facility => facility.id_facility ?? facility.idFacility ?? facility.id)
      .filter(id => id != null)
      .map(Number);
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
      facility_ids: hotelFacilityIds,
    });
    setModal('edit');
  };

  const openDelete = (h) => { setSelected(h); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); setError(''); setImagesList([]); };

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
        facility_ids: form.facility_ids.map(Number),
      };
      if (modal === 'create') await api.post('/api/hotels', payload);
      if (modal === 'edit') await api.put(`/api/hotels/${selected.id_hotel}`, payload);
      closeModal();
      if (modal === 'create' && page !== 0) setPage(0);
      else load();
    } catch (err) {
      setError(err.response?.data?.message || t('admin.errors.operationFailed'));
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await api.delete(`/api/hotels/${selected.id_hotel}`);
      closeModal();
      load();
    } catch (err) {
      setError(err.response?.data?.message || t('admin.errors.deleteHotelFailed'));
    } finally { setSubmitting(false); }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const invalidFile = files.find(file => validateImageFile(file));
    if (invalidFile) {
      setError(validateImageFile(invalidFile));
      return;
    }

    setImageUploading(true);
    setError('');
    try {
      const uploadedUrls = await Promise.all(files.map(file => uploadFile('/api/hotels/upload-image', file)));
      setImagesList(list => [...list, ...uploadedUrls.filter(Boolean)]);
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
      if (page !== 0) setPage(0);
      else load();
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
    setForm(current => ({
      ...current,
      facility_ids: current.facility_ids.includes(facilityId)
        ? current.facility_ids.filter(id => id !== facilityId)
        : [...current.facility_ids, facilityId],
    }));
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.75rem', textTransform: 'uppercase', letterSpacing: '1px', margin: 0, color: 'var(--color-text)' }}>{t('admin.hotels.title')}</h2>
          <p style={{ color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.85rem', margin: '0.25rem 0 0' }}>{t('admin.hotels.count', { count: totalItems })}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {!isAdminHotel && (
            <>
              <button onClick={handleExcelDownload} className="btn btn-white btn-sm" disabled={excelDownloading}>
                <Download size={14} /> {excelDownloading ? t('admin.actions.downloading') : t('admin.actions.downloadExcel')}
              </button>
              <button onClick={() => excelRef.current?.click()} className="btn btn-white btn-sm" disabled={excelUploading}>
                <Upload size={14} /> {excelUploading ? t('admin.actions.uploading') : t('admin.actions.uploadExcel')}
              </button>
              <button onClick={openCreate} className="btn btn-primary btn-sm"><Plus size={14} /> {t('admin.actions.addHotel')}</button>
            </>
          )}
          <input ref={excelRef} type="file" accept=".xlsx" style={{ display: 'none' }} onChange={handleExcelUpload} />
        </div>
      </div>

      {error && (
        <div className="alert-danger" style={{ borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <AlertCircle size={16} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
          <span style={{ fontWeight: 300, color: 'var(--color-danger)', fontSize: '0.85rem' }}>{error}</span>
        </div>
      )}

      {loading ? (
        <LoadingState text={t('admin.hotels.loading')} compact />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="neo-table">
            <thead>
              <tr>{[t('admin.table.number'), t('admin.table.hotel'), t('admin.table.city'), t('admin.table.type'), t('admin.table.rating'), t('admin.table.status'), t('admin.table.actions')].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {paginatedHotels.map(h => (
                <tr key={h.id_hotel}>
                  <td style={{ fontWeight: 400, color: 'var(--color-muted)', fontSize: '0.85rem' }}>#{h.id_hotel}</td>
                  <td>
                    <div style={{ fontWeight: 400, fontSize: '0.9rem', color: 'var(--color-text)' }}>{h.name}</div>
                    <div style={{ color: 'var(--color-muted)', fontSize: '0.75rem', fontWeight: 300, display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}><MapPin size={10} />{h.address}</div>
                  </td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--color-text)', fontWeight: 300 }}>{h.city?.name}</td>
                  <td><span className="badge badge-gray">{h.type}</span></td>
                  <td style={{ color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 400 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Star size={12} fill="var(--color-primary)" style={{ stroke: 'var(--color-primary)' }} />
                      {h.rating?.toFixed(1) || '0.0'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {h.featured && <span className="badge badge-yellow" style={{ background: 'var(--color-primary)', color: 'white', borderColor: 'transparent' }}>Featured</span>}
                      {h.onSale && <span className="badge badge-red">-{h.discount_percent}%</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/admin/hotels/${h.id_hotel}/rooms`} className="btn btn-white btn-sm" style={{ padding: '0.4rem 0.8rem' }} title={t('admin.hotels.manageRooms')}><Bed size={13} /></Link>
                      <button onClick={() => openEdit(h)} className="btn btn-white btn-sm" style={{ padding: '0.4rem 0.8rem' }} title={t('admin.hotels.editHotel')}><Pencil size={13} /></button>
                       {!isAdminHotel && <button onClick={() => openDelete(h)} className="btn btn-white btn-sm" style={{ padding: '0.4rem 0.8rem', color: 'var(--color-danger)' }} title={t('admin.hotels.deleteHotel')}><Trash2 size={13} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {hotels.length === 0 && <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.9rem' }}>{t('admin.hotels.empty')}</div>}
          <PaginationControls
            page={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pagination.pageSize || PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Create/Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <ModalOverlay onClose={closeModal}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-accent)', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text)' }}>
            {modal === 'create' ? t('admin.hotels.createTitle') : t('admin.hotels.editTitle')}
            <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}><X size={18} /></button>
          </div>
          {error && <div className="alert-danger" style={{ borderRadius: 'var(--radius-sm)', padding: '0.75rem', marginBottom: '1.25rem', fontWeight: 300, color: 'var(--color-danger)', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><AlertCircle size={16} />{error}</div>}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div><label className="label">{t('admin.hotels.name')}</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                <div><label className="label">{t('common.city')} *</label><CitySearchSelect cities={cities} value={form.city_id} onChange={val => setForm(f => ({ ...f, city_id: val }))} placeholder={t('home.allCities')} /></div>
              </div>
              <div><label className="label">Alamat</label><input className="input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div><label className="label">{t('admin.hotels.type')}</label><select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}><option value="">{t('admin.hotels.chooseType')}</option>{['Budget', 'Bintang 2', 'Bintang 3', 'Bintang 4', 'Bintang 5', 'Resort', 'Boutique'].map(t => <option key={t}>{t}</option>)}</select></div>
                <div><label className="label">Rating (0-5)</label><input type="number" className="input" min={0} max={5} step={0.1} value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} /></div>
              </div>
              <div><label className="label">{t('admin.rooms.description')}</label><textarea className="input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} /></div>

              <div>
                <label className="label"><Sparkles size={12} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />{t('admin.hotels.facilities')}</label>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.78rem', lineHeight: 1.5, margin: '0 0 0.75rem' }}>
                  {t('admin.hotels.facilitiesHint')}
                </p>
                {facilities.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.65rem' }}>
                    {facilities.map(facility => {
                      const facilityId = Number(facility.id_facility ?? facility.idFacility ?? facility.id);
                      const selectedFacility = form.facility_ids.includes(facilityId);
                      return (
                        <button
                          key={facilityId}
                          type="button"
                          onClick={() => toggleFacility(facilityId)}
                          aria-pressed={selectedFacility}
                          style={{
                            minHeight: 42,
                            padding: '0.65rem 0.75rem',
                            border: selectedFacility ? '1px solid var(--color-primary)' : '1px solid var(--color-accent)',
                            borderRadius: 'var(--radius-sm)',
                            background: selectedFacility ? 'var(--color-primary-soft)' : 'var(--color-surface)',
                            color: 'var(--color-text)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.55rem',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: '0.82rem',
                          }}
                        >
                          <span style={{
                            width: 18,
                            height: 18,
                            flexShrink: 0,
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: 4,
                            border: selectedFacility ? '1px solid var(--color-primary)' : '1px solid var(--color-muted)',
                            background: selectedFacility ? 'var(--color-primary)' : 'transparent',
                            color: '#fff',
                          }}>
                            {selectedFacility && <Check size={12} />}
                          </span>
                          <span>{facility.name}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ color: 'var(--color-muted)', fontSize: '0.82rem', padding: '0.75rem', border: '1px dashed var(--color-accent)' }}>
                    {t('admin.hotels.noFacilities')}
                  </div>
                )}
              </div>

              {!isAdminHotel && (
                <div><label className="label"><UserCog size={12} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />{t('admin.hotels.adminHotel')}</label>
                  <select className="input" value={form.admin_hotel_id} onChange={e => setForm(f => ({ ...f, admin_hotel_id: e.target.value }))}>
                    <option value="">{t('admin.hotels.chooseAdminHotel')}</option>
                    {adminHotelList.map(ah => <option key={ah.id_customer || ah.id} value={ah.id_customer || ah.id}>{ah.first_name} {ah.last_name} ({ah.email})</option>)}
                  </select>
                </div>
              )}
              
              {/* Multiple Images Upload Section */}
              <div>
                <label className="label"><ImageIcon size={12} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />{t('admin.hotels.gallery')}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  {imagesList.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', height: 75, border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                      <img src={getImageUrl(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={() => setImagesList(list => list.filter((_, i) => i !== idx))}
                        style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px' }}>
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  <div
                    onClick={() => fileRef.current?.click()}
                    style={{ border: '1px dashed var(--color-primary)', borderRadius: 'var(--radius-sm)', height: 75, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(212,175,55,0.02)', transition: 'all 0.2s' }}
                  >
                    <Plus size={16} style={{ color: 'var(--color-primary)' }} />
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-primary)', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{imageUploading ? 'Uploading' : 'Upload'}</span>
                  </div>
                </div>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: 'none' }} onChange={handleImageUpload} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', border: '1px solid var(--color-accent)', background: form.is_featured ? 'var(--color-primary-soft)' : 'var(--color-surface)', cursor: 'pointer', borderRadius: 'var(--radius-sm)', transition: 'all 0.3s ease' }} onClick={() => setForm(f => ({ ...f, is_featured: !f.is_featured }))}>
                  <input type="checkbox" checked={form.is_featured} readOnly style={{ width: 15, height: 15, accentColor: 'var(--color-primary)' }} />
                  <label className="label" style={{ margin: 0, cursor: 'pointer', color: 'var(--color-text)' }}>Is Featured</label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', border: '1px solid var(--color-accent)', background: form.is_on_sale ? 'var(--color-danger-soft)' : 'var(--color-surface)', cursor: 'pointer', borderRadius: 'var(--radius-sm)', transition: 'all 0.3s ease' }} onClick={() => setForm(f => ({ ...f, is_on_sale: !f.is_on_sale }))}>
                  <input type="checkbox" checked={form.is_on_sale} readOnly style={{ width: 15, height: 15, accentColor: 'var(--color-danger)' }} />
                  <label className="label" style={{ margin: 0, cursor: 'pointer', color: 'var(--color-text)' }}>On Sale</label>
                </div>
              </div>
              {form.is_on_sale && <div><label className="label">Persen Diskon (%)</label><input type="number" className="input" min={0} max={100} value={form.discount_percent} onChange={e => setForm(f => ({ ...f, discount_percent: e.target.value }))} /></div>}
              <button type="submit" className="btn btn-primary btn-full" disabled={submitting} style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
                {submitting ? t('admin.actions.saving') : <><Check size={14} /> {modal === 'create' ? t('admin.actions.addHotel') : t('admin.actions.saveChanges')}</>}
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {/* Delete Confirm */}
      {modal === 'delete' && selected && (
        <ModalOverlay onClose={closeModal} maxWidth={400}>
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🗑️</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--color-text)' }}>{t('admin.hotels.deleteTitle')}</h3>
            <p style={{ color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>{t('admin.hotels.deleteMessage', { name: selected.name })}</p>
            {error && <div style={{ color: 'var(--color-danger)', fontWeight: 400, marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={closeModal} className="btn btn-white btn-sm">{t('admin.actions.cancel')}</button>
              <button onClick={handleDelete} className="btn btn-primary btn-sm" style={{ background: 'var(--color-danger)', color: '#FFFFFF' }} disabled={submitting}>{submitting ? t('admin.actions.deleting') : t('admin.actions.delete')}</button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </AdminLayout>
  );
};

const ModalOverlay = ({ children, onClose, maxWidth = 550 }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,54,93,0.3)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }} onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-sm)', padding: '2rem', width: '100%', maxWidth, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-hover)', animation: 'fadeIn 0.2s ease-out' }}>
      {children}
    </div>
  </div>
);

export default AdminHotels;
