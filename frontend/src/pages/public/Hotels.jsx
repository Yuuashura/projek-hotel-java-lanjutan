import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import { usePreferences } from '../../context/PreferencesContext';
import HotelFilterPanel from '../../components/hotels/HotelFilterPanel';
import HotelResultsColumn from '../../components/hotels/HotelResultsColumn';
import HotelsHeroSearch from '../../components/hotels/HotelsHeroSearch';

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
      <HotelsHeroSearch
        t={t}
        cities={cities}
        filters={filters}
        visibleCount={visibleHotels.length}
        totalCount={pagination.totalItems || visibleHotels.length}
        onFilterChange={updateFilter}
        onSubmit={submitSearch}
      />

      <main className="hotels-page-main">
        <div className="hotels-results-layout">
          <HotelFilterPanel t={t} filters={filters} hasActiveFilters={hasActiveFilters} onFilterChange={updateFilter} onClearAll={clearAllFilters} />
          <HotelResultsColumn
            t={t}
            hotels={visibleHotels}
            loading={loading}
            pagination={{ ...pagination, currentPage: pagination.currentPage ?? page }}
            pageSize={PAGE_SIZE}
            selectedCity={selectedCity}
            filters={filters}
            onClearFilter={clearFilter}
            onClearAll={clearAllFilters}
            onPageChange={setPage}
          />
        </div>
      </main>

      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
    </div>
  );
};

export default Hotels;
