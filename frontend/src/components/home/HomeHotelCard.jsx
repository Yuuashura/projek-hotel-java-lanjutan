import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { getImageUrl } from '../../utils/uploads';
import { usePreferences } from '../../context/PreferencesContext';

const getHotelMinPrice = (hotel) => {
  if (hotel.min_price != null) return hotel.min_price;
  if (hotel.minPrice != null) return hotel.minPrice;

  const roomPrices = (hotel.roomTypes || [])
    .map(room => room.price_per_night ?? room.pricePerNight ?? 0)
    .filter(price => price > 0);

  return roomPrices.length > 0 ? Math.min(...roomPrices) : 0;
};

const HomeHotelCard = ({ hotel, showDiscount, className = '' }) => {
  const { t } = usePreferences();
  const minPrice = getHotelMinPrice(hotel);
  const discountedPrice = showDiscount && hotel.discount_percent
    ? minPrice * (1 - hotel.discount_percent / 100)
    : minPrice;

  return (
    <div className={`card card-hover ${className}`} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid var(--color-accent)' }}>
      <div style={{ height: 220, overflow: 'hidden', position: 'relative' }}>
        <img
          src={getImageUrl(hotel.images?.[0]?.image_url, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400')}
          alt={hotel.name}
          loading="lazy"
          decoding="async"
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
          onMouseEnter={event => event.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={event => event.currentTarget.style.transform = 'scale(1)'}
        />
        {showDiscount && hotel.discount_percent > 0 && (
          <span className="badge badge-red" style={{ position: 'absolute', top: 15, left: 15 }}>-{hotel.discount_percent}%</span>
        )}
        {hotel.featured && <span className="badge badge-yellow" style={{ position: 'absolute', top: 15, right: 15 }}>{t('common.featured')}</span>}
        {hotel.roomTypes?.some(room => room.room_available <= 3) && (
          <span className="badge badge-orange" style={{ position: 'absolute', bottom: 15, left: 15, background: 'rgba(237,137,54,0.1)', color: '#DD6B20', borderColor: 'rgba(237,137,54,0.2)' }}>{t('home.limited')}</span>
        )}
      </div>
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="badge badge-yellow" style={{ fontSize: '0.7rem' }}>{hotel.city?.name || 'Indonesia'}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)', fontWeight: 400, fontSize: '0.85rem' }}>
            <Star size={13} fill="var(--color-primary)" />{hotel.rating?.toFixed(1) || '4.5'}
          </span>
        </div>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.3rem', margin: '0.25rem 0', lineHeight: 1.3, color: 'var(--color-text)' }}>{hotel.name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-muted)', fontSize: '0.8rem', fontWeight: 300 }}>
          <MapPin size={12} />{hotel.address || hotel.city?.name}
        </div>
        <div style={{ borderTop: '1px solid var(--color-accent)', paddingTop: '1rem', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {showDiscount && hotel.discount_percent > 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textDecoration: 'line-through', fontWeight: 300 }}>{formatCurrency(minPrice)}</div>
            )}
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '1.05rem', color: 'var(--color-text)' }}>
              {formatCurrency(discountedPrice || minPrice || 0)}
              <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 300 }}>{t('home.perNight')}</span>
            </div>
          </div>
          <Link to={`/hotels/${hotel.id_hotel}`} className="btn btn-primary btn-sm" style={{ background: 'var(--color-primary)' }}>{t('common.details')}</Link>
        </div>
      </div>
    </div>
  );
};

export default HomeHotelCard;
