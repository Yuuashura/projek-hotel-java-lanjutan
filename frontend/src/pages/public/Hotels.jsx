import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, MapPin, X } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import api from '../../utils/api';
import CitySearchSelect from '../../components/CitySearchSelect';
import { usePreferences } from '../../context/PreferencesContext';

const DEFAULT_FILTERS = {
  keyword: '',
  cityId: '',
  minPrice: '',
  maxPrice: '',
  minRating: '',
  featured: 'all',
  sortBy: 'default',
};

const getRoomTypes = (hotel) => hotel.roomTypes || hotel.room_types || [];

const getRoomPrice = (room) => Number(room.price_per_night ?? room.pricePerNight ?? room.price ?? 0);

const getMinPrice = (hotel) => {
  const prices = getRoomTypes(hotel).map(getRoomPrice).filter(price => price > 0);
  return prices.length ? Math.min(...prices) : 0;
};

const getPrimaryImage = (hotel) => {
  const firstImage = hotel.images?.[0];
  return firstImage?.image_url || firstImage?.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400';
};

const isFeaturedHotel = (hotel) => Boolean(hotel.featured ?? hotel.is_featured ?? hotel.isFeatured);

const getCityId = (city) => String(city.id_city ?? city.id ?? '');

const Hotels = () => {
  const { t } = usePreferences();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = {
    keyword: searchParams.get('keyword') || '',
    cityId: searchParams.get('cityId') || '',
  };

  const [hotels, setHotels] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
    ...initialSearch,
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    featured: searchParams.get('featured') || 'all',
    sortBy: searchParams.get('sortBy') || 'default',
  });
  const [submittedSearch, setSubmittedSearch] = useState(initialSearch);

  useEffect(() => {
    api.get('/api/cities').then(r => setCities(r.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const params = {};
        const keyword = submittedSearch.keyword.trim();
        if (keyword) params.keyword = keyword;
        if (submittedSearch.cityId) params.cityId = submittedSearch.cityId;

        const res = await api.get('/api/hotels', { params });
        setHotels(res.data.data || []);
      } catch {
        setHotels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [submittedSearch]);

  const visibleHotels = useMemo(() => {
    const minPrice = filters.minPrice === '' ? null : Number(filters.minPrice);
    const maxPrice = filters.maxPrice === '' ? null : Number(filters.maxPrice);
    const minRating = filters.minRating === '' ? null : Number(filters.minRating);

    let data = hotels.filter((hotel) => {
      const hotelPrice = getMinPrice(hotel);
      const hotelRating = Number(hotel.rating || 0);

      if (minPrice !== null && hotelPrice < minPrice) return false;
      if (maxPrice !== null && (hotelPrice === 0 || hotelPrice > maxPrice)) return false;
      if (minRating !== null && hotelRating < minRating) return false;
      if (filters.featured === 'featured' && !isFeaturedHotel(hotel)) return false;
      if (filters.featured === 'regular' && isFeaturedHotel(hotel)) return false;

      return true;
    });

    if (filters.sortBy === 'price_asc') data = [...data].sort((a, b) => getMinPrice(a) - getMinPrice(b));
    if (filters.sortBy === 'price_desc') data = [...data].sort((a, b) => getMinPrice(b) - getMinPrice(a));
    if (filters.sortBy === 'rating') data = [...data].sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return data;
  }, [filters.minPrice, filters.maxPrice, filters.minRating, filters.featured, filters.sortBy, hotels]);

  const updateFilter = (key, value) => {
    setFilters(current => ({ ...current, [key]: value }));
  };

  const syncSearchParams = (nextFilters) => {
    const params = {};
    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value && value !== DEFAULT_FILTERS[key]) params[key] = value;
    });
    setSearchParams(params);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const nextFilters = {
      ...filters,
      keyword: filters.keyword.trim(),
    };
    setFilters(nextFilters);
    setSubmittedSearch({ keyword: nextFilters.keyword, cityId: nextFilters.cityId });
    syncSearchParams(nextFilters);
  };

  const clearAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSubmittedSearch({ keyword: '', cityId: '' });
    setSearchParams({});
  };

  const clearFilter = (key) => {
    const nextFilters = { ...filters, [key]: DEFAULT_FILTERS[key] };
    setFilters(nextFilters);
    if (key === 'keyword' || key === 'cityId') {
      setSubmittedSearch({ keyword: nextFilters.keyword, cityId: nextFilters.cityId });
    }
    syncSearchParams(nextFilters);
  };

  const selectedCity = cities.find(city => getCityId(city) === String(filters.cityId));
  const hasActiveFilters = Boolean(
    filters.keyword ||
    filters.cityId ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minRating ||
    filters.featured !== 'all'
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-accent)', padding: '2.5rem 1.5rem 1.5rem' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '2rem', margin: 0, color: 'var(--color-text)' }}>{t('hotels.title')}</h1>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', fontWeight: 300, margin: '0.25rem 0 0' }}>
              {t('hotels.count', { shown: visibleHotels.length, total: hotels.length })}
            </p>
          </div>

          <form onSubmit={submitSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end', maxWidth: 820 }}>
            <input
              className="input"
              style={{ width: 'auto', minWidth: 220, padding: '0.5rem 1rem', height: 42 }}
              placeholder={t('hotels.keywordPlaceholder')}
              value={filters.keyword}
              onChange={e => updateFilter('keyword', e.target.value)}
            />
            <CitySearchSelect
              cities={cities}
              value={filters.cityId}
              onChange={val => updateFilter('cityId', val)}
              placeholder={t('home.allCities')}
              style={{ width: 'auto', minWidth: 170 }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem', height: 42, background: 'var(--color-primary)' }}>
              <Search size={14} /> {t('common.search')}
            </button>
          </form>
        </div>
      </div>

      <main style={{ width: '100%', maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap', borderBottom: '1px solid var(--color-accent)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label className="label" style={{ fontSize: '0.7rem' }}>{t('hotels.minPrice')}</label>
              <input
                className="input"
                type="number"
                min="0"
                placeholder={t('hotels.minPlaceholder')}
                value={filters.minPrice}
                onChange={e => updateFilter('minPrice', e.target.value)}
                style={{ width: 150, height: 38, padding: '0.4rem 0.75rem' }}
              />
            </div>
            <div>
              <label className="label" style={{ fontSize: '0.7rem' }}>{t('hotels.maxPrice')}</label>
              <input
                className="input"
                type="number"
                min="0"
                placeholder={t('hotels.maxPlaceholder')}
                value={filters.maxPrice}
                onChange={e => updateFilter('maxPrice', e.target.value)}
                style={{ width: 150, height: 38, padding: '0.4rem 0.75rem' }}
              />
            </div>
            <div>
              <label className="label" style={{ fontSize: '0.7rem' }}>{t('common.rating')}</label>
              <select
                className="input"
                value={filters.minRating}
                onChange={e => updateFilter('minRating', e.target.value)}
                style={{ width: 150, height: 38, padding: '0.4rem 0.75rem' }}
              >
                <option value="">{t('hotels.allRatings')}</option>
                <option value="3">{t('hotels.starsPlus', { rating: 3 })}</option>
                <option value="4">{t('hotels.starsPlus', { rating: 4 })}</option>
                <option value="4.5">{t('hotels.starsPlus', { rating: 4.5 })}</option>
                <option value="5">{t('hotels.fiveStars')}</option>
              </select>
            </div>
            <div>
              <label className="label" style={{ fontSize: '0.7rem' }}>{t('hotels.featuredLabel')}</label>
              <select
                className="input"
                value={filters.featured}
                onChange={e => updateFilter('featured', e.target.value)}
                style={{ width: 150, height: 38, padding: '0.4rem 0.75rem' }}
              >
                <option value="all">{t('hotels.allHotels')}</option>
                <option value="featured">{t('common.featured')}</option>
                <option value="regular">{t('common.nonFeatured')}</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ color: 'var(--color-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <SlidersHorizontal size={13} /> {t('hotels.localFilter')}
            </div>
            <select
              className="input"
              style={{ width: 'auto', minWidth: 180, padding: '0.4rem 1rem', height: 38, fontSize: '0.8rem' }}
              value={filters.sortBy}
              onChange={e => updateFilter('sortBy', e.target.value)}
            >
              <option value="default">{t('hotels.sortDefault')}</option>
              <option value="price_asc">{t('hotels.sortPriceAsc')}</option>
              <option value="price_desc">{t('hotels.sortPriceDesc')}</option>
              <option value="rating">{t('hotels.sortRating')}</option>
            </select>
          </div>
        </section>

        {hasActiveFilters && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-muted)' }}>{t('hotels.activeFilters')}</span>
            {filters.keyword && <FilterBadge label={`"${filters.keyword}"`} onClear={() => clearFilter('keyword')} />}
            {filters.cityId && <FilterBadge label={selectedCity?.name || t('hotels.selectedCity')} onClear={() => clearFilter('cityId')} />}
            {filters.minPrice && <FilterBadge label={`Min ${formatCurrency(Number(filters.minPrice))}`} onClear={() => clearFilter('minPrice')} />}
            {filters.maxPrice && <FilterBadge label={`Max ${formatCurrency(Number(filters.maxPrice))}`} onClear={() => clearFilter('maxPrice')} />}
            {filters.minRating && <FilterBadge label={t('hotels.starsPlus', { rating: filters.minRating })} onClear={() => clearFilter('minRating')} />}
            {filters.featured !== 'all' && <FilterBadge label={filters.featured === 'featured' ? t('common.featured') : t('common.nonFeatured')} onClear={() => clearFilter('featured')} />}
            <button type="button" className="btn btn-white btn-sm" onClick={clearAllFilters} style={{ height: 30, padding: '0 0.75rem' }}>
              {t('common.reset')}
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 240, background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 'var(--radius-sm)' }} />
            ))}
          </div>
        ) : visibleHotels.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 300 }}>{t('hotels.emptyTitle')}</h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginBottom: '2rem', fontWeight: 300 }}>{t('hotels.emptyText')}</p>
            <button onClick={clearAllFilters} className="btn btn-primary" style={{ background: 'var(--color-primary)' }}>{t('common.reset')}</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {visibleHotels.map(hotel => (
              <PropertyHorizontalCard key={hotel.id_hotel} hotel={hotel} t={t} />
            ))}
          </div>
        )}
      </main>

      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
    </div>
  );
};

const FilterBadge = ({ label, onClear }) => (
  <button
    type="button"
    className="badge"
    onClick={onClear}
    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.75rem', cursor: 'pointer' }}
  >
    {label} <X size={10} />
  </button>
);

const PropertyHorizontalCard = ({ hotel, t }) => {
  const minPrice = getMinPrice(hotel);

  return (
    <div className="reveal active" style={{ display: 'flex', minHeight: 240, overflow: 'hidden', borderBottom: '1px solid var(--color-accent)', paddingBottom: '1.5rem' }}>
      <div style={{ width: 240, height: 240, flexShrink: 0, overflow: 'hidden', borderRadius: 'var(--radius-sm)' }}>
        <img src={getPrimaryImage(hotel)} alt={hotel.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.8s ease' }} />
      </div>

      <div style={{ padding: '0 0 0 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 400 }}>{hotel.city?.name || t('common.hotel')}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
              <Star size={12} fill="var(--color-primary)" /> {hotel.rating?.toFixed(1) || '0.0'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-text)', margin: '0.25rem 0 0.5rem', fontWeight: 300 }}>{hotel.name}</h2>
            {isFeaturedHotel(hotel) && <span className="badge badge-yellow" style={{ background: 'var(--color-primary)', color: 'white', borderColor: 'transparent' }}>{t('common.featured')}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-muted)', fontSize: '0.8rem', fontWeight: 300, marginBottom: '0.5rem' }}>
            <MapPin size={12} /> {hotel.address || hotel.city?.name}
          </div>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', fontWeight: 300, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.5 }}>
            {hotel.description || t('hotels.fallbackDescription')}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', borderTop: '1px solid var(--color-accent)', paddingTop: '0.75rem', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('common.pricePerNight')}</span>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '1.1rem', color: 'var(--color-text)' }}>
              {minPrice ? formatCurrency(minPrice) : t('common.unavailable')}
            </div>
          </div>
          <Link to={`/hotels/${hotel.id_hotel}`} style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 400, display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}>
            {t('common.viewDetails')} {'->'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hotels;
