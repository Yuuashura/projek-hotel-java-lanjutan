import { Link } from 'react-router-dom';
import { Bed, MapPin, Pencil, Star, Trash2 } from 'lucide-react';
import PaginationControls from '../PaginationControls';
import AdminTableShell from '../AdminTableShell';
import Button from '../../ui/Button';

const AdminHotelTable = ({ hotels, pagination, pageSize, t, onEdit, onDelete, onPageChange }) => (
  <AdminTableShell isEmpty={hotels.length === 0} emptyText={t('admin.hotels.empty')}>
    <table className="neo-table">
      <thead>
        <tr>{[t('admin.table.number'), t('admin.table.hotel'), t('admin.table.city'), t('admin.table.type'), t('admin.table.rating'), t('admin.table.status'), t('admin.table.actions')].map(header => <th key={header}>{header}</th>)}</tr>
      </thead>
      <tbody>
        {hotels.map(hotel => (
          <tr key={hotel.id_hotel}>
            <td style={{ fontWeight: 400, color: 'var(--color-muted)', fontSize: '0.85rem' }}>#{hotel.id_hotel}</td>
            <td>
              <div style={{ fontWeight: 400, fontSize: '0.9rem', color: 'var(--color-text)' }}>{hotel.name}</div>
              <div style={{ color: 'var(--color-muted)', fontSize: '0.75rem', fontWeight: 300, display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                <MapPin size={10} />{hotel.address}
              </div>
            </td>
            <td style={{ fontSize: '0.875rem', color: 'var(--color-text)', fontWeight: 300 }}>{hotel.city?.name}</td>
            <td><span className="badge badge-gray">{hotel.type}</span></td>
            <td style={{ color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 400 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Star size={12} fill="var(--color-primary)" style={{ stroke: 'var(--color-primary)' }} />
                {hotel.rating?.toFixed(1) || '0.0'}
              </div>
            </td>
            <td>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {hotel.featured && <span className="badge badge-yellow" style={{ background: 'var(--color-primary)', color: 'white', borderColor: 'transparent' }}>Featured</span>}
                {hotel.onSale && <span className="badge badge-red">-{hotel.discount_percent}%</span>}
              </div>
            </td>
            <td>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button as={Link} to={`/admin/hotels/${hotel.id_hotel}/rooms`} variant="white" size="sm" title={t('admin.hotels.manageRooms')}><Bed size={13} /></Button>
                <Button onClick={() => onEdit(hotel)} variant="white" size="sm" title={t('admin.hotels.editHotel')}><Pencil size={13} /></Button>
                <Button onClick={() => onDelete(hotel)} variant="white" size="sm" className="text-[var(--color-danger)]" title={t('admin.hotels.deleteHotel')}><Trash2 size={13} /></Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    <PaginationControls
      page={pagination.currentPage}
      totalPages={pagination.totalPages}
      totalItems={pagination.totalItems}
      pageSize={pagination.pageSize || pageSize}
      onPageChange={onPageChange}
    />
  </AdminTableShell>
);

export default AdminHotelTable;
