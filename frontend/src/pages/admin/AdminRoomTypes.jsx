import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, AlertCircle, ArrowLeft, Users, ImageIcon, Check } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../utils/api';
import { uploadFile, validateImageFile } from '../../utils/uploads';

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
      setError('Gagal memuat data tipe kamar atau hotel');
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
      setError(err.response?.data?.message || 'Gagal menyimpan tipe kamar');
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
      setError(err.response?.data?.message || 'Gagal menghapus tipe kamar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      {/* Back Button & Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/admin/hotels" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-body)', fontWeight: 400, textDecoration: 'none', color: 'var(--color-text)', marginBottom: '1.25rem', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>
          <ArrowLeft size={14} /> Kembali ke Daftar Hotel
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.75rem', textTransform: 'uppercase', letterSpacing: '1px', margin: 0, color: 'var(--color-text)' }}>
              Kelola Tipe Kamar
            </h2>
            <p style={{ color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
              Hotel: <strong>{hotel?.name || 'Loading...'}</strong> ({rooms.length} tipe kamar)
            </p>
          </div>
          <button onClick={openCreate} className="btn btn-primary btn-sm">
            <Plus size={14} /> Tambah Tipe Kamar
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fff0f3', border: '1px solid #fda4af', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <AlertCircle size={16} style={{ color: '#be123c', flexShrink: 0 }} />
          <span style={{ fontWeight: 300, color: '#be123c', fontSize: '0.85rem' }}>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.9rem' }}>
          Memuat data tipe kamar...
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="neo-table">
            <thead>
              <tr>
                {['#', 'Gambar', 'Tipe Kamar', 'Harga / Malam', 'Kapasitas', 'Kamar Tersedia', 'Smoking', 'Aksi'].map(h => <th key={h}>{h}</th>)}
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
                        <div style={{ width: 60, height: 45, background: '#f3f4f6', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ImageIcon size={14} style={{ color: 'var(--color-muted)' }} />
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 400, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                        {r.name}
                      </div>
                      <div style={{ color: 'var(--color-muted)', fontSize: '0.75rem', fontWeight: 300, marginTop: '0.15rem' }}>
                        {r.description || 'Tidak ada deskripsi'}
                      </div>
                    </td>
                    <td style={{ fontWeight: 400, color: 'var(--color-primary)', fontSize: '0.875rem' }}>
                      {formatCurrency(r.price_per_night)}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--color-text)', fontWeight: 300 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Users size={12} style={{ color: 'var(--color-muted)' }} /> {r.max_guest} Tamu
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--color-text)', fontWeight: 300 }}>
                      {r.room_available} Kamar
                    </td>
                    <td>
                      {r.is_smoking || r.smoking ? (
                        <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>Boleh Merokok</span>
                      ) : (
                        <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>Bebas Asap</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => openEdit(r)} className="btn btn-white btn-sm" style={{ padding: '0.4rem 0.8rem' }} title="Edit Tipe Kamar">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => openDelete(r)} className="btn btn-white btn-sm" style={{ padding: '0.4rem 0.8rem', color: '#be123c' }} title="Hapus Tipe Kamar">
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
              Belum ada tipe kamar yang ditambahkan untuk hotel ini.
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <ModalOverlay onClose={closeModal}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-accent)', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text)' }}>
            {modal === 'create' ? 'Tambah Tipe Kamar Baru' : 'Edit Tipe Kamar'}
            <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="label">Nama Tipe Kamar *</label>
              <input className="input" placeholder="Standard Room, Suite Room..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Deskripsi</label>
              <textarea className="input" style={{ minHeight: 80, resize: 'vertical' }} placeholder="Deskripsi mengenai tipe kamar..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label className="label">Harga Per Malam *</label>
                <input type="number" className="input" value={form.price_per_night} onChange={e => setForm(f => ({ ...f, price_per_night: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Kapasitas Tamu *</label>
                <input type="number" className="input" min="1" value={form.max_guest} onChange={e => setForm(f => ({ ...f, max_guest: e.target.value }))} required />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label className="label">Kamar Tersedia *</label>
                <input type="number" className="input" min="0" value={form.room_available} onChange={e => setForm(f => ({ ...f, room_available: e.target.value }))} required />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', border: '1px solid var(--color-accent)', background: form.smoking ? 'rgba(212,175,55,0.03)' : 'white', cursor: 'pointer', borderRadius: 'var(--radius-sm)', transition: 'all 0.3s ease', width: '100%' }} onClick={() => setForm(f => ({ ...f, smoking: !f.smoking }))}>
                  <input type="checkbox" checked={form.smoking} readOnly style={{ width: 15, height: 15, accentColor: 'var(--color-primary)' }} />
                  <label className="label" style={{ margin: 0, cursor: 'pointer', color: 'var(--color-text)' }}>Smoking Room</label>
                </div>
              </div>
            </div>

            {/* Gambar Kamar */}
            <div>
              <label className="label"><ImageIcon size={12} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />Foto Kamar (opsional)</label>
              <div
                onClick={() => fileRef.current?.click()}
                style={{ border: '1px dashed var(--color-primary)', borderRadius: 'var(--radius-sm)', padding: '1.5rem 1rem', textAlign: 'center', cursor: 'pointer', background: imgPreview ? 'rgba(212,175,55,0.01)' : 'transparent', transition: 'all 0.2s' }}
              >
                {imgPreview ? (
                  <div>
                    <img src={imgPreview} alt="preview" style={{ maxHeight: 120, maxWidth: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-accent)', marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-primary)' }}>Klik untuk ganti gambar</div>
                  </div>
                ) : (
                  <div>
                    <ImageIcon size={28} style={{ color: 'var(--color-muted)', marginBottom: '0.4rem' }} />
                    <div style={{ fontWeight: 300, fontSize: '0.8rem', color: 'var(--color-text)' }}>{uploadingImage ? 'Mengunggah foto...' : 'Klik untuk upload foto kamar'}</div>
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
                  setError(err.response?.data?.message || 'Gagal mengunggah foto kamar');
                } finally {
                  setUploadingImage(false);
                  if (fileRef.current) fileRef.current.value = '';
                }
              }} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }} disabled={submitting}>
                {submitting ? 'Menyimpan...' : <><Check size={14} /> Simpan Tipe Kamar</>}
              </button>
              <button type="button" onClick={closeModal} className="btn btn-white btn-sm" disabled={submitting}>
                Batal
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
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--color-text)' }}>Hapus Tipe Kamar?</h3>
            <p style={{ color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>Apakah Anda yakin ingin menghapus tipe kamar <strong>"{selected?.name}"</strong>? Tindakan ini tidak dapat dibatalkan.</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={closeModal} className="btn btn-white btn-sm">Batalkan</button>
              <button onClick={handleDelete} className="btn btn-primary btn-sm" style={{ background: '#be123c', color: 'white' }} disabled={submitting}>{submitting ? 'Menghapus...' : 'Hapus'}</button>
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
      <div style={{ background: 'white', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-sm)', padding: '2rem', width: '100%', maxWidth, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-hover)', animation: 'fadeIn 0.2s ease-out', position: 'relative' }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default AdminRoomTypes;
