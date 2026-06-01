import { SlidersHorizontal, Star } from 'lucide-react';

const HotelFilterPanel = ({ t, filters, hasActiveFilters, onFilterChange, onClearAll }) => (
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
        <button type="button" className="hotel-filter-reset" onClick={onClearAll}>
          {t('common.reset')}
        </button>
      )}
    </div>

    <div className="hotel-filter-group">
      <span className="hotel-filter-group-title">{t('hotels.priceRange')}</span>
      <div className="hotel-filter-price-grid">
        <div>
          <label className="label">{t('hotels.minPrice')}</label>
          <input className="input" type="number" min="0" placeholder={t('hotels.minPlaceholder')} value={filters.minPrice} onChange={e => onFilterChange('minPrice', e.target.value)} />
        </div>
        <div>
          <label className="label">{t('hotels.maxPrice')}</label>
          <input className="input" type="number" min="0" placeholder={t('hotels.maxPlaceholder')} value={filters.maxPrice} onChange={e => onFilterChange('maxPrice', e.target.value)} />
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
          <button key={value || 'all'} type="button" className={`hotel-filter-choice ${filters.minRating === value ? 'active' : ''}`} onClick={() => onFilterChange('minRating', value)}>
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
          <button key={value} type="button" className={`hotel-filter-choice ${filters.featured === value ? 'active' : ''}`} onClick={() => onFilterChange('featured', value)}>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>

    <div className="hotel-filter-group">
      <label className="label">{t('hotels.sortTitle')}</label>
      <select className="input" value={filters.sortBy} onChange={e => onFilterChange('sortBy', e.target.value)}>
        <option value="default">{t('hotels.sortDefault')}</option>
        <option value="price_asc">{t('hotels.sortPriceAsc')}</option>
        <option value="price_desc">{t('hotels.sortPriceDesc')}</option>
        <option value="rating">{t('hotels.sortRating')}</option>
      </select>
    </div>
  </aside>
);

export default HotelFilterPanel;
