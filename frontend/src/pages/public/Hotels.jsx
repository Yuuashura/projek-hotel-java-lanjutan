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
  sortBy: 'default'
};

const getRoomTypes = (hotel) => hotel.roomTypes || hotel.room_types || [];

const getRoomPrice = (room) => Number(room.price_per_night ?? room.pricePerNight ?? room.price ?? 0);

const getMinPrice = (hotel) => {
  const summaryPrice = Number(hotel.min_price ?? hotel.minPrice ?? 0);
  if (summaryPrice > 0) return summaryPrice;

  const prices = getRoomTypes(hotel).map(getRoomPrice).filter((price) => price > 0);
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
  hasPrevious: pagination?.has_previous ?? pagination?.hasPrevious ?? false
});

const Hotels = () => {
  const { t } = usePreferences();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = {
    keyword: searchParams.get('keyword') || '',
    cityId: searchParams.get('cityId') || ''
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
    hasPrevious: false
  });
  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
    ...initialSearch,
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    featured: searchParams.get('featured') || 'all',
    sortBy: searchParams.get('sortBy') || 'default'
  });
  const [submittedSearch, setSubmittedSearch] = useState(initialSearch);

  useEffect(() => {
    api.get('/api/cities').then((r) => setCities(r.data.data || [])).catch(() => {});
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
          hasPrevious: false
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
    setFilters((current) => ({ ...current, [key]: value }));
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
      keyword: filters.keyword.trim()
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

  const selectedCity = cities.find((city) => getCityId(city) === String(filters.cityId));
  const hasActiveFilters = Boolean(
    filters.keyword ||
    filters.cityId ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minRating ||
    filters.featured !== 'all'
  );

  return (
    <div className="[min-height:100vh] [background:var(--color-background)] [display:flex] [flex-direction:column]">
      <div className="flow-hero-band [background:var(--color-surface)] [border-bottom:1px_solid_var(--color-accent)] [padding:2.5rem_1.5rem_1.5rem]">
        <div className="[max-width:1400px] [margin:0_auto] [display:flex] [justify-content:space-between] [align-items:center] [flex-wrap:wrap] [gap:1.5rem]">
          <div>
            <h1 className="[font-family:var(--font-heading)] [font-weight:300] [font-size:2rem] [margin:0] [color:var(--color-text)]">{t('hotels.title')}</h1>
            <p className="[color:var(--color-muted)] [font-size:0.85rem] [font-weight:300] [margin:0.25rem_0_0]">
              {t('hotels.count', { shown: visibleHotels.length, total: pagination.totalItems || visibleHotels.length })}
            </p>
          </div>

          <form className="hotel-search-form [display:flex] [gap:1rem] [flex-wrap:wrap] [flex:1] [justify-content:flex-end] [max-width:820px]" onSubmit={submitSearch}>
            <input
              className="input [width:auto] [min-width:220px] [padding:0.5rem_1rem] [height:42px]"

              placeholder={t('hotels.keywordPlaceholder')}
              value={filters.keyword}
              onChange={(e) => updateFilter('keyword', e.target.value)} />
            
            <CitySearchSelect
              cities={cities}
              value={filters.cityId}
              onChange={(val) => updateFilter('cityId', val)}
              placeholder={t('home.allCities')} className="[width:auto] [min-width:170px]" />

            
            <button type="submit" className="btn btn-primary [padding:0_1.5rem] [height:42px] [background:var(--color-primary)]">
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
              {hasActiveFilters &&
              <button type="button" className="hotel-filter-reset" onClick={clearAllFilters}>
                  {t('common.reset')}
                </button>
              }
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
                    onChange={(e) => updateFilter('minPrice', e.target.value)} />
                  
                </div>
                <div>
                  <label className="label">{t('hotels.maxPrice')}</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    placeholder={t('hotels.maxPlaceholder')}
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)} />
                  
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
                ['5', t('hotels.fiveStars')]].
                map(([value, label]) =>
                <button
                  key={value || 'all'}
                  type="button"
                  className={`hotel-filter-choice ${filters.minRating === value ? 'active' : ''}`}
                  onClick={() => updateFilter('minRating', value)}>
                  
                    <span>{label}</span>
                    {value && <Star size={13} fill="currentColor" />}
                  </button>
                )}
              </div>
            </div>

            <div className="hotel-filter-group">
              <span className="hotel-filter-group-title">{t('hotels.stayType')}</span>
              <div className="hotel-filter-choice-list">
                {[
                ['all', t('hotels.allHotels')],
                ['featured', t('common.featured')],
                ['regular', t('common.nonFeatured')]].
                map(([value, label]) =>
                <button
                  key={value}
                  type="button"
                  className={`hotel-filter-choice ${filters.featured === value ? 'active' : ''}`}
                  onClick={() => updateFilter('featured', value)}>
                  
                    <span>{label}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="hotel-filter-group">
              <label className="label">{t('hotels.sortTitle')}</label>
              <select
                className="input"
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}>
                
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

        {hasActiveFilters &&
            <div className="[display:flex] [gap:0.5rem] [flex-wrap:wrap] [align-items:center]">
            <span className="[font-size:0.75rem] [text-transform:uppercase] [letter-spacing:1px] [color:var(--color-muted)]">{t('hotels.activeFilters')}</span>
            {filters.keyword && <FilterBadge label={`"${filters.keyword}"`} onClear={() => clearFilter('keyword')} />}
            {filters.cityId && <FilterBadge label={selectedCity?.name || t('hotels.selectedCity')} onClear={() => clearFilter('cityId')} />}
            {filters.minPrice && <FilterBadge label={`Min ${formatCurrency(Number(filters.minPrice))}`} onClear={() => clearFilter('minPrice')} />}
            {filters.maxPrice && <FilterBadge label={`Max ${formatCurrency(Number(filters.maxPrice))}`} onClear={() => clearFilter('maxPrice')} />}
            {filters.minRating && <FilterBadge label={t('hotels.starsPlus', { rating: filters.minRating })} onClear={() => clearFilter('minRating')} />}
            {filters.featured !== 'all' && <FilterBadge label={filters.featured === 'featured' ? t('common.featured') : t('common.nonFeatured')} onClear={() => clearFilter('featured')} />}
            <button type="button" className="btn btn-white btn-sm [height:30px] [padding:0_0.75rem]" onClick={clearAllFilters}>
              {t('common.reset')}
            </button>
          </div>
            }

        {loading ?
            <LoadingState text={t('common.loadingHotel')} /> :
            visibleHotels.length === 0 ?
            <div className="[text-align:center] [padding:5rem_1rem]">
            <h3 className="[font-family:var(--font-heading)] [font-size:1.5rem] [margin-bottom:0.5rem] [font-weight:300]">{t('hotels.emptyTitle')}</h3>
            <p className="[color:var(--color-muted)] [font-size:0.875rem] [margin-bottom:2rem] [font-weight:300]">{t('hotels.emptyText')}</p>
            <button onClick={clearAllFilters} className="btn btn-primary [background:var(--color-primary)]">{t('common.reset')}</button>
          </div> :

            <>
            <div className="[display:flex] [flex-direction:column] [gap:2rem]">
              {visibleHotels.map((hotel) =>
                <PropertyHorizontalCard key={hotel.id_hotel} hotel={hotel} t={t} />
                )}
            </div>
            <PaginationControls
                page={pagination.currentPage ?? page}
                totalPages={pagination.totalPages || 1}
                totalItems={pagination.totalItems || visibleHotels.length}
                pageSize={pagination.pageSize || PAGE_SIZE}
                onPageChange={setPage} />
              
          </>
            }
          </section>
        </div>
      </main>

      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
    </div>);

};

const FilterBadge = ({ label, onClear }) =>
<button
  type="button"
  className="badge [display:flex] [align-items:center] [gap:0.25rem] [padding:0.25rem_0.75rem] [cursor:pointer]"
  onClick={onClear}>

  
    {label} <X size={10} />
  </button>;


const PropertyHorizontalCard = ({ hotel, t }) => {
  const minPrice = getMinPrice(hotel);
  const hasDiscount = (hotel.onSale || hotel.on_sale) && (hotel.discountPercent > 0 || hotel.discount_percent > 0);
  const discountPercent = hotel.discountPercent || hotel.discount_percent || 0;
  const discountedPrice = hasDiscount ? minPrice * (1 - discountPercent / 100) : minPrice;

  return (
    <div className="reveal active hotel-list-card [display:flex] [min-height:240px] [overflow:hidden] [border-bottom:1px_solid_var(--color-accent)] [padding-bottom:1.5rem]">
      <div className="hotel-list-card-media [width:240px] [height:240px] [flex-shrink:0] [overflow:hidden] [border-radius:var(--radius-sm)]">
        <img src={getPrimaryImage(hotel)} alt={hotel.name} className="[width:100%] [height:100%] [object-fit:cover] [transition:transform_0.8s_ease]" />
      </div>

       <div className="hotel-list-card-body [padding:1rem_1.5rem] [flex:1] [display:flex] [flex-direction:column] [justify-content:space-between] [min-width:0]">
        <div>
          <div className="[display:flex] [justify-content:space-between] [align-items:center] [gap:1rem]">
            <span className="[font-size:0.7rem] [color:var(--color-primary)] [letter-spacing:1.5px] [text-transform:uppercase] [font-weight:400]">{hotel.city?.name || t('common.hotel')}</span>
            <span className="[display:flex] [align-items:center] [gap:0.25rem] [color:var(--color-primary)] [font-size:0.85rem] [white-space:nowrap]">
              <Star size={12} fill="var(--color-primary)" /> {hotel.rating?.toFixed(1) || '0.0'}
            </span>
          </div>
          <div className="[display:flex] [align-items:center] [gap:0.5rem] [flex-wrap:wrap]">
            <h2 className="[font-family:var(--font-heading)] [font-size:1.4rem] [color:var(--color-text)] [margin:0.25rem_0_0.5rem] [font-weight:300]">{hotel.name}</h2>
            {isFeaturedHotel(hotel) && <span className="badge badge-yellow [background:var(--color-primary)] [color:white] [border-color:transparent]">{t('common.featured')}</span>}
          </div>
          <div className="[display:flex] [align-items:center] [gap:0.25rem] [color:var(--color-muted)] [font-size:0.8rem] [font-weight:300] [margin-bottom:0.5rem]">
            <MapPin size={12} /> {hotel.address || hotel.city?.name}
          </div>
          <p className="[color:var(--color-muted)] [font-size:0.85rem] [font-weight:300] [display:-webkit-box] [-webkit-line-clamp:2px] [-webkit-box-orient:vertical] [overflow:hidden] [text-overflow:ellipsis] [line-height:1.5]">
            {hotel.description || t('hotels.fallbackDescription')}
          </p>
        </div>

        <div className="hotel-list-card-footer [display:flex] [justify-content:space-between] [align-items:flex-end] [gap:1rem] [border-top:1px_solid_var(--color-accent)] [padding-top:0.75rem] [flex-wrap:wrap]">
          <div>
            <span className="[font-size:0.7rem] [color:var(--color-muted)] [text-transform:uppercase] [letter-spacing:0.5px]">{t('common.pricePerNight')}</span>
            {hasDiscount ?
            <div className="[display:flex] [flex-direction:column]">
                <span className="[font-size:0.8rem] [color:var(--color-muted)] [text-decoration:line-through] [line-height:1]">
                  {formatCurrency(minPrice)}
                </span>
                <span className="[font-family:var(--font-body)] [font-weight:500] [font-size:1.15rem] [color:#C53030] [display:flex] [align-items:center] [gap:0.25rem]">
                  {formatCurrency(discountedPrice)} <span className="[font-size:0.65rem] [background:#C53030] [color:white] [padding:0.05rem_0.25rem] [border-radius:2px] [font-weight:500]">-{discountPercent}%</span>
                </span>
              </div> :

            <div className="[font-family:var(--font-body)] [font-weight:400] [font-size:1.1rem] [color:var(--color-text)]">
                {minPrice ? formatCurrency(minPrice) : t('common.unavailable')}
              </div>
            }
          </div>
           <Link to={`/hotels/${hotel.id_hotel}`} className="btn btn-primary btn-sm [padding:0.5rem_1rem] [font-size:0.85rem]">
             {t('common.viewDetails')} {'→'}
           </Link>
        </div>
      </div>
    </div>);

};

export default Hotels;
