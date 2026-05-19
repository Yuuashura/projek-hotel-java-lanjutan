import React, { useState, useEffect } from 'react';
import { Search, Shield, ShieldOff, AlertCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../utils/api';

const AdminVisitors = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/api/users'),
      api.get('/api/cities').catch(() => ({ data: { data: [] } })) // Fallback if cities fail
    ]).then(([resUsers, resCities]) => {
      const data = (resUsers.data || []).filter(u => u.role === 'ROLE_USER');
      setUsers(data);
      setFiltered(data);
      setCities(resCities.data.data || []);
    }).catch(() => setError('Gagal memuat data pengunjung')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(users.filter(u => u.email?.toLowerCase().includes(q) || u.first_name?.toLowerCase().includes(q) || u.last_name?.toLowerCase().includes(q) || u.phone?.includes(q)));
  }, [search, users]);

  const handleToggleBan = async (userId, currentBanned) => {
    setActionLoading(userId);
    setError('');
    try {
      const endpoint = currentBanned ? `/api/users/${userId}/unban` : `/api/users/${userId}/ban`;
      await api.patch(endpoint);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengubah status user');
    } finally { setActionLoading(null); }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1.5rem', textTransform: 'uppercase', margin: 0 }}>Kelola Pengunjung</h2>
          <p style={{ color: '#9ca3af', fontWeight: 500, fontSize: '0.875rem', margin: '0.25rem 0 0' }}>{filtered.length} user terdaftar</p>
        </div>
        <div style={{ position: 'relative', maxWidth: 300, width: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input className="input" placeholder="Cari nama, email, telepon..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
        </div>
      </div>

      {error && (
        <div style={{ background: '#fff0f3', border: '3px solid var(--neo-pink)', padding: '0.875rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center', boxShadow: '3px 3px 0px 0px var(--neo-pink)' }}>
          <AlertCircle size={16} style={{ color: 'var(--neo-pink)', flexShrink: 0 }} />
          <span style={{ fontWeight: 700, color: '#be123c', fontSize: '0.875rem' }}>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', fontWeight: 600 }}>Memuat data pengunjung...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="neo-table">
            <thead>
              <tr>{['#', 'Nama', 'Email', 'Telepon', 'Kota', 'Status', 'Aksi'].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id_customer || u.id}>
                  <td style={{ fontFamily: 'Space Grotesk', fontWeight: 700 }}>#{u.id_customer || u.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 36, height: 36, border: '2px solid var(--neo-dark)', background: 'var(--neo-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '0.9rem' }}>
                        {u.profile_picture ? <img src={u.profile_picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (u.first_name?.[0] || '?')}
                      </div>
                      <div>
                        <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.9rem' }}>{u.first_name} {u.last_name}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#9ca3af' }}>Umur: {u.age}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500, fontSize: '0.875rem' }}>{u.email}</td>
                  <td style={{ fontWeight: 500, fontSize: '0.875rem' }}>{u.phone}</td>
                  <td><span className="badge badge-gray">{cities.find(c => c.id_city === u.city_id)?.name || '-'}</span></td>
                  <td>
                    {u.is_banned ? (
                      <span className="badge badge-red">BANNED</span>
                    ) : u.is_verified ? (
                      <span className="badge badge-green">AKTIF</span>
                    ) : (
                      <span className="badge badge-yellow">BELUM VERIF.</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleBan(u.id_customer || u.id, u.is_banned)}
                      disabled={actionLoading === (u.id_customer || u.id)}
                      className={u.is_banned ? 'btn btn-green btn-sm' : 'btn btn-sm'}
                      style={!u.is_banned ? { background: '#fff0f3', color: 'var(--neo-pink)', border: '3px solid var(--neo-pink)', boxShadow: '3px 3px 0px 0px var(--neo-pink)' } : {}}
                    >
                      {actionLoading === (u.id_customer || u.id) ? '...' : u.is_banned ? <><ShieldOff size={13} /> Unban</> : <><Shield size={13} /> Ban</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', fontWeight: 600 }}>Tidak ada pengunjung ditemukan</div>}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminVisitors;
