import React, { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Check, AlertCircle, Star, MapPin, Bed, ImageIcon, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';
import AdminLayout from '../../components/admin/AdminLayout';
import PaginationControls from '../../components/admin/PaginationControls';
import api from '../../utils/api';
import CitySearchSelect from '../../components/CitySearchSelect';
import { getErrorMessage, unwrapList } from '../../utils/response';
import { uploadFile, validateImageFile } from '../../utils/uploads';

const EMPTY_FORM = { name: '', city_id: '', address: '', type: '', description: '', is_featured: false, is_on_sale: false, discount_percent: 0, rating: 0, image_url: '' };
const PAGE_SIZE = 25;

const AdminHotels = () => {
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
  const fileRef = useRef();
  const excelRef = useRef();

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([
      api.get('/api/hotels'),
      api.get('/api/cities'),
    ]).then(([h, c]) => {
      setHotels(unwrapList(h.data));
      setCities(unwrapList(c.data));
    }).catch((err) => setError(getErrorMessage(err, 'Gagal memuat data hotel'))).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setImagesList([]);
    setError('');
    setModal('create');
  };

  const openEdit = (h) => {
    setSelected(h);
    const hotelImgs = h.images?.map(img => img.imageUrl || img.image_url).filter(Boolean) || [];
    setImagesList(hotelImgs);
    setForm({ 
      name: h.name, 
      city_id: h.city?.id_city || '', 
      address: h.address || '', 
      type: h.type || '', 
      description: h.description || '', 
      is_featured: h.featured, 
      is_on_sale: h.onSale, 
      discount_percent: h.discount_percent || 0, 
      rating: h.rating || 0, 
      image_url: hotelImgs.join('|||') 
    });
    setError('');
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
      setError(err.response?.data?.message || 'Gagal mengunggah gambar hotel');
    } finally {
      setImageUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setError('File harus berformat .xlsx');
      return;
    }

    setExcelUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post('/api/hotels/upload-excel', formData);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengunggah file Excel');
    } finally {
      setExcelUploading(false);
      if (excelRef.current) excelRef.current.value = '';
    }
  };

  const totalPages = Math.max(1, Math.ceil(hotels.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const paginatedHotels = hotels.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.75rem', textTransform: 'uppercase', letterSpacing: '1px', margin: 0, color: 'var(--color-text)' }}>Kelola Hotel</h2>
          <p style={{ color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.85rem', margin: '0.25rem 0 0' }}>{hotels.length} hotel terdaftar</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => excelRef.current?.click()} className="btn btn-white btn-sm" disabled={excelUploading}>
            <Upload size={14} /> {excelUploading ? 'Mengunggah...' : 'Upload Excel'}
          </button>
          <button onClick={openCreate} className="btn btn-primary btn-sm"><Plus size={14} /> Tambah Hotel</button>
          <input ref={excelRef} type="file" accept=".xlsx" style={{ display: 'none' }} onChange={handleExcelUpload} />
        </div>
      </div>

      {error && (
        <div style={{ background: '#fff0f3', border: '1px solid #fda4af', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <AlertCircle size={16} style={{ color: '#be123c', flexShrink: 0 }} />
          <span style={{ fontWeight: 300, color: '#be123c', fontSize: '0.85rem' }}>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.9rem' }}>Memuat data hotel...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="neo-table">
            <thead>
              <tr>{['#', 'Hotel', 'Kota', 'Tipe', 'Rating', 'Status', 'Aksi'].map(h => <th key={h}>{h}</th>)}</tr>
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
                      <Link to={`/admin/hotels/${h.id_hotel}/rooms`} className="btn btn-white btn-sm" style={{ padding: '0.4rem 0.8rem' }} title="Kelola Kamar"><Bed size={13} /></Link>
                      <button onClick={() => openEdit(h)} className="btn btn-white btn-sm" style={{ padding: '0.4rem 0.8rem' }} title="Edit Hotel"><Pencil size={13} /></button>
                      <button onClick={() => openDelete(h)} className="btn btn-white btn-sm" style={{ padding: '0.4rem 0.8rem', color: '#be123c' }} title="Hapus Hotel"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {hotels.length === 0 && <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.9rem' }}>Belum ada data hotel</div>}
          <PaginationControls
            page={currentPage}
            totalPages={totalPages}
            totalItems={hotels.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Create/Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <ModalOverlay onClose={closeModal}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-accent)', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text)' }}>
            {modal === 'create' ? 'Tambah Hotel Baru' : 'Edit Hotel'}
            <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}><X size={18} /></button>
          </div>
          {error && <div style={{ background: '#fff0f3', border: '1px solid #fda4af', borderRadius: 'var(--radius-sm)', padding: '0.75rem', marginBottom: '1.25rem', fontWeight: 300, color: '#be123c', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><AlertCircle size={16} />{error}</div>}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div><label className="label">Nama Hotel *</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                <div><label className="label">Kota *</label><CitySearchSelect cities={cities} value={form.city_id} onChange={val => setForm(f => ({ ...f, city_id: val }))} placeholder="Pilih Kota" /></div>
              </div>
              <div><label className="label">Alamat</label><input className="input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div><label className="label">Tipe Hotel</label><select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}><option value="">Pilih Tipe</option>{['Budget', 'Bintang 2', 'Bintang 3', 'Bintang 4', 'Bintang 5', 'Resort', 'Boutique'].map(t => <option key={t}>{t}</option>)}</select></div>
                <div><label className="label">Rating (0-5)</label><input type="number" className="input" min={0} max={5} step={0.1} value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} /></div>
              </div>
              <div><label className="label">Deskripsi</label><textarea className="input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} /></div>
              
              {/* Multiple Images Upload Section */}
              <div>
                <label className="label"><ImageIcon size={12} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />Galeri Foto Hotel</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  {imagesList.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', height: 75, border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', border: '1px solid var(--color-accent)', background: form.is_featured ? 'rgba(212,175,55,0.03)' : 'white', cursor: 'pointer', borderRadius: 'var(--radius-sm)', transition: 'all 0.3s ease' }} onClick={() => setForm(f => ({ ...f, is_featured: !f.is_featured }))}>
                  <input type="checkbox" checked={form.is_featured} readOnly style={{ width: 15, height: 15, accentColor: 'var(--color-primary)' }} />
                  <label className="label" style={{ margin: 0, cursor: 'pointer', color: 'var(--color-text)' }}>Is Featured</label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', border: '1px solid var(--color-accent)', background: form.is_on_sale ? 'rgba(229,62,62,0.03)' : 'white', cursor: 'pointer', borderRadius: 'var(--radius-sm)', transition: 'all 0.3s ease' }} onClick={() => setForm(f => ({ ...f, is_on_sale: !f.is_on_sale }))}>
                  <input type="checkbox" checked={form.is_on_sale} readOnly style={{ width: 15, height: 15, accentColor: '#E53E3E' }} />
                  <label className="label" style={{ margin: 0, cursor: 'pointer', color: 'var(--color-text)' }}>On Sale</label>
                </div>
              </div>
              {form.is_on_sale && <div><label className="label">Persen Diskon (%)</label><input type="number" className="input" min={0} max={100} value={form.discount_percent} onChange={e => setForm(f => ({ ...f, discount_percent: e.target.value }))} /></div>}
              <button type="submit" className="btn btn-primary btn-full" disabled={submitting} style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
                {submitting ? 'Menyimpan...' : <><Check size={14} /> {modal === 'create' ? 'Tambah Hotel' : 'Simpan Perubahan'}</>}
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
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--color-text)' }}>Hapus Hotel?</h3>
            <p style={{ color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>Hotel <strong>"{selected.name}"</strong> akan dihapus permanen beserta seluruh tipe kamar dan data pemesanan di dalamnya.</p>
            {error && <div style={{ color: '#be123c', fontWeight: 400, marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}
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

const ModalOverlay = ({ children, onClose, maxWidth = 550 }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,54,93,0.3)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }} onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{ background: 'white', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-sm)', padding: '2rem', width: '100%', maxWidth, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-hover)', animation: 'fadeIn 0.2s ease-out' }}>
      {children}
    </div>
  </div>
);

export default AdminHotels;
