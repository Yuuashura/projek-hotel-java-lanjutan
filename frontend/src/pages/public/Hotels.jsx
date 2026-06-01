import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, MapPin, X } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import api from '../../utils/api';
import CitySearchSelect from '../../components/CitySearchSelect';
import { usePreferences } from '../../context/PreferencesContext';
import LoadingState from '../../components/LoadingState';
import { getImageUrl } from '../../utils/uploads';
import PaginationControls from '../../components/admin/PaginationControls';

const PAGE_SIZE = 25;

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

const getCityId = (city) => String(city.id_city ?? city.id ?? '');

const normalizePagination = (pagination, fallbackPage, fallbackCount) => ({
  currentPage: pagination?.current_page ?? pagination?.currentPage ?? fallbackPage,
  pageSize: pagination?.page_size ?? pagination?.pageSize ?? PAGE_SIZE,
  totalItems: pagination?.total_items ?? pagination?.totalItems ?? fallbackCount,
  totalPages: pagination?.total_pages ?? pagination?.totalPages ?? 1,
  hasNext: pagination?.has_next ?? pagination?.hasNext ?? false,
  hasPrevious: pagination?.has_previous ?? pagination?.hasPrevious ?? false,
});

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
  const [page, setPage] = useState(0);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    pageSize: PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  });
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
        const params = { page, size: PAGE_SIZE };
        const keyword = submittedSearch.keyword.trim();
        if (keyword) params.keyword = keyword;
        if (submittedSearch.cityId) params.cityId = submittedSearch.cityId;
        if (filters.minPrice !== '') params.minPrice = filters.minPrice;
        if (filters.maxPrice !== '') params.maxPrice = filters.maxPrice;
        if (filters.minRating !== '') params.minRating = filters.minRating;
        if (filters.featured === 'featured') params.featured = true;
        if (filters.featured === 'regular') params.featured = false;
        if (filters.sortBy !== 'default') params.sortBy = filters.sortBy;

        const res = await api.get('/api/hotels', { params });
        const data = res.data.data || [];
        setHotels(data);
        setPagination(normalizePagination(res.data.pagination, page, data.length));
      } catch {
        setHotels([]);
        setPagination({
          currentPage: 0,
          pageSize: PAGE_SIZE,
          totalItems: 0,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [submittedSearch, filters.minPrice, filters.maxPrice, filters.minRating, filters.featured, filters.sortBy, page]);

  const visibleHotels = useMemo(() => hotels, [hotels]);

  const updateFilter = (key, value) => {
    if (key !== 'keyword' && key !== 'cityId') {
      setPage(0);
    }
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
    setPage(0);
    setSubmittedSearch({ keyword: nextFilters.keyword, cityId: nextFilters.cityId });
    syncSearchParams(nextFilters);
  };

  const clearAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(0);
    setSubmittedSearch({ keyword: '', cityId: '' });
    setSearchParams({});
  };

  const clearFilter = (key) => {
    const nextFilters = { ...filters, [key]: DEFAULT_FILTERS[key] };
    setFilters(nextFilters);
    setPage(0);
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
      <div className="flow-hero-band" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-accent)', padding: '2.5rem 1.5rem 1.5rem' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '2rem', margin: 0, color: 'var(--color-text)' }}>{t('hotels.title')}</h1>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', fontWeight: 300, margin: '0.25rem 0 0' }}>
              {t('hotels.count', { shown: visibleHotels.length, total: pagination.totalItems || visibleHotels.length })}
            </p>
          </div>

          <form className="hotel-search-form" onSubmit={submitSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end', maxWidth: 820 }}>
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

      <main className="hotels-page-main">
        <div className="hotels-results-layout">
          <aside className="hotel-filter-panel card" aria-label={t('hotels.filterTitle')}>
            <div className="hotel-filter-panel-head">
              <div>
                <span className="hotel-filter-kicker">
                  <SlidersHorizontal size={14} /> {t('hotels.localFilter')}
                </span>
                <h2>{t('hotels.filterTitle')}</h2>
                <p>{t('hotels.filterSubtitle')}</p>
              </div>
              {hasActiveFilters && (
                <button type="button" className="hotel-filter-reset" onClick={clearAllFilters}>
                  {t('common.reset')}
                </button>
              )}
            </div>

            <div className="hotel-filter-group">
              <span className="hotel-filter-group-title">{t('hotels.priceRange')}</span>
              <div className="hotel-filter-price-grid">
                <div>
                  <label className="label">{t('hotels.minPrice')}</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    placeholder={t('hotels.minPlaceholder')}
                    value={filters.minPrice}
                    onChange={e => updateFilter('minPrice', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">{t('hotels.maxPrice')}</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    placeholder={t('hotels.maxPlaceholder')}
                    value={filters.maxPrice}
                    onChange={e => updateFilter('maxPrice', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="hotel-filter-group">
              <span className="hotel-filter-group-title">{t('common.rating')}</span>
              <div className="hotel-filter-choice-list">
                {[
                  ['', t('hotels.allRatings')],
                  ['3', t('hotels.starsPlus', { rating: 3 })],
                  ['4', t('hotels.starsPlus', { rating: 4 })],
                  ['4.5', t('hotels.starsPlus', { rating: 4.5 })],
                  ['5', t('hotels.fiveStars')],
                ].map(([value, label]) => (
                  <button
                    key={value || 'all'}
                    type="button"
                    className={`hotel-filter-choice ${filters.minRating === value ? 'active' : ''}`}
                    onClick={() => updateFilter('minRating', value)}
                  >
                    <span>{label}</span>
                    {value && <Star size={13} fill="currentColor" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="hotel-filter-group">
              <span className="hotel-filter-group-title">{t('hotels.stayType')}</span>
              <div className="hotel-filter-choice-list">
                {[
                  ['all', t('hotels.allHotels')],
                  ['featured', t('common.featured')],
                  ['regular', t('common.nonFeatured')],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={`hotel-filter-choice ${filters.featured === value ? 'active' : ''}`}
                    onClick={() => updateFilter('featured', value)}
                  >
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="hotel-filter-group">
              <label className="label">{t('hotels.sortTitle')}</label>
              <select
                className="input"
                value={filters.sortBy}
                onChange={e => updateFilter('sortBy', e.target.value)}
              >
                <option value="default">{t('hotels.sortDefault')}</option>
                <option value="price_asc">{t('hotels.sortPriceAsc')}</option>
                <option value="price_desc">{t('hotels.sortPriceDesc')}</option>
                <option value="rating">{t('hotels.sortRating')}</option>
              </select>
            </div>
          </aside>

          <section className="hotel-results-column">
            <div className="hotel-results-toolbar">
              <div>
                <span>{t('hotels.resultsTitle')}</span>
                <strong>{t('hotels.count', { shown: visibleHotels.length, total: pagination.totalItems || visibleHotels.length })}</strong>
              </div>
            </div>

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
          <LoadingState text={t('common.loadingHotel')} />
        ) : visibleHotels.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 300 }}>{t('hotels.emptyTitle')}</h3>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginBottom: '2rem', fontWeight: 300 }}>{t('hotels.emptyText')}</p>
            <button onClick={clearAllFilters} className="btn btn-primary" style={{ background: 'var(--color-primary)' }}>{t('common.reset')}</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {visibleHotels.map(hotel => (
                <PropertyHorizontalCard key={hotel.id_hotel} hotel={hotel} t={t} />
              ))}
            </div>
            <PaginationControls
              page={pagination.currentPage ?? page}
              totalPages={pagination.totalPages || 1}
              totalItems={pagination.totalItems || visibleHotels.length}
              pageSize={pagination.pageSize || PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
          </section>
        </div>
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
    <div className="reveal active hotel-list-card" style={{ display: 'flex', minHeight: 240, overflow: 'hidden', borderBottom: '1px solid var(--color-accent)', paddingBottom: '1.5rem' }}>
      <div className="hotel-list-card-media" style={{ width: 240, height: 240, flexShrink: 0, overflow: 'hidden', borderRadius: 'var(--radius-sm)' }}>
        <img src={getPrimaryImage(hotel)} alt={hotel.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.8s ease' }} />
      </div>

      <div className="hotel-list-card-body" style={{ padding: '0 0 0 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
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

        <div className="hotel-list-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', borderTop: '1px solid var(--color-accent)', paddingTop: '0.75rem', flexWrap: 'wrap' }}>
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
