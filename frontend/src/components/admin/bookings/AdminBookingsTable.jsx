import { Eye } from 'lucide-react';
import PaginationControls from '../PaginationControls';
import AdminTableShell from '../AdminTableShell';
import Button from '../../ui/Button';
import { formatCurrency, formatDate, statusColor } from '../../../utils/formatters';

const badgeClassForStatus = (status) => (
  status === 'PENDING' ? 'orange' : status === 'CONFIRMED' ? 'green' : status === 'CANCELLED' ? 'red' : 'gray'
);

const AdminBookingsTable = ({ bookings, filteredCount, currentPage, totalPages, pageSize, t, getHotelName, onDetail, onPageChange }) => (
  <AdminTableShell isEmpty={filteredCount === 0} emptyText={t('admin.bookings.empty')}>
    <table className="neo-table">
      <thead>
        <tr>{[t('admin.table.id'), t('admin.table.booker'), t('admin.table.hotel'), t('admin.table.checkIn'), t('admin.table.checkOut'), t('admin.table.total'), t('admin.table.status'), t('admin.table.actions')].map(header => <th key={header}>{header}</th>)}</tr>
      </thead>
      <tbody>
        {bookings.map(booking => {
          const { label } = statusColor(booking.status);

          return (
            <tr key={booking.id_booking || booking.id}>
              <td style={{ fontWeight: 400, color: 'var(--color-muted)', fontSize: '0.85rem' }}>#{booking.id_booking || booking.id}</td>
              <td>
                <div style={{ fontWeight: 400, fontSize: '0.9rem', color: 'var(--color-text)' }}>{booking.orderer_name}</div>
                <div style={{ color: 'var(--color-muted)', fontSize: '0.75rem', fontWeight: 300, marginTop: '0.15rem' }}>{booking.orderer_email}</div>
              </td>
              <td style={{ fontSize: '0.85rem', color: 'var(--color-text)', fontWeight: 300 }}>
                <div style={{ fontWeight: 400 }}>{getHotelName(booking)}</div>
                {booking.hotel_city && <div style={{ color: 'var(--color-muted)', fontSize: '0.72rem', marginTop: '0.15rem' }}>{booking.hotel_city}</div>}
              </td>
              <td style={{ fontSize: '0.85rem', color: 'var(--color-text)', fontWeight: 300 }}>{formatDate(booking.check_in)}</td>
              <td style={{ fontSize: '0.85rem', color: 'var(--color-text)', fontWeight: 300 }}>{formatDate(booking.check_out)}</td>
              <td style={{ fontWeight: 400, color: 'var(--color-primary)', fontSize: '0.85rem' }}>{formatCurrency(booking.total_price)}</td>
              <td><span className={`badge badge-${badgeClassForStatus(booking.status)}`} style={{ fontSize: '0.7rem' }}>{label}</span></td>
              <td>
                <Button onClick={() => onDetail(booking)} variant="white" size="sm"><Eye size={12} /> {t('admin.actions.details')}</Button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
    <PaginationControls page={currentPage} totalPages={totalPages} totalItems={filteredCount} pageSize={pageSize} onPageChange={onPageChange} />
  </AdminTableShell>
);

export default AdminBookingsTable;
