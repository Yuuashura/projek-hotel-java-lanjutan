import { useState, useEffect, useMemo } from 'react';
import { Search, Shield, ShieldOff, AlertCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import PaginationControls from '../../components/admin/PaginationControls';
import LoadingState from '../../components/LoadingState';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/uploads';
import { getErrorMessage, unwrapList } from '../../utils/response';
import { usePreferences } from '../../context/PreferencesContext';
import { cn } from '../../lib/utils';

const PAGE_SIZE = 25;

const AdminVisitors = () => {
  const { t } = usePreferences();
  const [users, setUsers] = useState([]);
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
      const data = unwrapList(resUsers.data).filter((u) => u.role === 'ROLE_USER');
      setUsers(data);
      setCities(unwrapList(resCities.data));
    }).catch((err) => setError(getErrorMessage(err, t('admin.errors.loadVisitors')))).finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
    // Initial admin data load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => u.email?.toLowerCase().includes(q) || u.first_name?.toLowerCase().includes(q) || u.last_name?.toLowerCase().includes(q) || u.phone?.includes(q));
  }, [search, users]);

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
    } finally {setActionLoading(null);}
  };

  return (
    <AdminLayout>
      <div className="[display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:2rem] [flex-wrap:wrap] [gap:1rem]">
        <div>
          <h2 className="[font-family:var(--font-heading)] [font-weight:300] [font-size:1.75rem] [text-transform:uppercase] [letter-spacing:1px] [margin:0] [color:var(--color-text)]">{t('admin.visitors.title')}</h2>
          <p className="[color:var(--color-muted)] [font-weight:300] [font-size:0.85rem] [margin:0.25rem_0_0]">{t('admin.visitors.count', { count: filtered.length })}</p>
        </div>
        <div className="[display:flex] [gap:0.75rem] [align-items:center] [flex-wrap:wrap] [justify-content:flex-end]">
          <div className="[position:relative] [max-width:300px] [width:100%]">
            <Search size={14} className="[position:absolute] [left:0.75rem] [top:50%] [transform:translateY(-50%)] [color:var(--color-muted)]" />
            <input className="input [padding-left:2.25rem] [height:2.25rem]" placeholder={t('admin.visitors.searchPlaceholder')} value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
          </div>
        </div>
      </div>

      {error &&
      <div className="alert-danger [border-radius:var(--radius-sm)] [padding:0.75rem_1rem] [margin-bottom:1.25rem] [display:flex] [gap:0.5rem] [align-items:center]">
          <AlertCircle size={16} className="[color:var(--color-danger)] [flex-shrink:0]" />
          <span className="[font-weight:300] [color:var(--color-danger)] [font-size:0.85rem]">{error}</span>
        </div>
      }

      {loading ?
      <LoadingState text={t('admin.visitors.loading')} compact /> :

      <div className="[overflow-x:auto]">
          <table className="neo-table">
            <thead>
              <tr>{[t('admin.table.number'), t('admin.table.name'), t('admin.table.email'), t('admin.table.phone'), t('admin.table.city'), t('admin.table.status'), t('admin.table.actions')].map((h) => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {paginated.map((u) =>
            <tr key={u.id_customer || u.id}>
                  <td className="[font-weight:400] [color:var(--color-muted)] [font-size:0.85rem]">#{u.id_customer || u.id}</td>
                  <td>
                    <div className="[display:flex] [align-items:center] [gap:0.75rem]">
                      <div className="[width:36px] [height:36px] [border-radius:50%] [border:1px_solid_var(--color-accent)] [background:var(--color-background)] [display:flex] [align-items:center] [justify-content:center] [flex-shrink:0] [overflow:hidden] [font-weight:300] [font-size:0.9rem] [color:var(--color-text)]">
                        {u.profile_picture ? <img src={getImageUrl(u.profile_picture)} alt="" className="[width:100%] [height:100%] [object-fit:cover]" /> : u.first_name?.[0] || '?'}
                      </div>
                      <div>
                        <div className="[font-weight:400] [font-size:0.9rem] [color:var(--color-text)]">{u.first_name} {u.last_name}</div>
                        <div className="[font-size:0.75rem] [font-weight:300] [color:var(--color-muted)] [margin-top:0.1rem]">{t('admin.visitors.age')}: {u.age || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="[font-size:0.875rem] [color:var(--color-text)] [font-weight:300]">{u.email}</td>
                  <td className="[font-size:0.875rem] [color:var(--color-text)] [font-weight:300]">{u.phone || '-'}</td>
                  <td><span className="badge badge-gray">{cities.find((c) => c.id_city === u.city_id)?.name || '-'}</span></td>
                  <td>
                    {u.is_banned ?
                <span className="badge badge-red">{t('admin.visitors.banned')}</span> :
                u.is_verified ?
                <span className="badge badge-green">{t('admin.visitors.active')}</span> :

                <span className="badge badge-orange">{t('admin.visitors.unverified')}</span>
                }
                  </td>
                  <td>
                    <button
                  onClick={() => handleToggleBan(u.id_customer || u.id, u.is_banned)}
                  disabled={actionLoading === (u.id_customer || u.id)}
                  className={cn('btn btn-white btn-sm px-3 py-1.5', u.is_banned ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]')}>

                      {actionLoading === (u.id_customer || u.id) ? '...' : u.is_banned ? <><ShieldOff size={12} className="[margin-right:0.25rem]" /> Unban</> : <><Shield size={12} className="[margin-right:0.25rem]" /> Ban</>}
                    </button>
                  </td>
                </tr>
            )}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="card [text-align:center] [padding:3rem] [color:var(--color-muted)] [font-weight:300] [font-size:0.9rem]">{t('admin.visitors.empty')}</div>}
          <PaginationControls
          page={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage} />

        </div>
      }
    </AdminLayout>);

};

export default AdminVisitors;
