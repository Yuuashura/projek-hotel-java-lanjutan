import CitySearchSelect from '../CitySearchSelect';

const HomeSearchBar = ({ t, cities, search, setSearch, onSubmit }) => (
  <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 1.5rem', position: 'relative', marginTop: '-5rem', zIndex: 30 }}>
    <form onSubmit={onSubmit} style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', padding: '1.25rem 2rem', boxShadow: 'var(--shadow-float)', border: '1px solid var(--color-accent)' }}>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: 200 }}>
          <label className="label" style={{ fontSize: '0.7rem', letterSpacing: '1px', color: 'var(--color-text)', fontWeight: 500 }}>{t('home.searchDestination')}</label>
          <input className="input" style={{ border: 'none', borderBottom: '1px solid var(--color-accent)', padding: '0.5rem 0', background: 'transparent', borderRadius: 0, color: 'var(--color-text)', fontWeight: 400 }} placeholder={t('home.searchPlaceholder')} value={search.keyword} onChange={e => setSearch(s => ({ ...s, keyword: e.target.value }))} />
        </div>
        <div style={{ flex: 1, minWidth: 150 }}>
          <label className="label" style={{ fontSize: '0.7rem', letterSpacing: '1px', color: 'var(--color-text)', fontWeight: 500 }}>{t('common.city')}</label>
          <CitySearchSelect cities={cities} value={search.city} onChange={val => setSearch(s => ({ ...s, city: val }))} placeholder={t('home.allCities')} />
        </div>
        <button type="submit" className="btn btn-primary btn-lg" style={{ height: 56, flexShrink: 0, padding: '0 2.5rem', background: 'var(--color-primary)' }}>
          {t('home.discover')}
        </button>
      </div>
    </form>
  </div>
);

export default HomeSearchBar;
