import React, { useState, useEffect } from 'react';
import { Search, Check, X, AlertCircle, Eye } from 'lucide-react';
import { formatCurrency, formatDate, statusColor } from '../../utils/formatters';
import AdminLayout from '../../components/admin/AdminLayout';
import PaginationControls from '../../components/admin/PaginationControls';
import api from '../../utils/api';
import { getErrorMessage, unwrapList } from '../../utils/response';
import { usePreferences } from '../../context/PreferencesContext';

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
const PAGE_SIZE = 25;

const AdminBookings = () => {
  const { t } = usePreferences();
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
  const [page, setPage] = useState(0);

  const load = () => {
    setLoading(true);
    setError('');
    api.get('/api/bookings').then(r => {
      const data = unwrapList(r.data);
      setBookings(data);
      setFiltered(data);
    }).catch((err) => setError(getErrorMessage(err, t('admin.errors.loadBookings')))).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(bookings.filter(b =>
      (statusFilter === 'ALL' || b.status === statusFilter) &&
      (b.orderer_name?.toLowerCase().includes(q) || b.orderer_email?.toLowerCase().includes(q) || String(b.id_booking || b.id).includes(q))
    ));
  }, [search, statusFilter, bookings]);

  useEffect(() => { setPage(0); }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const paginated = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

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
      setError(err.response?.data?.message || t('admin.errors.updateBookingStatusFailed'));
    } finally { setSubmitting(false); }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.75rem', textTransform: 'uppercase', letterSpacing: '1px', margin: 0, color: 'var(--color-text)' }}>{t('admin.bookings.title')}</h2>
          <p style={{ color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.85rem', margin: '0.25rem 0 0' }}>{t('admin.bookings.count', { count: filtered.length })}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['ALL', ...STATUS_OPTIONS].map(s => {
            const active = statusFilter === s;
            return (
              <button key={s} onClick={() => setStatusFilter(s)} style={{
                padding: '0.4rem 0.85rem', fontFamily: 'var(--font-body)', fontWeight: active ? 400 : 300, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer',
                border: active ? '1px solid var(--color-primary)' : '1px solid var(--color-accent)',
                borderRadius: 'var(--radius-sm)',
                transition: 'all 0.3s ease',
                background: active ? 'var(--color-primary)' : 'var(--color-surface)',
                color: active ? 'white' : 'var(--color-muted)',
              }}>{s}</button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 360, marginBottom: '1.5rem' }}>
        <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
        <input className="input" placeholder={t('admin.bookings.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.25rem', height: '2.25rem' }} />
      </div>

      {error && (
        <div className="alert-danger" style={{ borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <AlertCircle size={16} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
          <span style={{ fontWeight: 300, color: 'var(--color-danger)', fontSize: '0.85rem' }}>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.9rem' }}>{t('admin.bookings.loading')}</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="neo-table">
            <thead>
              <tr>{[t('admin.table.id'), t('admin.table.booker'), t('admin.table.hotel'), t('admin.table.checkIn'), t('admin.table.checkOut'), t('admin.table.total'), t('admin.table.status'), t('admin.table.actions')].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {paginated.map(b => {
                const { label } = statusColor(b.status);
                // Simplify status matching for styling
                const badgeClass = b.status === 'PENDING' ? 'orange' : b.status === 'CONFIRMED' ? 'green' : b.status === 'CANCELLED' ? 'red' : 'gray';
                return (
                  <tr key={b.id_booking || b.id}>
                    <td style={{ fontWeight: 400, color: 'var(--color-muted)', fontSize: '0.85rem' }}>#{b.id_booking || b.id}</td>
                    <td>
                      <div style={{ fontWeight: 400, fontSize: '0.9rem', color: 'var(--color-text)' }}>{b.orderer_name}</div>
                      <div style={{ color: 'var(--color-muted)', fontSize: '0.75rem', fontWeight: 300, marginTop: '0.15rem' }}>{b.orderer_email}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--color-text)', fontWeight: 300 }}>Hotel #{b.hotel_id}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--color-text)', fontWeight: 300 }}>{formatDate(b.check_in)}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--color-text)', fontWeight: 300 }}>{formatDate(b.check_out)}</td>
                    <td style={{ fontWeight: 400, color: 'var(--color-primary)', fontSize: '0.85rem' }}>{formatCurrency(b.total_price)}</td>
                    <td>
                      <span className={`badge badge-${badgeClass}`} style={{ fontSize: '0.7rem' }}>{label}</span>
                    </td>
                    <td>
                      <button onClick={() => openDetail(b)} className="btn btn-white btn-sm" style={{ padding: '0.4rem 0.8rem' }}><Eye size={12} style={{ marginRight: '0.25rem' }} /> {t('admin.actions.details')}</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.9rem' }}>{t('admin.bookings.empty')}</div>}
          <PaginationControls
            page={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Detail Modal */}
      {modal === 'detail' && selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,54,93,0.3)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-sm)', padding: '2rem', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-hover)', animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-accent)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1.2rem', margin: 0, color: 'var(--color-text)' }}>{t('admin.bookings.detailTitle', { id: selected.id_booking || selected.id })}</h3>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {[
                { l: t('admin.table.hotelId'), v: `Hotel #${selected.hotel_id}` },
                { l: t('admin.table.booker'), v: selected.orderer_name },
                { l: t('admin.table.email'), v: selected.orderer_email },
                { l: t('admin.table.phone'), v: selected.orderer_phone },
                { l: t('admin.table.checkIn'), v: formatDate(selected.check_in) },
                { l: t('admin.table.checkOut'), v: formatDate(selected.check_out) },
                { l: t('admin.table.guests'), v: t('admin.bookings.guestCount', { count: selected.number_of_guest }) },
                { l: t('admin.table.total'), v: formatCurrency(selected.total_price) },
                { l: t('admin.table.paymentMethod'), v: selected.payment_method || '-' },
              ].map(({ l, v }) => (
                <div key={l}>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '0.2rem', letterSpacing: '0.5px' }}>{l}</div>
                  <div style={{ fontWeight: 400, fontSize: '0.875rem', color: 'var(--color-text)' }}>{v}</div>
                </div>
              ))}
            </div>

            {selected.payment_proof && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>{t('admin.bookings.paymentProof')}</div>
                {selected.payment_proof.startsWith('data:image') || selected.payment_proof.match(/\.(jpeg|jpg|gif|png)$/) != null ? (
                  <img src={selected.payment_proof} alt={t('admin.bookings.paymentProof')} style={{ maxWidth: '100%', maxHeight: 240, objectFit: 'contain', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-sm)', background: 'var(--color-background)', padding: '4px' }} />
                ) : (
                  <a href={selected.payment_proof} target="_blank" rel="noopener noreferrer" className="btn btn-white btn-sm" style={{ display: 'inline-flex', alignItems: 'center' }}>{t('admin.bookings.viewPaymentProof')}</a>
                )}
              </div>
            )}

            <div style={{ borderTop: '1px dashed var(--color-accent)', paddingTop: '1.25rem' }}>
              <label className="label">{t('admin.bookings.updateStatus')}</label>
              <select className="input" value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ marginBottom: '1.25rem' }}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              {error && <div style={{ color: 'var(--color-danger)', fontWeight: 300, fontSize: '0.85rem', marginBottom: '0.75rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}><AlertCircle size={14} />{error}</div>}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={handleUpdateStatus} className="btn btn-primary btn-sm" disabled={submitting || newStatus === selected.status} style={{ flex: 1, justifyContent: 'center' }}>
                  {submitting ? t('admin.actions.saving') : <><Check size={14} /> {t('admin.actions.saveStatus')}</>}
                </button>
                <button onClick={() => setModal(null)} className="btn btn-white btn-sm">{t('admin.actions.close')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBookings;
