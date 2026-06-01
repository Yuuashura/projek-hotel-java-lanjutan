import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminDeleteModal from '../../components/admin/AdminDeleteModal';
import AdminRoomTypeFormModal from '../../components/admin/rooms/AdminRoomTypeFormModal';
import AdminRoomTypesTable from '../../components/admin/rooms/AdminRoomTypesTable';
import LoadingState from '../../components/LoadingState';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import api from '../../utils/api';
import { uploadFile, validateImageFile } from '../../utils/uploads';
import { usePreferences } from '../../context/PreferencesContext';

const EMPTY_FORM = {
  name: '',
  description: '',
  price_per_night: '',
  max_guest: '2',
  room_available: '5',
  smoking: false,
  image_url: '',
};

const AdminRoomTypes = () => {
  const { t } = usePreferences();
  const { hotelId } = useParams();
  const [rooms, setRooms] = useState([]);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imgPreview, setImgPreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileRef = useRef();

  const loadData = async () => {
    setLoading(true);
    try {
      const [resRooms, resHotel] = await Promise.all([
        api.get(`/api/room-types/hotel/${hotelId}`),
        api.get(`/api/hotels/${hotelId}`)
      ]);
      setRooms(resRooms.data.data || []);
      setHotel(resHotel.data.data);
    } catch (err) {
      setError(t('admin.errors.loadRooms'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [hotelId]);

  const openEdit = (room) => {
    setSelected(room);
    const existingImg = room.images?.[0]?.imageUrl || '';
    setForm({
      name: room.name,
      description: room.description || '',
      price_per_night: room.price_per_night.toString(),
      max_guest: room.max_guest.toString(),
      room_available: room.room_available.toString(),
      smoking: room.is_smoking || room.smoking || false,
      image_url: existingImg,
    });
    setImgPreview(existingImg);
    setError('');
    setModal('edit');
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setImgPreview('');
    setError('');
    setModal('create');
  };

  const openDelete = (room) => {
    setSelected(room);
    setModal('delete');
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        hotel_id: parseInt(hotelId),
        description: form.description,
        price_per_night: parseInt(form.price_per_night),
        max_guest: parseInt(form.max_guest),
        room_available: parseInt(form.room_available),
        smoking: form.smoking,
        image_url: form.image_url
      };

      if (modal === 'create') {
        await api.post('/api/room-types', payload);
      } else if (modal === 'edit') {
        await api.put(`/api/room-types/${selected.id_room_type}`, payload);
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || t('admin.errors.saveRoomFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await api.delete(`/api/room-types/${selected.id_room_type}`);
      closeModal();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || t('admin.errors.deleteRoomFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setUploadingImage(true);
    try {
      const imageUrl = await uploadFile('/api/room-types/upload-image', file);
      setImgPreview(imageUrl);
      setForm(f => ({ ...f, image_url: imageUrl }));
    } catch (err) {
      setError(err.response?.data?.message || t('admin.errors.uploadRoomPhotoFailed'));
    } finally {
      setUploadingImage(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <Link to="/admin/hotels" className="mb-5 inline-flex items-center gap-2 font-[var(--font-body)] text-xs font-bold uppercase text-[var(--color-text)] no-underline transition hover:text-[var(--color-primary)]">
          <ArrowLeft size={14} /> {t('admin.actions.backToHotels')}
        </Link>
        <AdminPageHeader
          title={t('admin.rooms.title')}
          subtitle={t('admin.rooms.subtitle', { hotel: hotel?.name || t('admin.rooms.loadingHotel'), count: rooms.length })}
          className="mb-0"
          actions={<Button onClick={openCreate} size="sm"><Plus size={14} /> {t('admin.actions.addRoomType')}</Button>}
        />
      </div>

      {error && <Alert type="danger">{error}</Alert>}

      {loading ? (
        <LoadingState text={t('admin.rooms.loading')} compact />
      ) : (
        <AdminRoomTypesTable rooms={rooms} t={t} onEdit={openEdit} onDelete={openDelete} />
      )}

      {(modal === 'create' || modal === 'edit') && (
        <AdminRoomTypeFormModal
          mode={modal}
          t={t}
          form={form}
          setForm={setForm}
          imgPreview={imgPreview}
          uploadingImage={uploadingImage}
          submitting={submitting}
          fileRef={fileRef}
          onImageChange={handleImageChange}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}

      {modal === 'delete' && (
        <AdminDeleteModal
          title={t('admin.rooms.deleteTitle')}
          message={t('admin.rooms.deleteMessage', { name: selected?.name })}
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

export default AdminRoomTypes;
