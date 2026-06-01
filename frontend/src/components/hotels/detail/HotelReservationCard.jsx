import { Link } from 'react-router-dom';
import { formatCurrency } from '../../../utils/formatters';

const HotelReservationCard = ({ hotel, selectedRoom, activeRoom, selectedRoomUnavailable, user, t }) => (
  <div className="hotel-detail-reservation" style={{ position: 'sticky', top: 120 }}>
    <div className="card" style={{ padding: '2rem', border: '1px solid var(--color-accent)', boxShadow: 'var(--shadow-float)' }}>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--color-text)', borderBottom: '1px solid var(--color-accent)', paddingBottom: '0.75rem', fontWeight: 300 }}>{t('hotelDetail.reservation')}</h3>

      {selectedRoom ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('hotelDetail.roomType')}</span>
            <div style={{ fontWeight: 400, color: 'var(--color-text)', fontSize: '1rem', marginTop: '0.25rem' }}>{selectedRoom.name}</div>
            {selectedRoomUnavailable && (
              <div style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 400 }}>
                {t('hotelDetail.roomUnavailableMessage')}
              </div>
            )}
          </div>

          <div style={{ background: 'var(--color-background)', border: '1px solid var(--color-accent)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-text)', marginBottom: '0.5rem' }}>
              <span>{t('hotelDetail.priceNight')}</span>
              <span>{formatCurrency(selectedRoom.price_per_night ?? selectedRoom.pricePerNight)}</span>
            </div>
            {hotel.onSale && hotel.discountPercent > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#C53030' }}>
                <span>{t('hotelDetail.discount', { percent: hotel.discountPercent })}</span>
                <span>-{formatCurrency((selectedRoom.price_per_night ?? selectedRoom.pricePerNight) * hotel.discountPercent / 100)}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', marginBottom: '2rem', fontWeight: 300 }}>{t('hotelDetail.chooseRoom')}</p>
      )}

      {user?.role === 'ROLE_USER' ? (
        selectedRoomUnavailable ? (
          <button type="button" className="btn btn-primary btn-full" disabled style={{ justifyContent: 'center', height: 50, opacity: 0.55, cursor: 'not-allowed' }}>
            {t('hotelDetail.unavailableRoom')}
          </button>
        ) : (
          <Link to={`/booking/${hotel.id_hotel}?roomTypeId=${activeRoom}`} className="btn btn-primary btn-full" style={{ justifyContent: 'center', height: 50, background: 'var(--color-primary)' }}>
            {t('hotelDetail.reserve')}
          </Link>
        )
      ) : !user ? (
        <Link to={`/login?redirect=/hotels/${hotel.id_hotel}`} className="btn btn-full hotel-login-book-btn" style={{ justifyContent: 'center', height: 50 }}>
          {t('hotelDetail.signInToBook')}
        </Link>
      ) : (
        <div style={{ background: 'var(--color-background)', border: '1px solid var(--color-accent)', padding: '1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 300 }}>
          {t('hotelDetail.adminCannotBook')}
        </div>
      )}

      <p style={{ textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.75rem', marginTop: '1rem', fontWeight: 300 }}>
        {t('hotelDetail.secureCheckout')}
      </p>
    </div>
  </div>
);

export default HotelReservationCard;
