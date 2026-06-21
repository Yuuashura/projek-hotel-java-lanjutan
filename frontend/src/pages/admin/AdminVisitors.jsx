import { useState, useEffect, useMemo } from 'react';
import { Search, Shield, ShieldOff, AlertCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import PaginationControls from '../../components/admin/PaginationControls';
import LoadingState from '../../components/LoadingState';
import api from '../../utils/api';
import { cachedGet } from '../../utils/requestCache';
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
    cachedGet('/api/cities').catch(() => ({ data: { data: [] } })) // Fallback if cities fail
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
            <input className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm [padding-left:2.25rem] [height:2.25rem]" placeholder={t('admin.visitors.searchPlaceholder')} value={search} onChange={(e) => {setSearch(e.target.value);setPage(0);}} />
          </div>
        </div>
      </div>

      {error &&
      <div className="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger)] [border-radius:var(--radius-sm)] [padding:0.75rem_1rem] [margin-bottom:1.25rem] [display:flex] [gap:0.5rem] [align-items:center]">
          <AlertCircle size={16} className="[color:var(--color-danger)] [flex-shrink:0]" />
          <span className="[font-weight:300] [color:var(--color-danger)] [font-size:0.85rem]">{error}</span>
        </div>
      }

      {loading ?
      <LoadingState text={t('admin.visitors.loading')} compact /> :

      <div className="[overflow-x:auto]">
          <table className="w-full min-w-[720px] border-collapse overflow-hidden rounded-lg border border-[var(--color-accent)] bg-[var(--glass-bg)] text-left text-sm [&_th]:border-b-2 [&_th]:border-[var(--color-accent)] [&_th]:bg-[var(--color-background)] [&_th]:px-4 [&_th]:py-3 [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:text-[var(--color-text)] [&_td]:border-b [&_td]:border-[var(--color-accent)] [&_td]:px-4 [&_td]:py-3 [&_td]:text-[var(--color-text)] [&_td]:align-middle [&_tbody_tr:hover_td]:bg-[var(--color-background)] max-sm:[&_th]:px-3 max-sm:[&_th]:py-3 max-sm:[&_td]:px-3 max-sm:[&_td]:py-3">
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
                  <td><span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-accent)] bg-[var(--color-background)] px-3 py-1 text-[0.7rem] font-medium uppercase text-[var(--color-text)] max-sm:px-2.5 max-sm:py-1 max-sm:text-[0.64rem] border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-muted)]">{cities.find((c) => c.id_city === u.city_id)?.name || '-'}</span></td>
                  <td>
                    {u.is_banned ?
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-accent)] bg-[var(--color-background)] px-3 py-1 text-[0.7rem] font-medium uppercase text-[var(--color-text)] max-sm:px-2.5 max-sm:py-1 max-sm:text-[0.64rem] border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]">{t('admin.visitors.banned')}</span> :
                u.is_verified ?
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-accent)] bg-[var(--color-background)] px-3 py-1 text-[0.7rem] font-medium uppercase text-[var(--color-text)] max-sm:px-2.5 max-sm:py-1 max-sm:text-[0.64rem] border-[var(--color-success-border)] bg-[var(--color-success-soft)] text-[var(--color-success)]">{t('admin.visitors.active')}</span> :

                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-accent)] bg-[var(--color-background)] px-3 py-1 text-[0.7rem] font-medium uppercase text-[var(--color-text)] max-sm:px-2.5 max-sm:py-1 max-sm:text-[0.64rem] border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] text-[var(--color-warning)]">{t('admin.visitors.unverified')}</span>
                }
                  </td>
                  <td>
                    <button
                  onClick={() => handleToggleBan(u.id_customer || u.id, u.is_banned)}
                  disabled={actionLoading === (u.id_customer || u.id)}
                  className={cn("inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--color-text)] backdrop-blur-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-background)] min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem] px-3 py-1.5", u.is_banned ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]')}>

                      {actionLoading === (u.id_customer || u.id) ? '...' : u.is_banned ? <><ShieldOff size={12} className="[margin-right:0.25rem]" /> Unban</> : <><Shield size={12} className="[margin-right:0.25rem]" /> Ban</>}
                    </button>
                  </td>
                </tr>
            )}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--color-text)] shadow-[var(--shadow-float)] backdrop-blur-xl transition-all duration-300 [text-align:center] [padding:3rem] [color:var(--color-muted)] [font-weight:300] [font-size:0.9rem]">{t('admin.visitors.empty')}</div>}
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
