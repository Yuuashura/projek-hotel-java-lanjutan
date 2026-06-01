import { Users } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import { getRoomAvailability, resolveHotelImageUrl, ROOM_FALLBACK_IMAGE } from './hotelDetailUtils';

const HotelRoomCard = ({ room, selected, onSelect, t }) => {
  const roomAvailable = getRoomAvailability(room);
  const roomUnavailable = roomAvailable <= 0;

  return (
    <div
      className="hotel-detail-room-card"
      onClick={onSelect}
      style={{
        display: 'flex',
        height: 180,
        cursor: 'pointer',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        border: selected ? '1px solid var(--color-primary)' : '1px solid var(--color-accent)',
        background: selected ? 'var(--color-surface)' : 'transparent',
        boxShadow: selected ? 'var(--shadow-hover)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <div className="hotel-detail-room-media" style={{ width: 220, height: '100%', flexShrink: 0, overflow: 'hidden' }}>
        <img src={resolveHotelImageUrl(room.images?.[0], ROOM_FALLBACK_IMAGE)} alt={room.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div className="hotel-detail-room-body" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', margin: 0, fontWeight: 300, color: 'var(--color-text)' }}>{room.name}</h4>
            <span className="badge" style={{ fontSize: '0.65rem', background: roomUnavailable ? 'rgba(229,62,62,0.1)' : roomAvailable > 3 ? 'rgba(72,187,120,0.1)' : 'rgba(237,137,54,0.1)', color: roomUnavailable ? '#C53030' : roomAvailable > 3 ? '#276749' : '#DD6B20', borderColor: 'transparent' }}>
              {roomUnavailable ? t('hotelDetail.unavailableRoom') : t('hotelDetail.available', { count: roomAvailable })}
            </span>
          </div>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.8rem', fontWeight: 300, marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
            <span>{t('hotelDetail.roomSize')}</span>
            <span>-</span>
            <span>{t('hotelDetail.bed')}</span>
          </p>
        </div>

        <div className="hotel-detail-room-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--color-accent)', paddingTop: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 300 }}>
            <Users size={12} /> {t('hotelDetail.maxGuests', { count: room.max_guest ?? room.maxGuest })}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 400, color: 'var(--color-primary)' }}>
              {formatCurrency(room.price_per_night ?? room.pricePerNight)}
              <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>{t('home.perNight')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelRoomCard;
