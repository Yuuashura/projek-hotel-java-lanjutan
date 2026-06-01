import LoadingState from '../LoadingState';
import PaginationControls from '../admin/PaginationControls';
import HotelActiveFilters from './HotelActiveFilters';
import HotelListCard from './HotelListCard';

const HotelResultsColumn = ({ t, hotels, loading, pagination, pageSize, selectedCity, filters, onClearFilter, onClearAll, onPageChange }) => (
  <section className="hotel-results-column">
    <div className="hotel-results-toolbar">
      <div>
        <span>{t('hotels.resultsTitle')}</span>
        <strong>{t('hotels.count', { shown: hotels.length, total: pagination.totalItems || hotels.length })}</strong>
      </div>
    </div>

    <HotelActiveFilters t={t} filters={filters} selectedCity={selectedCity} onClear={onClearFilter} onClearAll={onClearAll} />

    {loading ? (
      <LoadingState text={t('common.loadingHotel')} />
    ) : hotels.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 300 }}>{t('hotels.emptyTitle')}</h3>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginBottom: '2rem', fontWeight: 300 }}>{t('hotels.emptyText')}</p>
        <button onClick={onClearAll} className="btn btn-primary" style={{ background: 'var(--color-primary)' }}>{t('common.reset')}</button>
      </div>
    ) : (
      <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {hotels.map(hotel => <HotelListCard key={hotel.id_hotel} hotel={hotel} t={t} />)}
        </div>
        <PaginationControls
          page={pagination.currentPage}
          totalPages={pagination.totalPages || 1}
          totalItems={pagination.totalItems || hotels.length}
          pageSize={pagination.pageSize || pageSize}
          onPageChange={onPageChange}
        />
      </>
    )}
  </section>
);

export default HotelResultsColumn;
