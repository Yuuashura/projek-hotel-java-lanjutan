import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import LoadingState from '../LoadingState';
import HomeHotelCard from './HomeHotelCard';

const EmptyHotels = ({ t }) => (
  <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
    <h3 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--color-text)' }}>{t('hotels.emptyTitle')}</h3>
    <p style={{ margin: '0.75rem auto 0', maxWidth: 520, color: 'var(--color-muted)', fontWeight: 400, lineHeight: 1.6 }}>{t('hotels.emptyText')}</p>
  </div>
);

const HomeHotelSection = ({ t, eyebrow, title, hotels, loading, sale, viewAllTo }) => (
  <div className="reveal" style={{ maxWidth: 1280, margin: '8rem auto 0', padding: '0 1.5rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
      <div>
        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 400, color: sale ? '#C53030' : 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>{eyebrow}</span>
        <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', margin: '0.5rem 0 0', fontWeight: 300 }}>{title}</h2>
      </div>
      <Link to={viewAllTo} className="btn btn-white btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{t('home.viewAll')} <ArrowRight size={14} /></Link>
    </div>

    {loading ? (
      <LoadingState text={t('common.loadingHotel')} />
    ) : hotels.length > 0 ? (
      <div className={sale ? '' : 'home-featured-rail'} aria-label={title} style={sale ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' } : undefined}>
        {hotels.map(hotel => <HomeHotelCard key={hotel.id_hotel} hotel={hotel} className={sale ? undefined : 'home-featured-card'} showDiscount={sale} />)}
      </div>
    ) : (
      <EmptyHotels t={t} />
    )}
  </div>
);

export default HomeHotelSection;
