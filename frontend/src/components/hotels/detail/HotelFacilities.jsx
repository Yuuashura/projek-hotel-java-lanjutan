import { Armchair, Car, Check, Coffee, ShowerHead, Snowflake, Utensils, WashingMachine, Waves, Wifi } from 'lucide-react';

const facilityIconMap = {
  wifi: Wifi,
  snowflake: Snowflake,
  shower: ShowerHead,
  armchair: Armchair,
  pool: Waves,
  car: Car,
  coffee: Coffee,
  elevator: Check,
  utensils: Utensils,
  'washing-machine': WashingMachine,
};

const HotelFacilities = ({ facilities, usingFallback, t }) => {
  if (facilities.length === 0) return null;

  return (
    <div style={{ marginBottom: '4rem' }}>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--color-text)' }}>{t('hotelDetail.facilities')}</h3>
      {usingFallback && (
        <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', fontWeight: 400, lineHeight: 1.6, margin: '-0.75rem 0 1.5rem' }}>
          {t('hotelDetail.facilityFallbackNote')}
        </p>
      )}
      <div className="hotel-detail-facilities-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {facilities.map(facility => {
          const iconKey = String(facility.icon || '').toLowerCase();
          const FacilityIcon = facilityIconMap[iconKey] || Check;
          return (
            <div key={facility.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text)', fontSize: '0.9rem', fontWeight: 300 }}>
              <div style={{ background: 'var(--color-background)', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-accent)' }}>
                <FacilityIcon size={14} style={{ color: 'var(--color-primary)' }} />
              </div>
              <span>{facility.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HotelFacilities;
