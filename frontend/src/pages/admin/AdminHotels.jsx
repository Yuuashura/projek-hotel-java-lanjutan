import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, AlertCircle, Star, MapPin, Bed } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../utils/api';

const EMPTY_FORM = { name: '', city_id: '', address: '', type: '', description: '', is_featured: false, is_on_sale: false, discount_percent: 0, rating: 0 };

const AdminHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/api/hotels'),
      api.get('/api/cities'),
    ]).then(([h, c]) => { setHotels(h.data.data || []); setCities(c.data.data || []); }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setError(''); setModal('create'); };
  const openEdit = (h) => { setSelected(h); setForm({ name: h.name, city_id: h.city?.id_city || '', address: h.address || '', type: h.type || '', description: h.description || '', is_featured: h.featured, is_on_sale: h.onSale, discount_percent: h.discount_percent || 0, rating: h.rating || 0 }); setError(''); setModal('edit'); };
  const openDelete = (h) => { setSelected(h); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); setError(''); };

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
        rating: parseFloat(form.rating || 0)
      };
      if (modal === 'create') await api.post('/api/hotels', payload);
      if (modal === 'edit') await api.put(`/api/hotels/${selected.id_hotel}`, payload);
      closeModal();
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Operasi gagal');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await api.delete(`/api/hotels/${selected.id_hotel}`);
      closeModal();
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus hotel');
    } finally { setSubmitting(false); }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1.5rem', textTransform: 'uppercase', margin: 0 }}>Kelola Hotel</h2>
          <p style={{ color: '#9ca3af', fontWeight: 500, fontSize: '0.875rem', margin: '0.25rem 0 0' }}>{hotels.length} hotel terdaftar</p>
        </div>
        <button onClick={openCreate} className="btn btn-orange"><Plus size={16} /> Tambah Hotel</button>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', fontWeight: 600 }}>Memuat data hotel...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="neo-table">
            <thead>
              <tr>{['#', 'Hotel', 'Kota', 'Tipe', 'Rating', 'Status', 'Aksi'].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {hotels.map(h => (
                <tr key={h.id_hotel}>
                  <td style={{ fontFamily: 'Space Grotesk', fontWeight: 700 }}>#{h.id_hotel}</td>
                  <td>
                    <div style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '0.9rem', textTransform: 'uppercase' }}>{h.name}</div>
                    <div style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={10} />{h.address}</div>
                  </td>
                  <td>{h.city?.name}</td>
                  <td><span className="badge badge-gray">{h.type}</span></td>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--neo-orange)' }}><Star size={12} fill="var(--neo-orange)" />{h.rating}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {h.featured && <span className="badge badge-dark" style={{ fontSize: '0.65rem' }}>Featured</span>}
                      {h.onSale && <span className="badge badge-red" style={{ fontSize: '0.65rem' }}>-{h.discount_percent}%</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/admin/hotels/${h.id_hotel}/rooms`} className="btn btn-orange btn-sm" title="Kelola Kamar"><Bed size={13} /></Link>
                      <button onClick={() => openEdit(h)} className="btn btn-primary btn-sm" title="Edit Hotel"><Pencil size={13} /></button>
                      <button onClick={() => openDelete(h)} className="btn btn-red btn-sm" title="Hapus Hotel"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {hotels.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', fontWeight: 600 }}>Belum ada data hotel</div>}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <ModalOverlay onClose={closeModal}>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.1rem', marginBottom: '1.5rem', borderBottom: '3px solid var(--neo-dark)', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {modal === 'create' ? 'Tambah Hotel Baru' : 'Edit Hotel'}
            <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
          </div>
          {error && <div style={{ background: '#fff0f3', border: '3px solid var(--neo-pink)', padding: '0.75rem', marginBottom: '1rem', fontWeight: 600, color: '#be123c', fontSize: '0.875rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><AlertCircle size={16} />{error}</div>}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><label className="label">Nama Hotel *</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div><label className="label">Kota *</label><select className="input" value={form.city_id} onChange={e => setForm(f => ({ ...f, city_id: e.target.value }))} required><option value="">Pilih Kota</option>{cities.map(c => <option key={c.id_city} value={c.id_city}>{c.name}</option>)}</select></div>
            </div>
            <div><label className="label">Alamat</label><input className="input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><label className="label">Tipe Hotel</label><select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}><option value="">Pilih Tipe</option>{['Budget', 'Bintang 2', 'Bintang 3', 'Bintang 4', 'Bintang 5', 'Resort', 'Boutique'].map(t => <option key={t}>{t}</option>)}</select></div>
              <div><label className="label">Rating (0-5)</label><input type="number" className="input" min={0} max={5} step={0.1} value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} /></div>
            </div>
            <div><label className="label">Deskripsi</label><textarea className="input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', border: '3px solid var(--neo-dark)', background: form.is_featured ? 'var(--neo-yellow)' : 'white', cursor: 'pointer' }} onClick={() => setForm(f => ({ ...f, is_featured: !f.is_featured }))}>
                <input type="checkbox" checked={form.is_featured} readOnly style={{ width: 18, height: 18, accentColor: 'var(--neo-dark)' }} />
                <label className="label" style={{ margin: 0, cursor: 'pointer' }}>Is Featured</label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', border: '3px solid var(--neo-dark)', background: form.is_on_sale ? '#fff0f3' : 'white', cursor: 'pointer' }} onClick={() => setForm(f => ({ ...f, is_on_sale: !f.is_on_sale }))}>
                <input type="checkbox" checked={form.is_on_sale} readOnly style={{ width: 18, height: 18, accentColor: 'var(--neo-pink)' }} />
                <label className="label" style={{ margin: 0, cursor: 'pointer' }}>On Sale</label>
              </div>
            </div>
            {form.is_on_sale && <div><label className="label">Persen Diskon (%)</label><input type="number" className="input" min={0} max={100} value={form.discount_percent} onChange={e => setForm(f => ({ ...f, discount_percent: e.target.value }))} /></div>}
            <button type="submit" className="btn btn-dark btn-full" disabled={submitting} style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
              {submitting ? 'Menyimpan...' : <><Check size={15} /> {modal === 'create' ? 'Tambah Hotel' : 'Simpan Perubahan'}</>}
            </button>
          </form>
        </ModalOverlay>
      )}

      {/* Delete Confirm */}
      {modal === 'delete' && selected && (
        <ModalOverlay onClose={closeModal} maxWidth={420}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗑️</div>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.1rem', marginBottom: '0.75rem' }}>Hapus Hotel?</h3>
            <p style={{ color: '#6b7280', fontWeight: 500, marginBottom: '1.5rem' }}>Hotel <strong>"{selected.name}"</strong> akan dihapus permanen. Tindakan ini tidak dapat dibatalkan!</p>
            {error && <div style={{ color: '#be123c', fontWeight: 700, marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={closeModal} className="btn btn-white">Batalkan</button>
              <button onClick={handleDelete} className="btn btn-red" disabled={submitting}>{submitting ? 'Menghapus...' : 'Hapus Permanen'}</button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </AdminLayout>
  );
};

const ModalOverlay = ({ children, onClose, maxWidth = 600 }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }} onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{ background: 'white', border: '4px solid var(--neo-dark)', padding: '2rem', width: '100%', maxWidth, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--neo-shadow-lg)', animation: 'slideIn 0.2s ease' }}>
      {children}
    </div>
  </div>
);

export default AdminHotels;
