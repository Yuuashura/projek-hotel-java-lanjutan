import React, { useState, useEffect } from 'react';
import { Search, Shield, ShieldOff, AlertCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import PaginationControls from '../../components/admin/PaginationControls';
import LoadingState from '../../components/LoadingState';
import api from '../../utils/api';
import { getErrorMessage, unwrapList } from '../../utils/response';
import { usePreferences } from '../../context/PreferencesContext';

const PAGE_SIZE = 25;

const AdminVisitors = () => {
  const { t } = usePreferences();
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([
      api.get('/api/users'),
      api.get('/api/cities').catch(() => ({ data: { data: [] } })) // Fallback if cities fail
    ]).then(([resUsers, resCities]) => {
      const data = unwrapList(resUsers.data).filter(u => u.role === 'ROLE_USER');
      setUsers(data);
      setFiltered(data);
      setCities(unwrapList(resCities.data));
    }).catch((err) => setError(getErrorMessage(err, t('admin.errors.loadVisitors')))).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(users.filter(u => u.email?.toLowerCase().includes(q) || u.first_name?.toLowerCase().includes(q) || u.last_name?.toLowerCase().includes(q) || u.phone?.includes(q)));
  }, [search, users]);

  useEffect(() => { setPage(0); }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const paginated = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const handleToggleBan = async (userId, currentBanned) => {
    setActionLoading(userId);
    setError('');
    try {
      const endpoint = currentBanned ? `/api/users/${userId}/unban` : `/api/users/${userId}/ban`;
      await api.patch(endpoint);
      load();
    } catch (err) {
      setError(err.response?.data?.message || t('admin.errors.updateUserStatusFailed'));
    } finally { setActionLoading(null); }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.75rem', textTransform: 'uppercase', letterSpacing: '1px', margin: 0, color: 'var(--color-text)' }}>{t('admin.visitors.title')}</h2>
          <p style={{ color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.85rem', margin: '0.25rem 0 0' }}>{t('admin.visitors.count', { count: filtered.length })}</p>
        </div>
        <div style={{ position: 'relative', maxWidth: 300, width: '100%' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
          <input className="input" placeholder={t('admin.visitors.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.25rem', height: '2.25rem' }} />
        </div>
      </div>

      {error && (
        <div className="alert-danger" style={{ borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <AlertCircle size={16} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
          <span style={{ fontWeight: 300, color: 'var(--color-danger)', fontSize: '0.85rem' }}>{error}</span>
        </div>
      )}

      {loading ? (
        <LoadingState text={t('admin.visitors.loading')} compact />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="neo-table">
            <thead>
              <tr>{[t('admin.table.number'), t('admin.table.name'), t('admin.table.email'), t('admin.table.phone'), t('admin.table.city'), t('admin.table.status'), t('admin.table.actions')].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {paginated.map(u => (
                <tr key={u.id_customer || u.id}>
                  <td style={{ fontWeight: 400, color: 'var(--color-muted)', fontSize: '0.85rem' }}>#{u.id_customer || u.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--color-accent)', background: 'var(--color-background)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', fontWeight: 300, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                        {u.profile_picture ? <img src={u.profile_picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (u.first_name?.[0] || '?')}
                      </div>
                      <div>
                        <div style={{ fontWeight: 400, fontSize: '0.9rem', color: 'var(--color-text)' }}>{u.first_name} {u.last_name}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 300, color: 'var(--color-muted)', marginTop: '0.1rem' }}>{t('admin.visitors.age')}: {u.age || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--color-text)', fontWeight: 300 }}>{u.email}</td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--color-text)', fontWeight: 300 }}>{u.phone || '-'}</td>
                  <td><span className="badge badge-gray">{cities.find(c => c.id_city === u.city_id)?.name || '-'}</span></td>
                  <td>
                    {u.is_banned ? (
                      <span className="badge badge-red">{t('admin.visitors.banned')}</span>
                    ) : u.is_verified ? (
                      <span className="badge badge-green">{t('admin.visitors.active')}</span>
                    ) : (
                      <span className="badge badge-orange">{t('admin.visitors.unverified')}</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleBan(u.id_customer || u.id, u.is_banned)}
                      disabled={actionLoading === (u.id_customer || u.id)}
                      className="btn btn-white btn-sm"
                      style={{ padding: '0.4rem 0.8rem', color: u.is_banned ? 'var(--color-success)' : 'var(--color-danger)' }}
                    >
                      {actionLoading === (u.id_customer || u.id) ? '...' : u.is_banned ? <><ShieldOff size={12} style={{ marginRight: '0.25rem' }} /> Unban</> : <><Shield size={12} style={{ marginRight: '0.25rem' }} /> Ban</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.9rem' }}>{t('admin.visitors.empty')}</div>}
          <PaginationControls
            page={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminVisitors;
