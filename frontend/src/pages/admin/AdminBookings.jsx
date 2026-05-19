import React, { useState, useEffect } from 'react';
import { Search, Check, X, AlertCircle, Eye } from 'lucide-react';
import { formatCurrency, formatDate, statusColor } from '../../utils/formatters';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../utils/api';

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];

const AdminBookings = () => {
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

  const load = () => {
    setLoading(true);
    api.get('/api/bookings').then(r => {
      const data = r.data.data || [];
      setBookings(data);
      setFiltered(data);
    }).catch(() => setError('Gagal memuat data pemesanan')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(bookings.filter(b =>
      (statusFilter === 'ALL' || b.status === statusFilter) &&
      (b.orderer_name?.toLowerCase().includes(q) || b.orderer_email?.toLowerCase().includes(q) || String(b.id_booking || b.id).includes(q))
    ));
  }, [search, statusFilter, bookings]);

  const openDetail = (b) => { setSelected(b); setNewStatus(b.status); setError(''); setModal('detail'); };

  const handleUpdateStatus = async () => {
    if (newStatus === selected.status) return;
    setSubmitting(true);
    setError('');
    try {
      await api.patch(`/api/bookings/${selected.id_booking || selected.id}/status`, { status: newStatus });
      setModal(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengubah status');
    } finally { setSubmitting(false); }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1.5rem', textTransform: 'uppercase', margin: 0 }}>Kelola Pemesanan</h2>
          <p style={{ color: '#9ca3af', fontWeight: 500, fontSize: '0.875rem', margin: '0.25rem 0 0' }}>{filtered.length} pesanan ditemukan</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {['ALL', ...STATUS_OPTIONS].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '0.4rem 0.875rem', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', cursor: 'pointer', border: '2px solid var(--neo-dark)', transition: 'all 0.1s',
              background: statusFilter === s ? 'var(--neo-dark)' : 'white',
              color: statusFilter === s ? 'white' : '#6b7280',
              boxShadow: statusFilter === s ? '2px 2px 0px 0px var(--neo-orange)' : 'none',
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 360, marginBottom: '1.25rem' }}>
        <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
        <input className="input" placeholder="Cari nama, email, ID..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
      </div>

      {error && (
        <div style={{ background: '#fff0f3', border: '3px solid var(--neo-pink)', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', boxShadow: '3px 3px 0px 0px var(--neo-pink)' }}>
          <AlertCircle size={16} style={{ color: 'var(--neo-pink)', flexShrink: 0 }} />
          <span style={{ fontWeight: 700, color: '#be123c', fontSize: '0.875rem' }}>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', fontWeight: 600 }}>Memuat data pemesanan...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="neo-table">
            <thead>
              <tr>{['ID', 'Pemesan', 'Hotel', 'Check-In', 'Check-Out', 'Total', 'Status', 'Aksi'].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(b => {
                const { bg, color, label } = statusColor(b.status);
                return (
                  <tr key={b.id_booking || b.id}>
                    <td style={{ fontFamily: 'Space Grotesk', fontWeight: 700 }}>#{b.id_booking || b.id}</td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{b.orderer_name}</div>
                      <div style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: 500 }}>{b.orderer_email}</div>
                    </td>
                    <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>Hotel #{b.hotel_id}</td>
                    <td style={{ fontWeight: 500 }}>{formatDate(b.check_in)}</td>
                    <td style={{ fontWeight: 500 }}>{formatDate(b.check_out)}</td>
                    <td style={{ fontFamily: 'Space Grotesk', fontWeight: 700, color: 'var(--neo-orange)' }}>{formatCurrency(b.total_price)}</td>
                    <td>
                      <span className="badge" style={{ background: bg, color, border: '2px solid var(--neo-dark)', boxShadow: '2px 2px 0px 0px var(--neo-dark)' }}>{label}</span>
                    </td>
                    <td>
                      <button onClick={() => openDetail(b)} className="btn btn-blue btn-sm"><Eye size={13} /> Detail</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', fontWeight: 600 }}>Tidak ada data pemesanan</div>}
        </div>
      )}

      {/* Detail Modal */}
      {modal === 'detail' && selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={{ background: 'white', border: '4px solid var(--neo-dark)', padding: '2rem', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--neo-shadow-lg)', animation: 'slideIn 0.2s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '3px solid var(--neo-dark)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, textTransform: 'uppercase', fontSize: '1rem', margin: 0 }}>Detail Pesanan #{selected.id_booking || selected.id}</h3>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { l: 'Hotel ID', v: `Hotel #${selected.hotel_id}` },
                { l: 'Pemesan', v: selected.orderer_name },
                { l: 'Email', v: selected.orderer_email },
                { l: 'Telepon', v: selected.orderer_phone },
                { l: 'Check-In', v: formatDate(selected.check_in) },
                { l: 'Check-Out', v: formatDate(selected.check_out) },
                { l: 'Jumlah Tamu', v: `${selected.number_of_guest} orang` },
                { l: 'Total', v: formatCurrency(selected.total_price) },
                { l: 'Metode Bayar', v: selected.payment_method || '-' },
              ].map(({ l, v }) => (
                <div key={l}>
                  <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '0.25rem' }}>{l}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{v}</div>
                </div>
              ))}
            </div>

            {selected.payment_proof && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '0.5rem' }}>Bukti Pembayaran</div>
                <a href={selected.payment_proof} target="_blank" rel="noopener noreferrer" className="btn btn-blue btn-sm">Lihat Bukti Bayar</a>
              </div>
            )}

            <div style={{ borderTop: '3px dashed var(--neo-dark)', paddingTop: '1.25rem' }}>
              <label className="label">Ubah Status Pesanan</label>
              <select className="input" value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ marginBottom: '1rem' }}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              {error && <div style={{ color: '#be123c', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.75rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}><AlertCircle size={14} />{error}</div>}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={handleUpdateStatus} className="btn btn-dark" disabled={submitting || newStatus === selected.status} style={{ opacity: (submitting || newStatus === selected.status) ? 0.65 : 1 }}>
                  {submitting ? 'Menyimpan...' : <><Check size={14} /> Simpan Status</>}
                </button>
                <button onClick={() => setModal(null)} className="btn btn-white">Tutup</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBookings;
