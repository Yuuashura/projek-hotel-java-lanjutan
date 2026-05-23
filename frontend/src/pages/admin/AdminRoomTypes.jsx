import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, AlertCircle, ArrowLeft, Users, ImageIcon, Check } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import AdminLayout from '../../components/admin/AdminLayout';
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

  return (
    <AdminLayout>
      {/* Back Button & Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/admin/hotels" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-body)', fontWeight: 400, textDecoration: 'none', color: 'var(--color-text)', marginBottom: '1.25rem', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>
          <ArrowLeft size={14} /> {t('admin.actions.backToHotels')}
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.75rem', textTransform: 'uppercase', letterSpacing: '1px', margin: 0, color: 'var(--color-text)' }}>
              {t('admin.rooms.title')}
            </h2>
            <p style={{ color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
              {t('admin.rooms.subtitle', { hotel: hotel?.name || t('admin.rooms.loadingHotel'), count: rooms.length })}
            </p>
          </div>
          <button onClick={openCreate} className="btn btn-primary btn-sm">
            <Plus size={14} /> {t('admin.actions.addRoomType')}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-danger" style={{ borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <AlertCircle size={16} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
          <span style={{ fontWeight: 300, color: 'var(--color-danger)', fontSize: '0.85rem' }}>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.9rem' }}>
          {t('admin.rooms.loading')}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="neo-table">
            <thead>
              <tr>
                {[t('admin.table.number'), t('admin.table.image'), t('admin.table.roomType'), t('admin.table.pricePerNight'), t('admin.table.capacity'), t('admin.table.roomsAvailable'), t('admin.table.smoking'), t('admin.table.actions')].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rooms.map(r => {
                const thumb = r.images?.[0]?.imageUrl || '';
                return (
                  <tr key={r.id_room_type}>
                    <td style={{ fontWeight: 400, color: 'var(--color-muted)', fontSize: '0.85rem' }}>#{r.id_room_type}</td>
                    <td>
                      {thumb ? (
                        <img src={thumb} alt={r.name} style={{ width: 60, height: 45, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-accent)' }} />
                      ) : (
                        <div style={{ width: 60, height: 45, background: 'var(--color-background)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ImageIcon size={14} style={{ color: 'var(--color-muted)' }} />
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 400, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                        {r.name}
                      </div>
                      <div style={{ color: 'var(--color-muted)', fontSize: '0.75rem', fontWeight: 300, marginTop: '0.15rem' }}>
                        {r.description || t('admin.rooms.noDescription')}
                      </div>
                    </td>
                    <td style={{ fontWeight: 400, color: 'var(--color-primary)', fontSize: '0.875rem' }}>
                      {formatCurrency(r.price_per_night)}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--color-text)', fontWeight: 300 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Users size={12} style={{ color: 'var(--color-muted)' }} /> {t('admin.rooms.guests', { count: r.max_guest })}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--color-text)', fontWeight: 300 }}>
                      {t('admin.rooms.rooms', { count: r.room_available })}
                    </td>
                    <td>
                      {r.is_smoking || r.smoking ? (
                        <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>{t('admin.rooms.smokeAllowed')}</span>
                      ) : (
                        <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>{t('admin.rooms.smokeFree')}</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => openEdit(r)} className="btn btn-white btn-sm" style={{ padding: '0.4rem 0.8rem' }} title={t('admin.rooms.editTitle')}>
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => openDelete(r)} className="btn btn-white btn-sm" style={{ padding: '0.4rem 0.8rem', color: 'var(--color-danger)' }} title={t('admin.rooms.deleteRoomType')}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rooms.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.9rem' }}>
              {t('admin.rooms.empty')}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <ModalOverlay onClose={closeModal}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-accent)', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text)' }}>
            {modal === 'create' ? t('admin.rooms.createTitle') : t('admin.rooms.editTitle')}
            <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="label">{t('admin.rooms.name')}</label>
              <input className="input" placeholder="Standard Room, Suite Room..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="label">{t('admin.rooms.description')}</label>
              <textarea className="input" style={{ minHeight: 80, resize: 'vertical' }} placeholder={t('admin.rooms.description')} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label className="label">{t('admin.rooms.price')}</label>
                <input type="number" className="input" value={form.price_per_night} onChange={e => setForm(f => ({ ...f, price_per_night: e.target.value }))} required />
              </div>
              <div>
                <label className="label">{t('admin.rooms.capacity')}</label>
                <input type="number" className="input" min="1" value={form.max_guest} onChange={e => setForm(f => ({ ...f, max_guest: e.target.value }))} required />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label className="label">{t('admin.rooms.availableRooms')}</label>
                <input type="number" className="input" min="0" value={form.room_available} onChange={e => setForm(f => ({ ...f, room_available: e.target.value }))} required />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', border: '1px solid var(--color-accent)', background: form.smoking ? 'var(--color-primary-soft)' : 'var(--color-surface)', cursor: 'pointer', borderRadius: 'var(--radius-sm)', transition: 'all 0.3s ease', width: '100%' }} onClick={() => setForm(f => ({ ...f, smoking: !f.smoking }))}>
                  <input type="checkbox" checked={form.smoking} readOnly style={{ width: 15, height: 15, accentColor: 'var(--color-primary)' }} />
                  <label className="label" style={{ margin: 0, cursor: 'pointer', color: 'var(--color-text)' }}>{t('admin.rooms.smokingRoom')}</label>
                </div>
              </div>
            </div>

            {/* Gambar Kamar */}
            <div>
              <label className="label"><ImageIcon size={12} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />{t('admin.rooms.roomPhoto')}</label>
              <div
                onClick={() => fileRef.current?.click()}
                style={{ border: '1px dashed var(--color-primary)', borderRadius: 'var(--radius-sm)', padding: '1.5rem 1rem', textAlign: 'center', cursor: 'pointer', background: imgPreview ? 'rgba(212,175,55,0.01)' : 'transparent', transition: 'all 0.2s' }}
              >
                {imgPreview ? (
                  <div>
                    <img src={imgPreview} alt="preview" style={{ maxHeight: 120, maxWidth: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-accent)', marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-primary)' }}>{t('admin.rooms.changePhoto')}</div>
                  </div>
                ) : (
                  <div>
                    <ImageIcon size={28} style={{ color: 'var(--color-muted)', marginBottom: '0.4rem' }} />
                    <div style={{ fontWeight: 300, fontSize: '0.8rem', color: 'var(--color-text)' }}>{uploadingImage ? t('admin.rooms.uploadingPhoto') : t('admin.rooms.uploadPhoto')}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', marginTop: '0.2rem' }}>JPG, PNG, WEBP · Maks 5MB</div>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={async e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const validationError = validateImageFile(file);
                if (validationError) { setError(validationError); return; }
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
              }} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }} disabled={submitting}>
                {submitting ? t('admin.actions.saving') : <><Check size={14} /> {t('admin.rooms.saveRoomType')}</>}
              </button>
              <button type="button" onClick={closeModal} className="btn btn-white btn-sm" disabled={submitting}>
                {t('admin.actions.cancel')}
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && (
        <ModalOverlay onClose={closeModal} maxWidth={400}>
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🗑️</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--color-text)' }}>{t('admin.rooms.deleteTitle')}</h3>
            <p style={{ color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>{t('admin.rooms.deleteMessage', { name: selected?.name })}</p>
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

const ModalOverlay = ({ children, onClose, maxWidth = 500 }) => {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,54,93,0.3)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }} onClick={onClose}>
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-sm)', padding: '2rem', width: '100%', maxWidth, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-hover)', animation: 'fadeIn 0.2s ease-out', position: 'relative' }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default AdminRoomTypes;
