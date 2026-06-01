import React, { useState, useEffect, useRef } from 'react';
import { Plus, Upload, Download } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminDeleteModal from '../../components/admin/AdminDeleteModal';
import AdminHotelFormModal from '../../components/admin/hotels/AdminHotelFormModal';
import AdminHotelTable from '../../components/admin/hotels/AdminHotelTable';
import LoadingState from '../../components/LoadingState';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import api from '../../utils/api';
import { getErrorMessage, unwrapList } from '../../utils/response';
import { uploadFile, validateImageFile } from '../../utils/uploads';
import { usePreferences } from '../../context/PreferencesContext';

const EMPTY_FORM = { name: '', city_id: '', address: '', type: '', description: '', is_featured: false, is_on_sale: false, discount_percent: 0, rating: 0, image_url: '' };
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
  const [hotels, setHotels] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imagesList, setImagesList] = useState([]);
  const [page, setPage] = useState(0);
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

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([
      api.get('/api/hotels', { params: { page, size: PAGE_SIZE } }),
      api.get('/api/cities'),
    ]).then(([h, c]) => {
      setHotels(unwrapList(h.data));
      setPagination(normalizePagination(h.data?.pagination, page, unwrapList(h.data).length));
      setCities(unwrapList(c.data));
    }).catch((err) => setError(getErrorMessage(err, t('admin.errors.loadHotels')))).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setImagesList([]);
    setError('');
    setModal('create');
  };

  const openEdit = async (h) => {
    setError('');
    let hotel = h;
    try {
      const res = await api.get(`/api/hotels/${h.id_hotel}`);
      hotel = res.data?.data || h;
    } catch {
      hotel = h;
    }

    setSelected(hotel);
    const hotelImgs = hotel.images?.map(img => img.imageUrl || img.image_url).filter(Boolean) || [];
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
      image_url: hotelImgs.join('|||')
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
        image_url: imagesList.join('|||')
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

  return (
    <AdminLayout>
      <AdminPageHeader
        title={t('admin.hotels.title')}
        subtitle={t('admin.hotels.count', { count: totalItems })}
        actions={(
          <>
            <Button onClick={handleExcelDownload} variant="white" size="sm" disabled={excelDownloading}>
              <Download size={14} /> {excelDownloading ? t('admin.actions.downloading') : t('admin.actions.downloadExcel')}
            </Button>
            <Button onClick={() => excelRef.current?.click()} variant="white" size="sm" disabled={excelUploading}>
              <Upload size={14} /> {excelUploading ? t('admin.actions.uploading') : t('admin.actions.uploadExcel')}
            </Button>
            <Button onClick={openCreate} size="sm"><Plus size={14} /> {t('admin.actions.addHotel')}</Button>
          </>
        )}
      />
      <input ref={excelRef} type="file" accept=".xlsx" style={{ display: 'none' }} onChange={handleExcelUpload} />

      {error && <Alert type="danger">{error}</Alert>}

      {loading ? (
        <LoadingState text={t('admin.hotels.loading')} compact />
      ) : (
        <AdminHotelTable
          hotels={paginatedHotels}
          pagination={{ ...pagination, currentPage, totalPages, totalItems }}
          pageSize={PAGE_SIZE}
          t={t}
          onEdit={openEdit}
          onDelete={openDelete}
          onPageChange={setPage}
        />
      )}

      {(modal === 'create' || modal === 'edit') && (
        <AdminHotelFormModal
          mode={modal}
          t={t}
          cities={cities}
          form={form}
          setForm={setForm}
          error={error}
          submitting={submitting}
          imagesList={imagesList}
          setImagesList={setImagesList}
          imageUploading={imageUploading}
          fileRef={fileRef}
          onImageUpload={handleImageUpload}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}

      {modal === 'delete' && selected && (
        <AdminDeleteModal
          title={t('admin.hotels.deleteTitle')}
          message={t('admin.hotels.deleteMessage', { name: selected.name })}
          error={error}
          cancelLabel={t('admin.actions.cancel')}
          deleteLabel={t('admin.actions.delete')}
          deletingLabel={t('admin.actions.deleting')}
          submitting={submitting}
          onCancel={closeModal}
          onDelete={handleDelete}
        />
      )}
    </AdminLayout>
  );
};

export default AdminHotels;
