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
import { cn } from '../../lib/utils';

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
      <div className="bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-primary)_12%,transparent)_1px,transparent_1.3px),linear-gradient(180deg,color-mix(in_srgb,var(--color-surface)_94%,transparent),color-mix(in_srgb,var(--color-background)_42%,transparent))] bg-[length:22px_22px,auto] [background:var(--color-surface)] [border-bottom:1px_solid_var(--color-accent)] [padding:2.5rem_1.5rem_1.5rem]">
        <div className="[max-width:1400px] [margin:0_auto] [display:flex] [justify-content:space-between] [align-items:center] [flex-wrap:wrap] [gap:1.5rem]">
          <div>
            <h1 className="[font-family:var(--font-heading)] [font-weight:300] [font-size:2rem] [margin:0] [color:var(--color-text)]">{t('hotels.title')}</h1>
            <p className="[color:var(--color-muted)] [font-size:0.85rem] [font-weight:300] [margin:0.25rem_0_0]">
              {t('hotels.count', { shown: visibleHotels.length, total: pagination.totalItems || visibleHotels.length })}
            </p>
          </div>

          <form className="max-[920px]:!w-full max-[920px]:!max-w-none max-[920px]:!justify-stretch max-[920px]:[&>*]:!w-full max-[920px]:[&_.input]:!w-full [display:flex] [gap:1rem] [flex-wrap:wrap] [flex:1] [justify-content:flex-end] [max-width:820px]" onSubmit={submitSearch}>
            <input
              className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm [width:auto] [min-width:220px] [padding:0.5rem_1rem] [height:42px]"

              placeholder={t('hotels.keywordPlaceholder')}
              value={filters.keyword}
              onChange={(e) => updateFilter('keyword', e.target.value)} />

            <CitySearchSelect
              cities={cities}
              value={filters.cityId}
              onChange={(val) => updateFilter('cityId', val)}
              placeholder={t('home.allCities')} className="[width:auto] [min-width:170px]" />


            <button type="submit" className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[color-mix(in_srgb,var(--color-primary)_46%,transparent)] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))] text-[#061426] hover:brightness-105 [padding:0_1.5rem] [height:42px] [background:var(--color-primary)]">
              <Search size={14} /> {t('common.search')}
            </button>
          </form>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1400px] px-6 py-8 max-[920px]:px-4 max-[920px]:py-6 max-sm:px-3.5 max-sm:py-4">
        <div className="grid grid-cols-[320px_minmax(0,1fr)] items-start gap-6 max-[980px]:grid-cols-1">
          <aside className="sticky top-24 flex max-h-[calc(100vh-112px)] flex-col gap-4 overflow-y-auto overscroll-contain p-[1.15rem] max-[980px]:static max-[980px]:max-h-none max-[980px]:overflow-visible max-sm:!p-3.5 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--color-text)] shadow-[var(--shadow-float)] backdrop-blur-xl transition-all duration-300" aria-label={t('hotels.filterTitle')}>
            <div className="flex items-start justify-between gap-4 border-b border-[var(--color-accent)] pb-4 max-[620px]:flex-col">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase text-[var(--color-primary)]">
                  <SlidersHorizontal size={14} /> {t('hotels.localFilter')}
                </span>
                <h2>{t('hotels.filterTitle')}</h2>
                <p>{t('hotels.filterSubtitle')}</p>
              </div>
              {hasActiveFilters &&
              <button type="button" className="cursor-pointer rounded-lg border-0 bg-[var(--color-primary-soft)] px-2.5 py-2 text-[0.68rem] font-bold uppercase text-[var(--color-primary)]" onClick={clearAllFilters}>
                  {t('common.reset')}
                </button>
              }
            </div>

            <div className="pt-0.5">
              <span className="mb-3 block text-[0.78rem] font-bold uppercase text-[var(--color-text)]">{t('hotels.priceRange')}</span>
              <div className="grid grid-cols-1 gap-3 max-[980px]:grid-cols-2 max-[620px]:grid-cols-1">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">{t('hotels.minPrice')}</label>
                  <input
                    className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm"
                    type="number"
                    min="0"
                    placeholder={t('hotels.minPlaceholder')}
                    value={filters.minPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)} />

                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">{t('hotels.maxPrice')}</label>
                  <input
                    className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm"
                    type="number"
                    min="0"
                    placeholder={t('hotels.maxPlaceholder')}
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)} />

                </div>
              </div>
            </div>

            <div className="pt-0.5">
              <span className="mb-3 block text-[0.78rem] font-bold uppercase text-[var(--color-text)]">{t('common.rating')}</span>
              <div className="flex flex-col gap-2 max-[980px]:grid max-[980px]:grid-cols-2 max-[620px]:grid-cols-1">
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
                  className={cn(
                    'flex min-h-10 w-full cursor-pointer items-center justify-between gap-2.5 rounded-lg border px-3 py-2.5 text-left text-[0.83rem] font-medium transition hover:-translate-y-px',
                    filters.minRating === value
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-[0_10px_22px_-16px_var(--color-primary)]'
                      : 'border-[var(--color-accent)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-primary)]',
                  )}
                  onClick={() => updateFilter('minRating', value)}>

                    <span>{label}</span>
                    {value && <Star size={13} fill="currentColor" />}
                  </button>
                )}
              </div>
            </div>

            <div className="pt-0.5">
              <span className="mb-3 block text-[0.78rem] font-bold uppercase text-[var(--color-text)]">{t('hotels.stayType')}</span>
              <div className="flex flex-col gap-2 max-[980px]:grid max-[980px]:grid-cols-2 max-[620px]:grid-cols-1">
                {[
                ['all', t('hotels.allHotels')],
                ['featured', t('common.featured')],
                ['regular', t('common.nonFeatured')]].
                map(([value, label]) =>
                <button
                  key={value}
                  type="button"
                  className={cn(
                    'flex min-h-10 w-full cursor-pointer items-center justify-between gap-2.5 rounded-lg border px-3 py-2.5 text-left text-[0.83rem] font-medium transition hover:-translate-y-px',
                    filters.featured === value
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-[0_10px_22px_-16px_var(--color-primary)]'
                      : 'border-[var(--color-accent)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-primary)]',
                  )}
                  onClick={() => updateFilter('featured', value)}>

                    <span>{label}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="pt-0.5">
              <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem]">{t('hotels.sortTitle')}</label>
              <select
                className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm"
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}>

                <option value="default">{t('hotels.sortDefault')}</option>
                <option value="price_asc">{t('hotels.sortPriceAsc')}</option>
                <option value="price_desc">{t('hotels.sortPriceDesc')}</option>
                <option value="rating">{t('hotels.sortRating')}</option>
              </select>
            </div>
          </aside>

          <section className="flex min-w-0 flex-col gap-6">
            <div className="flex min-h-16 items-center justify-between gap-4 border border-[var(--color-accent)] bg-[var(--glass-bg)] px-4 py-4 shadow-[var(--shadow-float)] backdrop-blur-xl max-[620px]:min-h-0 max-[620px]:flex-col max-[620px]:items-start max-[620px]:p-3.5">
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
            <button type="button" className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--color-text)] backdrop-blur-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-background)] min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem] [height:30px] [padding:0_0.75rem]" onClick={clearAllFilters}>
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
            <button onClick={clearAllFilters} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[color-mix(in_srgb,var(--color-primary)_46%,transparent)] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))] text-[#061426] hover:brightness-105 [background:var(--color-primary)]">{t('common.reset')}</button>
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

    </div>);

};

const FilterBadge = ({ label, onClear }) =>
<button
  type="button"
  className="inline-flex items-center gap-1 rounded-full border border-[var(--color-accent)] bg-[var(--color-background)] px-3 py-1 text-[0.7rem] font-medium uppercase text-[var(--color-text)] max-sm:px-2.5 max-sm:py-1 max-sm:text-[0.64rem] [display:flex] [align-items:center] [gap:0.25rem] [padding:0.25rem_0.75rem] [cursor:pointer]"
  onClick={onClear}>


    {label} <X size={10} />
  </button>;


const PropertyHorizontalCard = ({ hotel, t }) => {
  const minPrice = getMinPrice(hotel);
  const hasDiscount = (hotel.onSale || hotel.on_sale) && (hotel.discountPercent > 0 || hotel.discount_percent > 0);
  const discountPercent = hotel.discountPercent || hotel.discount_percent || 0;
  const discountedPrice = hasDiscount ? minPrice * (1 - discountPercent / 100) : minPrice;

  return (
    <div className="reveal active max-sm:!min-h-0 max-sm:!flex-col max-sm:gap-3.5 [display:flex] [min-height:240px] [overflow:hidden] [border-bottom:1px_solid_var(--color-accent)] [padding-bottom:1.5rem]">
      <div className="max-[920px]:!h-[210px] max-[920px]:!w-[200px] max-sm:!h-auto max-sm:!w-full max-sm:aspect-[16/10] [width:240px] [height:240px] [flex-shrink:0] [overflow:hidden] [border-radius:var(--radius-sm)]">
        <img src={getPrimaryImage(hotel)} alt={hotel.name} className="[width:100%] [height:100%] [object-fit:cover] [transition:transform_0.8s_ease]" />
      </div>

       <div className="max-sm:!p-0 max-sm:gap-4 [padding:1rem_1.5rem] [flex:1] [display:flex] [flex-direction:column] [justify-content:space-between] [min-width:0]">
        <div>
          <div className="[display:flex] [justify-content:space-between] [align-items:center] [gap:1rem]">
            <span className="[font-size:0.7rem] [color:var(--color-primary)] [letter-spacing:1.5px] [text-transform:uppercase] [font-weight:400]">{hotel.city?.name || t('common.hotel')}</span>
            <span className="[display:flex] [align-items:center] [gap:0.25rem] [color:var(--color-primary)] [font-size:0.85rem] [white-space:nowrap]">
              <Star size={12} fill="var(--color-primary)" /> {hotel.rating?.toFixed(1) || '0.0'}
            </span>
          </div>
          <div className="[display:flex] [align-items:center] [gap:0.5rem] [flex-wrap:wrap]">
            <h2 className="[font-family:var(--font-heading)] [font-size:1.4rem] [color:var(--color-text)] [margin:0.25rem_0_0.5rem] [font-weight:300]">{hotel.name}</h2>
            {isFeaturedHotel(hotel) && <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-accent)] bg-[var(--color-background)] px-3 py-1 text-[0.7rem] font-medium uppercase text-[var(--color-text)] max-sm:px-2.5 max-sm:py-1 max-sm:text-[0.64rem] border-[var(--color-primary-soft)] bg-[var(--color-primary-soft)] text-[var(--color-primary)] [background:var(--color-primary)] [color:white] [border-color:transparent]">{t('common.featured')}</span>}
          </div>
          <div className="[display:flex] [align-items:center] [gap:0.25rem] [color:var(--color-muted)] [font-size:0.8rem] [font-weight:300] [margin-bottom:0.5rem]">
            <MapPin size={12} /> {hotel.address || hotel.city?.name}
          </div>
          <p className="[color:var(--color-muted)] [font-size:0.85rem] [font-weight:300] [display:-webkit-box] [-webkit-line-clamp:2px] [-webkit-box-orient:vertical] [overflow:hidden] [text-overflow:ellipsis] [line-height:1.5]">
            {hotel.description || t('hotels.fallbackDescription')}
          </p>
        </div>

        <div className="max-sm:flex-col max-sm:!items-start max-sm:[&_a]:w-full max-sm:[&_a]:justify-center [display:flex] [justify-content:space-between] [align-items:flex-end] [gap:1rem] [border-top:1px_solid_var(--color-accent)] [padding-top:0.75rem] [flex-wrap:wrap]">
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
           <Link to={`/hotels/${hotel.id_hotel}`} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[color-mix(in_srgb,var(--color-primary)_46%,transparent)] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))] text-[#061426] hover:brightness-105 min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem] [padding:0.5rem_1rem] [font-size:0.85rem]">
             {t('common.viewDetails')} {'→'}
           </Link>
        </div>
      </div>
    </div>);

};

export default Hotels;
