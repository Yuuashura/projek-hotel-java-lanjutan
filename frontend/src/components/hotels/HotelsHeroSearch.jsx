import { Search } from 'lucide-react';
import CitySearchSelect from '../CitySearchSelect';

const HotelsHeroSearch = ({ t, cities, filters, visibleCount, totalCount, onFilterChange, onSubmit }) => (
  <div className="flow-hero-band" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-accent)', padding: '2.5rem 1.5rem 1.5rem' }}>
    <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '2rem', margin: 0, color: 'var(--color-text)' }}>{t('hotels.title')}</h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', fontWeight: 300, margin: '0.25rem 0 0' }}>
          {t('hotels.count', { shown: visibleCount, total: totalCount })}
        </p>
      </div>

      <form className="hotel-search-form" onSubmit={onSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end', maxWidth: 820 }}>
        <input
          className="input"
          style={{ width: 'auto', minWidth: 220, padding: '0.5rem 1rem', height: 42 }}
          placeholder={t('hotels.keywordPlaceholder')}
          value={filters.keyword}
          onChange={e => onFilterChange('keyword', e.target.value)}
        />
        <CitySearchSelect
          cities={cities}
          value={filters.cityId}
          onChange={value => onFilterChange('cityId', value)}
          placeholder={t('home.allCities')}
          style={{ width: 'auto', minWidth: 170 }}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem', height: 42, background: 'var(--color-primary)' }}>
          <Search size={14} /> {t('common.search')}
        </button>
      </form>
    </div>
  </div>
);

export default HotelsHeroSearch;
