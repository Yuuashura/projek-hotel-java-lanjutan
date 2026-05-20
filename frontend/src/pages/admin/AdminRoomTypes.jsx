import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, AlertCircle, ArrowLeft, Users, ImageIcon } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../utils/api';

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

  // openCreate is now defined after openEdit

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
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/admin/hotels" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Space Grotesk', fontWeight: 700, textDecoration: 'none', color: 'var(--neo-dark)', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Kembali ke Daftar Hotel
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1.5rem', textTransform: 'uppercase', margin: 0 }}>
              Kelola Tipe Kamar
            </h2>
            <p style={{ color: '#9ca3af', fontWeight: 500, fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
              Hotel: <strong>{hotel?.name || 'Loading...'}</strong> ({rooms.length} tipe kamar)
            </p>
          </div>
          <button onClick={openCreate} className="btn btn-orange">
            <Plus size={16} /> Tambah Tipe Kamar
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fff0f3', border: '3px solid var(--neo-pink)', padding: '0.875rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center', boxShadow: '3px 3px 0px 0px var(--neo-pink)' }}>
          <AlertCircle size={16} style={{ color: 'var(--neo-pink)', flexShrink: 0 }} />
          <span style={{ fontWeight: 700, color: '#be123c', fontSize: '0.875rem' }}>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', fontWeight: 600 }}>
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
                    <td style={{ fontFamily: 'Space Grotesk', fontWeight: 700 }}>#{r.id_room_type}</td>
                    <td>
                      {thumb ? (
                        <img src={thumb} alt={r.name} style={{ width: 60, height: 45, objectFit: 'cover', border: '2px solid var(--neo-dark)' }} />
                      ) : (
                        <div style={{ width: 60, height: 45, background: '#f3f4f6', border: '2px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ImageIcon size={16} style={{ color: '#9ca3af' }} />
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '0.9rem', textTransform: 'uppercase' }}>
                        {r.name}
                      </div>
                      <div style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: 500 }}>
                        {r.description || 'Tidak ada deskripsi'}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'Space Grotesk', fontWeight: 700, color: 'var(--neo-orange)' }}>
                      {formatCurrency(r.price_per_night)}
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Users size={14} /> {r.max_guest} Tamu
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>
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
                        <button onClick={() => openEdit(r)} className="btn btn-primary btn-sm" title="Edit Tipe Kamar">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => openDelete(r)} className="btn btn-red btn-sm" title="Hapus Tipe Kamar">
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
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', fontWeight: 600 }}>
              Belum ada tipe kamar yang ditambahkan untuk hotel ini.
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <ModalOverlay onClose={closeModal}>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.1rem', marginBottom: '1.5rem', borderBottom: '3px solid var(--neo-dark)', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {modal === 'create' ? 'Tambah Tipe Kamar Baru' : 'Edit Tipe Kamar'}
            <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="label">Nama Tipe Kamar *</label>
              <input className="input" placeholder="Standard Room, Suite Room..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Deskripsi</label>
              <textarea className="input" style={{ minHeight: 80, resize: 'vertical' }} placeholder="Deskripsi mengenai tipe kamar..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="label">Harga Per Malam *</label>
                <input type="number" className="input" value={form.price_per_night} onChange={e => setForm(f => ({ ...f, price_per_night: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Kapasitas Tamu *</label>
                <input type="number" className="input" min="1" value={form.max_guest} onChange={e => setForm(f => ({ ...f, max_guest: e.target.value }))} required />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="label">Kamar Tersedia *</label>
                <input type="number" className="input" min="0" value={form.room_available} onChange={e => setForm(f => ({ ...f, room_available: e.target.value }))} required />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '1.75rem' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.smoking} onChange={e => setForm(f => ({ ...f, smoking: e.target.checked }))} style={{ width: 18, height: 18, border: '2px solid var(--neo-dark)', cursor: 'pointer' }} />
                  Smoking Room (Boleh Merokok)
                </label>
              </div>
            </div>

            {/* Gambar Kamar */}
            <div>
              <label className="label"><ImageIcon size={12} style={{ display: 'inline', marginRight: '0.4rem' }} />Foto Kamar (opsional)</label>
              <div
                onClick={() => fileRef.current?.click()}
                style={{ border: `3px dashed ${imgPreview ? 'var(--neo-green)' : 'var(--neo-dark)'}`, padding: '1.25rem', textAlign: 'center', cursor: 'pointer', background: imgPreview ? '#f0fdf4' : '#fafafa', transition: 'all 0.2s' }}
              >
                {imgPreview ? (
                  <div>
                    <img src={imgPreview} alt="preview" style={{ maxHeight: 140, maxWidth: '100%', objectFit: 'cover', border: '3px solid var(--neo-dark)', marginBottom: '0.4rem' }} />
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#16a34a' }}>Klik untuk ganti gambar</div>
                  </div>
                ) : (
                  <div>
                    <ImageIcon size={32} style={{ color: '#9ca3af', marginBottom: '0.4rem' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Klik untuk upload foto kamar</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.2rem' }}>JPG, PNG, WEBP · Maks 5MB</div>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (!file.type.startsWith('image/')) { setError('Hanya file gambar yang diperbolehkan.'); return; }
                if (file.size > 5 * 1024 * 1024) { setError('Ukuran file maksimal 5MB.'); return; }
                setError('');
                const reader = new FileReader();
                reader.onloadend = () => { setImgPreview(reader.result); setForm(f => ({ ...f, image_url: reader.result })); };
                reader.readAsDataURL(file);
              }} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-orange" disabled={submitting} style={{ opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'Menyimpan...' : 'Simpan Tipe Kamar'}
              </button>
              <button type="button" onClick={closeModal} className="btn btn-white" disabled={submitting}>
                Batal
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && (
        <ModalOverlay onClose={closeModal}>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '3px solid var(--neo-dark)', paddingBottom: '0.75rem' }}>
            Hapus Tipe Kamar
          </div>
          <p style={{ fontWeight: 600, color: '#374151', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Apakah Anda yakin ingin menghapus tipe kamar <strong>{selected?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handleDelete} className="btn btn-red" disabled={submitting}>
              {submitting ? 'Menghapus...' : 'Ya, Hapus'}
            </button>
            <button onClick={closeModal} className="btn btn-white" disabled={submitting}>
              Batal
            </button>
          </div>
        </ModalOverlay>
      )}
    </AdminLayout>
  );
};

// Reusable Modal Overlay Component matching other admin pages style
const ModalOverlay = ({ children, onClose }) => {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }} onClick={onClose}>
      <div className="card" style={{ maxWidth: 500, width: '100%', padding: '2rem', background: 'white', position: 'relative', animation: 'slideIn 0.2s ease' }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default AdminRoomTypes;
