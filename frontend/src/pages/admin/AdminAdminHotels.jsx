import { useState, useEffect } from 'react';
import { Search, Shield, ShieldOff, AlertCircle, Plus, X, Building2 } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import PaginationControls from '../../components/admin/PaginationControls';
import LoadingState from '../../components/LoadingState';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/uploads';
import { getErrorMessage, unwrapList } from '../../utils/response';
import { usePreferences } from '../../context/PreferencesContext';
import { cn } from '../../lib/utils';

const PAGE_SIZE = 25;
const PHONE_PATTERN = /^08\d{0,12}$/;
const PHONE_ERROR = 'Nomor telepon harus diawali 08 dan maksimal 14 digit';

const EMPTY_ADMIN_FORM = {
  first_name: '',
  last_name: '',
  age: '',
  city_id: '',
  phone: '',
  email: '',
  password: ''
};

const AdminAdminHotels = () => {
  const { t } = usePreferences();
  const [admins, setAdmins] = useState([]);
  const [hotelCounts, setHotelCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminForm, setAdminForm] = useState(EMPTY_ADMIN_FORM);
  const [adminSubmitting, setAdminSubmitting] = useState(false);
  const [cities, setCities] = useState([]);

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([
    api.get('/api/users/admin-hotels'),
    api.get('/api/hotels'),
    api.get('/api/cities').catch(() => ({ data: { data: [] } }))]
    ).then(([resAdmins, resHotels, resCities]) => {
      const adminList = unwrapList(resAdmins.data);
      setAdmins(adminList);

      const allHotels = unwrapList(resHotels.data);
      const counts = {};
      allHotels.forEach((h) => {
        const ownerId = h.admin_hotel_id ?? h.adminHotelId;
        if (ownerId) {
          counts[ownerId] = (counts[ownerId] || 0) + 1;
        }
      });
      setHotelCounts(counts);
      setCities(unwrapList(resCities.data));
    }).catch((err) => setError(getErrorMessage(err, 'Failed to load admin hotels data'))).finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const filtered = search ?
  admins.filter((a) =>
  a.email?.toLowerCase().includes(search.toLowerCase()) ||
  a.first_name?.toLowerCase().includes(search.toLowerCase()) ||
  a.last_name?.toLowerCase().includes(search.toLowerCase()) ||
  a.phone?.includes(search)
  ) :
  admins;

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
      setError(getErrorMessage(err, t('admin.errors.updateUserStatusFailed')));
    } finally {setActionLoading(null);}
  };

  const openAdminModal = () => {
    setAdminForm(EMPTY_ADMIN_FORM);
    setError('');
    setAdminModalOpen(true);
  };

  const closeAdminModal = () => {
    if (adminSubmitting) return;
    setAdminModalOpen(false);
  };

  const handleCreateAdminHotel = async (event) => {
    event.preventDefault();
    setError('');
    if (!PHONE_PATTERN.test(adminForm.phone)) {
      setError(PHONE_ERROR);
      return;
    }
    setAdminSubmitting(true);
    try {
      await api.post('/api/auth/admin-hotels', {
        ...adminForm,
        age: Number(adminForm.age),
        city_id: Number(adminForm.city_id || 0)
      });
      setAdminModalOpen(false);
      setAdminForm(EMPTY_ADMIN_FORM);
      load();
    } catch (err) {
      setError(getErrorMessage(err, t('admin.errors.createAdminHotelFailed')));
    } finally {
      setAdminSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="[display:flex] [justify-content:space-between] [align-items:center] [margin-bottom:2rem] [flex-wrap:wrap] [gap:1rem]">
        <div>
          <h2 className="[font-family:var(--font-heading)] [font-weight:300] [font-size:1.75rem] [text-transform:uppercase] [letter-spacing:1px] [margin:0] [color:var(--color-text)]">{t('admin.adminHotels.title')}</h2>
          <p className="[color:var(--color-muted)] [font-weight:300] [font-size:0.85rem] [margin:0.25rem_0_0]">{t('admin.adminHotels.count', { count: filtered.length })}</p>
        </div>
        <div className="[display:flex] [gap:0.75rem] [align-items:center] [flex-wrap:wrap] [justify-content:flex-end]">
          <button className="btn btn-primary btn-sm" onClick={openAdminModal}>
            <Plus size={14} /> {t('admin.adminHotels.addAdminHotel')}
          </button>
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
      <LoadingState text={t('admin.adminHotels.loading')} compact /> :

      <div className="[overflow-x:auto]">
          <table className="neo-table">
            <thead>
              <tr>
                {[t('admin.table.number'), t('admin.table.name'), t('admin.table.email'), t('admin.table.phone'), t('admin.table.city'), t('admin.adminHotels.hotelsManaged'), t('admin.table.status'), t('admin.table.actions')].map((h) => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {paginated.map((a) =>
            <tr key={a.id_customer || a.id}>
                  <td className="[font-weight:400] [color:var(--color-muted)] [font-size:0.85rem]">#{a.id_customer || a.id}</td>
                  <td>
                    <div className="[display:flex] [align-items:center] [gap:0.75rem]">
                      <div className="[width:36px] [height:36px] [border-radius:50%] [border:1px_solid_var(--color-accent)] [background:var(--color-background)] [display:flex] [align-items:center] [justify-content:center] [flex-shrink:0] [overflow:hidden] [font-weight:300] [font-size:0.9rem] [color:var(--color-text)]">
                        {a.profile_picture ? <img src={getImageUrl(a.profile_picture)} alt="" className="[width:100%] [height:100%] [object-fit:cover]" /> : a.first_name?.[0] || '?'}
                      </div>
                      <div>
                        <div className="[font-weight:400] [font-size:0.9rem] [color:var(--color-text)]">{a.first_name} {a.last_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="[font-size:0.875rem] [color:var(--color-text)] [font-weight:300]">{a.email}</td>
                  <td className="[font-size:0.875rem] [color:var(--color-text)] [font-weight:300]">{a.phone || '-'}</td>
                  <td><span className="badge badge-gray">{cities.find((c) => c.id_city === a.city_id)?.name || '-'}</span></td>
                  <td>
                    <div className="[display:flex] [align-items:center] [gap:0.4rem]">
                      <Building2 size={14} className="[color:var(--color-primary)]" />
                      <span className="[font-weight:400] [font-size:0.875rem] [color:var(--color-text)]">
                        {hotelCounts[a.id_customer || a.id] || 0}
                      </span>
                    </div>
                  </td>
                  <td>
                    {a.is_banned ?
                <span className="badge badge-red">{t('admin.visitors.banned')}</span> :

                <span className="badge badge-green">{t('admin.visitors.active')}</span>
                }
                  </td>
                  <td>
                    <div className="[display:flex] [gap:0.5rem]">
                      <button
                    onClick={() => handleToggleBan(a.id_customer || a.id, a.is_banned)}
                    disabled={actionLoading === (a.id_customer || a.id)}
                    className={cn('btn btn-white btn-sm px-3 py-1.5', a.is_banned ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]')}>

                        {actionLoading === (a.id_customer || a.id) ? '...' : a.is_banned ? <><ShieldOff size={12} className="[margin-right:0.25rem]" /> {t('admin.visitors.unban')}</> : <><Shield size={12} className="[margin-right:0.25rem]" /> {t('admin.visitors.ban')}</>}
                      </button>
                    </div>
                  </td>
                </tr>
            )}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="card [text-align:center] [padding:3rem] [color:var(--color-muted)] [font-weight:300] [font-size:0.9rem]">{t('admin.adminHotels.empty')}</div>}
          <PaginationControls
          page={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage} />

        </div>
      }

      {adminModalOpen &&
      <div onClick={closeAdminModal} className="[position:fixed] [inset:0] [background:rgba(26,54,93,0.3)] [backdrop-filter:blur(4px)] [display:flex] [align-items:center] [justify-content:center] [z-index:100] [padding:1rem]">
          <div onClick={(e) => e.stopPropagation()} className="[background:var(--color-surface)] [border:1px_solid_var(--color-accent)] [border-radius:var(--radius-sm)] [padding:2rem] [width:100%] [max-width:560px] [max-height:90vh] [overflow-y:auto] [box-shadow:var(--shadow-hover)]">
            <div className="[display:flex] [justify-content:space-between] [gap:1rem] [align-items:center] [margin-bottom:1.5rem]">
              <div>
                <h3 className="[font-family:var(--font-heading)] [font-weight:300] [text-transform:uppercase] [letter-spacing:1px] [margin:0] [color:var(--color-text)]">{t('admin.visitors.createAdminHotelTitle')}</h3>
                <p className="[margin:0.25rem_0_0] [color:var(--color-muted)] [font-weight:300] [font-size:0.85rem]">{t('admin.visitors.createAdminHotelSubtitle')}</p>
              </div>
              <button className="btn btn-white btn-sm [padding:0.5rem]" type="button" onClick={closeAdminModal} disabled={adminSubmitting}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateAdminHotel} className="[display:flex] [flex-direction:column] [gap:1rem]">
              <div className="[display:grid] [grid-template-columns:1fr_1fr] [gap:1rem]">
                <div>
                  <label className="label">{t('admin.visitors.firstName')}</label>
                  <input className="input" value={adminForm.first_name} onChange={(e) => setAdminForm((f) => ({ ...f, first_name: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">{t('admin.visitors.lastName')}</label>
                  <input className="input" value={adminForm.last_name} onChange={(e) => setAdminForm((f) => ({ ...f, last_name: e.target.value }))} />
                </div>
              </div>

              <div className="[display:grid] [grid-template-columns:1fr_1fr] [gap:1rem]">
                <div>
                  <label className="label">{t('admin.visitors.email')}</label>
                  <input type="email" className="input" value={adminForm.email} onChange={(e) => setAdminForm((f) => ({ ...f, email: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">{t('admin.visitors.password')}</label>
                  <input type="password" className="input" minLength={6} value={adminForm.password} onChange={(e) => setAdminForm((f) => ({ ...f, password: e.target.value }))} required />
                </div>
              </div>

              <div className="[display:grid] [grid-template-columns:1fr_1fr_1fr] [gap:1rem]">
                <div>
                  <label className="label">{t('admin.visitors.age')}</label>
                  <input type="number" min="1" className="input" value={adminForm.age} onChange={(e) => setAdminForm((f) => ({ ...f, age: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">{t('admin.visitors.city')}</label>
                  <select className="input" value={adminForm.city_id} onChange={(e) => setAdminForm((f) => ({ ...f, city_id: e.target.value }))}>
                    <option value="">{t('admin.visitors.chooseCity')}</option>
                    {cities.map((city) => <option key={city.id_city} value={city.id_city}>{city.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">{t('admin.visitors.phone')}</label>
                  <input className="input" type="tel" inputMode="numeric" maxLength={14} pattern="^08[0-9]{0,12}$" title={PHONE_ERROR} value={adminForm.phone} onChange={(e) => setAdminForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 14) }))} />
                </div>
              </div>

              <div className="[display:flex] [gap:0.75rem] [justify-content:flex-end] [margin-top:0.5rem]">
                <button type="button" onClick={closeAdminModal} className="btn btn-white btn-sm" disabled={adminSubmitting}>{t('admin.actions.cancel')}</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={adminSubmitting}>{adminSubmitting ? t('admin.actions.saving') : t('admin.visitors.saveAdminHotel')}</button>
              </div>
            </form>
          </div>
        </div>
      }
    </AdminLayout>);

};

export default AdminAdminHotels;
