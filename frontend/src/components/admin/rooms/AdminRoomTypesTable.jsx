import { ImageIcon, Pencil, Trash2, Users } from 'lucide-react';
import AdminTableShell from '../AdminTableShell';
import Button from '../../ui/Button';
import { formatCurrency } from '../../../utils/formatters';

const AdminRoomTypesTable = ({ rooms, t, onEdit, onDelete }) => (
  <AdminTableShell isEmpty={rooms.length === 0} emptyText={t('admin.rooms.empty')}>
    <table className="neo-table">
      <thead>
        <tr>
          {[t('admin.table.number'), t('admin.table.image'), t('admin.table.roomType'), t('admin.table.pricePerNight'), t('admin.table.capacity'), t('admin.table.roomsAvailable'), t('admin.table.smoking'), t('admin.table.actions')].map(header => <th key={header}>{header}</th>)}
        </tr>
      </thead>
      <tbody>
        {rooms.map(room => {
          const thumb = room.images?.[0]?.imageUrl || '';
          const smoking = room.is_smoking || room.smoking;

          return (
            <tr key={room.id_room_type}>
              <td style={{ fontWeight: 400, color: 'var(--color-muted)', fontSize: '0.85rem' }}>#{room.id_room_type}</td>
              <td>
                {thumb ? (
                  <img src={thumb} alt={room.name} style={{ width: 60, height: 45, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-accent)' }} />
                ) : (
                  <div style={{ width: 60, height: 45, background: 'var(--color-background)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ImageIcon size={14} style={{ color: 'var(--color-muted)' }} />
                  </div>
                )}
              </td>
              <td>
                <div style={{ fontWeight: 400, fontSize: '0.9rem', color: 'var(--color-text)' }}>{room.name}</div>
                <div style={{ color: 'var(--color-muted)', fontSize: '0.75rem', fontWeight: 300, marginTop: '0.15rem' }}>{room.description || t('admin.rooms.noDescription')}</div>
              </td>
              <td style={{ fontWeight: 400, color: 'var(--color-primary)', fontSize: '0.875rem' }}>{formatCurrency(room.price_per_night)}</td>
              <td style={{ fontSize: '0.85rem', color: 'var(--color-text)', fontWeight: 300 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Users size={12} style={{ color: 'var(--color-muted)' }} /> {t('admin.rooms.guests', { count: room.max_guest })}
                </div>
              </td>
              <td style={{ fontSize: '0.85rem', color: 'var(--color-text)', fontWeight: 300 }}>{t('admin.rooms.rooms', { count: room.room_available })}</td>
              <td>
                <span className={`badge ${smoking ? 'badge-gray' : 'badge-green'}`} style={{ fontSize: '0.7rem' }}>
                  {smoking ? t('admin.rooms.smokeAllowed') : t('admin.rooms.smokeFree')}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button onClick={() => onEdit(room)} variant="white" size="sm" title={t('admin.rooms.editTitle')}><Pencil size={13} /></Button>
                  <Button onClick={() => onDelete(room)} variant="white" size="sm" className="text-[var(--color-danger)]" title={t('admin.rooms.deleteRoomType')}><Trash2 size={13} /></Button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </AdminTableShell>
);

export default AdminRoomTypesTable;
