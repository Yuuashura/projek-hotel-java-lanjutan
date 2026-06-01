import { formatCurrency } from '../../utils/formatters';
import FilterBadge from './FilterBadge';

const HotelActiveFilters = ({ t, filters, selectedCity, onClear, onClearAll }) => {
  const hasFilters = Boolean(
    filters.keyword ||
    filters.cityId ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minRating ||
    filters.featured !== 'all'
  );

  if (!hasFilters) return null;

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-muted)' }}>{t('hotels.activeFilters')}</span>
      {filters.keyword && <FilterBadge label={`"${filters.keyword}"`} onClear={() => onClear('keyword')} />}
      {filters.cityId && <FilterBadge label={selectedCity?.name || t('hotels.selectedCity')} onClear={() => onClear('cityId')} />}
      {filters.minPrice && <FilterBadge label={`Min ${formatCurrency(Number(filters.minPrice))}`} onClear={() => onClear('minPrice')} />}
      {filters.maxPrice && <FilterBadge label={`Max ${formatCurrency(Number(filters.maxPrice))}`} onClear={() => onClear('maxPrice')} />}
      {filters.minRating && <FilterBadge label={t('hotels.starsPlus', { rating: filters.minRating })} onClear={() => onClear('minRating')} />}
      {filters.featured !== 'all' && <FilterBadge label={filters.featured === 'featured' ? t('common.featured') : t('common.nonFeatured')} onClear={() => onClear('featured')} />}
      <button type="button" className="btn btn-white btn-sm" onClick={onClearAll} style={{ height: 30, padding: '0 0.75rem' }}>
        {t('common.reset')}
      </button>
    </div>
  );
};

export default HotelActiveFilters;
