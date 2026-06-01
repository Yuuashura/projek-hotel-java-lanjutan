import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { getImageUrl } from '../../utils/uploads';

const getRoomTypes = (hotel) => hotel.roomTypes || hotel.room_types || [];

const getRoomPrice = (room) => Number(room.price_per_night ?? room.pricePerNight ?? room.price ?? 0);

const getMinPrice = (hotel) => {
  const summaryPrice = Number(hotel.min_price ?? hotel.minPrice ?? 0);
  if (summaryPrice > 0) return summaryPrice;

  const prices = getRoomTypes(hotel).map(getRoomPrice).filter(price => price > 0);
  return prices.length ? Math.min(...prices) : 0;
};

const getPrimaryImage = (hotel) => {
  const firstImage = hotel.images?.[0];
  const url = firstImage?.image_url || firstImage?.imageUrl;
  return getImageUrl(url, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400');
};

const isFeaturedHotel = (hotel) => Boolean(hotel.featured ?? hotel.is_featured ?? hotel.isFeatured);

const HotelListCard = ({ hotel, t }) => {
  const minPrice = getMinPrice(hotel);

  return (
    <article className="reveal active hotel-list-card flex min-h-[240px] overflow-hidden border-b border-[var(--color-accent)] pb-6">
      <div className="hotel-list-card-media h-[240px] w-[240px] shrink-0 overflow-hidden rounded-[var(--radius-sm)]">
        <img src={getPrimaryImage(hotel)} alt={hotel.name} className="h-full w-full object-cover transition duration-700 hover:scale-105" />
      </div>

      <div className="hotel-list-card-body flex min-w-0 flex-1 flex-col justify-between pl-6">
        <div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-medium uppercase text-[var(--color-primary)]">{hotel.city?.name || t('common.hotel')}</span>
            <span className="flex items-center gap-1 whitespace-nowrap text-sm text-[var(--color-primary)]">
              <Star size={12} fill="var(--color-primary)" /> {hotel.rating?.toFixed(1) || '0.0'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="mt-1 mb-2 font-[var(--font-heading)] text-2xl font-light text-[var(--color-text)]">{hotel.name}</h2>
            {isFeaturedHotel(hotel) && <span className="badge badge-yellow border-transparent bg-[var(--color-primary)] text-white">{t('common.featured')}</span>}
          </div>
          <div className="mb-2 flex items-center gap-1 text-sm font-light text-[var(--color-muted)]">
            <MapPin size={12} /> {hotel.address || hotel.city?.name}
          </div>
          <p className="line-clamp-2 text-sm font-light leading-6 text-[var(--color-muted)]">
            {hotel.description || t('hotels.fallbackDescription')}
          </p>
        </div>

        <div className="hotel-list-card-footer flex flex-wrap items-end justify-between gap-4 border-t border-[var(--color-accent)] pt-3">
          <div>
            <span className="text-xs uppercase text-[var(--color-muted)]">{t('common.pricePerNight')}</span>
            <div className="font-[var(--font-body)] text-lg font-medium text-[var(--color-text)]">
              {minPrice ? formatCurrency(minPrice) : t('common.unavailable')}
            </div>
          </div>
          <Link to={`/hotels/${hotel.id_hotel}`} className="flex items-center gap-1 font-[var(--font-body)] text-sm font-bold uppercase text-[var(--color-primary)] no-underline">
            {t('common.viewDetails')} {'->'}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default HotelListCard;
