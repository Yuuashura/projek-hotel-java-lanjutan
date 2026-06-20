import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  MapPin,
  Users,
  ArrowLeft,
  Check,
  X,
  Wifi,
  Snowflake,
  ShowerHead,
  Armchair,
  Waves,
  Car,
  Coffee,
  Utensils,
  WashingMachine,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import LoadingState from '../../components/LoadingState';
import api from '../../utils/api';

const HOTEL_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200';
const ROOM_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=600';

const getImageUrl = (image) => {
  if (!image) return '';
  const path = typeof image === 'string' ? image : (image.image_url || image.imageUrl || image.url || '');
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const apiBase = import.meta.env.VITE_API_URL || '';
  const cleanApiBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  return cleanApiBase + cleanPath;
};

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

const normalizeFacility = (item) => {
  if (!item) return null;
  const source = item.facility || item;
  const name = source.name || source.facility_name || source.facilityName || item.name;
  if (!name) return null;

  return {
    id: source.id_facility || source.idFacility || source.id || item.facility_id || item.facilityId || name,
    name,
    icon: source.icon || item.icon || 'check',
  };
};

const getRoomAvailability = (room) => Number(room?.room_available ?? room?.roomAvailable ?? 0);

const HotelDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = usePreferences();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [activeRoom, setActiveRoom] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [roomAvailability, setRoomAvailability] = useState([]);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      const [hotelResult, availabilityResult] = await Promise.allSettled([
        api.get(`/api/hotels/${id}`),
        api.get(`/api/bookings/availability/hotel/${id}`),
      ]);

      if (hotelResult.status !== 'fulfilled') {
        navigate('/hotels');
        return;
      }

      const hotelData = hotelResult.value.data.data;
      const roomTypes = hotelData?.roomTypes || hotelData?.room_types || [];
      setHotel(hotelData);
      if (roomTypes.length > 0) {
        setActiveRoom(roomTypes[0].id_room_type || roomTypes[0].idRoomType);
      }

      if (availabilityResult.status === 'fulfilled') {
        const availabilityData = availabilityResult.value.data.data || [];
        setRoomAvailability(Array.isArray(availabilityData) ? availabilityData : []);
      } else {
        setRoomAvailability([]);
      }

      setLoading(false);
    };

    fetchDetail();
  }, [id, navigate]);

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
        <LoadingState text={t('common.loadingHotel')} />
      </div>
    );
  }
  if (!hotel) return null;

  const roomTypes = hotel.roomTypes || hotel.room_types || [];
  const roomFullPeriodsByRoom = roomAvailability.reduce((result, item) => {
    const roomTypeId = item.room_type_id ?? item.roomTypeId;
    if (roomTypeId) result[roomTypeId] = item.periods || [];
    return result;
  }, {});
  const hasDiscount = (hotel.onSale || hotel.on_sale) && (hotel.discountPercent > 0 || hotel.discount_percent > 0);
  const discountPercent = hotel.discountPercent || hotel.discount_percent || 0;
  const selectedRoom = roomTypes.find(r => (r.id_room_type || r.idRoomType) === activeRoom);
  const selectedRoomFullPeriods = selectedRoom ? roomFullPeriodsByRoom[activeRoom] || [] : [];
  const selectedRoomAvailable = getRoomAvailability(selectedRoom);
  const selectedRoomUnavailable = selectedRoom && selectedRoomAvailable <= 0;
  const hotelFacilities = (hotel.facilities || hotel.hotelFacilities || [])
    .map(normalizeFacility)
    .filter(Boolean);

  const uploadedImages = hotel.images?.map(getImageUrl).filter(Boolean) || [];
  const images = uploadedImages.length > 0 ? uploadedImages : [HOTEL_FALLBACK_IMAGE];

  return (
    <div className="hotel-detail-page" style={{ background: 'var(--color-background)', minHeight: '100vh', padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: 1300, margin: '0 auto' }}>
        
        {/* Back Link */}
        <Link to="/hotels" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-body)', fontWeight: 400, textDecoration: 'none', color: 'var(--color-text)', marginBottom: '2.5rem', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>
          <ArrowLeft size={14} /> {t('hotelDetail.back')}
        </Link>

        <section className={`hotel-gallery ${images.length === 1 ? 'single' : ''}`} aria-label={t('hotelDetail.gallery')}>
          <button type="button" className="hotel-gallery-main" onClick={() => { setActiveImg(0); setLightboxOpen(true); }}>
            <img src={images[0]} alt={`${hotel.name} - foto utama`} />
            <span className="hotel-gallery-shade" />
            <span className="hotel-gallery-caption">
              <span>{t('hotelDetail.gallery')}</span>
              <strong>{hotel.name}</strong>
            </span>
          </button>

          {images.length > 1 && (
            <div className="hotel-gallery-thumbs">
              {[1, 2, 3, 4].map((slot) => {
                const imageIndex = Math.min(slot, images.length - 1);
                const showMore = slot === 4 && images.length > 5;
                return (
                  <button
                    type="button"
                    key={slot}
                    className="hotel-gallery-thumb"
                    onClick={() => { setActiveImg(imageIndex); setLightboxOpen(true); }}
                  >
                    <img src={images[imageIndex]} alt={`${hotel.name} - foto ${imageIndex + 1}`} />
                    {showMore && <span className="hotel-gallery-more">{t('hotelDetail.morePhotos', { count: images.length - 4 })}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* SPLIT LAYOUT */}
        <div className="hotel-detail-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '3.5rem', alignItems: 'flex-start' }}>
          
          {/* LEFT COLUMN: Info, Amenities, Room Matrix */}
          <div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <span className="badge badge-yellow">{hotel.city?.name}</span>
              <span className="badge badge-gray">{hotel.type || t('hotelDetail.luxuryResort')}</span>
              {hotel.featured && <span className="badge badge-yellow" style={{ background: 'var(--color-primary)', color: 'white' }}>{t('common.featured')}</span>}
            </div>
            
            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '3rem', margin: '0 0 1rem', color: 'var(--color-text)', lineHeight: 1.1 }}>{hotel.name}</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem', borderBottom: '1px solid var(--color-accent)', paddingBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)', fontWeight: 400 }}>
                <Star size={14} fill="var(--color-primary)" /> {hotel.rating?.toFixed(1) || '4.5'} {t('common.rating')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-muted)', fontSize: '0.9rem', fontWeight: 300 }}>
                <MapPin size={14} /> {hotel.address}
              </div>
            </div>

            <p style={{ color: 'var(--color-text)', lineHeight: 1.8, fontWeight: 300, fontSize: '1rem', marginBottom: '3rem' }}>
              {hotel.description || t('hotelDetail.defaultDescription')}
            </p>

            {/* AMENITIES */}
            <div style={{ marginBottom: '4rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--color-text)' }}>{t('hotelDetail.facilities')}</h3>
              {hotelFacilities.length > 0 ? (
                <div className="hotel-detail-facilities-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  {hotelFacilities.map(f => {
                    const iconKey = String(f.icon || '').toLowerCase();
                    const FacilityIcon = facilityIconMap[iconKey] || Check;
                    return (
                    <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text)', fontSize: '0.9rem', fontWeight: 300 }}>
                      <div style={{ background: 'var(--color-background)', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-accent)' }}>
                        <FacilityIcon size={14} style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <span>{f.name}</span>
                    </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {t('hotelDetail.noFacilities')}
                </p>
              )}
            </div>

            {/* ROOM MATRIX */}
            {roomTypes.length > 0 && (
              <div>
                <h3 id="room-matrix" style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--color-text)' }}>{t('hotelDetail.rooms')}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {roomTypes.map(room => {
                    const roomId = room.id_room_type || room.idRoomType;
                    const isSelected = activeRoom === roomId;
                    const roomAvailable = getRoomAvailability(room);
                    const roomUnavailable = roomAvailable <= 0;
                    const fullPeriods = roomFullPeriodsByRoom[roomId] || [];
                    const roomFacilities = (room.facilities || [])
                      .map(normalizeFacility)
                      .filter(Boolean);
                    return (
                      <div key={roomId} className="hotel-detail-room-card" onClick={() => setActiveRoom(roomId)}
                        style={{
                          display: 'flex', minHeight: 180, cursor: 'pointer', borderRadius: 'var(--radius-sm)', overflow: 'hidden',
                          border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--color-accent)',
                          background: isSelected ? 'var(--color-surface)' : 'transparent',
                          boxShadow: isSelected ? 'var(--shadow-hover)' : 'none',
                          transition: 'all 0.3s ease'
                        }}>
                        <div className="hotel-detail-room-media" style={{ width: 220, height: '100%', flexShrink: 0, overflow: 'hidden' }}>
                          <img src={getImageUrl(room.images?.[0]) || ROOM_FALLBACK_IMAGE} alt={room.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        {/* Room description */}
                        <div className="hotel-detail-room-body" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', margin: 0, fontWeight: 300, color: 'var(--color-text)' }}>{room.name}</h4>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <span className="badge" style={{ fontSize: '0.65rem', background: roomUnavailable ? 'rgba(229,62,62,0.1)' : roomAvailable > 3 ? 'rgba(72,187,120,0.1)' : 'rgba(237,137,54,0.1)', color: roomUnavailable ? '#C53030' : roomAvailable > 3 ? '#276749' : '#DD6B20', borderColor: 'transparent' }}>
                                  {roomUnavailable ? t('hotelDetail.unavailableRoom') : t('hotelDetail.available', { count: roomAvailable })}
                                </span>
                              </div>
                            </div>
                            <p style={{ color: 'var(--color-muted)', fontSize: '0.8rem', fontWeight: 300, marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                              <span>{t('hotelDetail.roomSize')}</span>
                              <span>-</span>
                              <span>{t('hotelDetail.bed')}</span>
                            </p>
                            {roomFacilities.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
                                {roomFacilities.map(facility => {
                                  const RoomFacilityIcon = facilityIconMap[String(facility.icon || '').toLowerCase()] || Check;
                                  return (
                                    <span
                                      key={facility.id}
                                      className="badge badge-gray"
                                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem' }}
                                    >
                                      <RoomFacilityIcon size={11} />
                                      {facility.name}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                            {fullPeriods.length > 0 && (
                              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                {fullPeriods.slice(0, 2).map(period => (
                                  <div key={`${period.start_date || period.startDate}-${period.end_date || period.endDate}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', color: 'var(--color-danger)', fontSize: '0.78rem', lineHeight: 1.45, fontWeight: 400 }}>
                                    <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                                    <span>{period.message}</span>
                                  </div>
                                ))}
                                {fullPeriods.length > 2 && (
                                  <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', fontWeight: 400 }}>
                                    +{fullPeriods.length - 2} periode penuh lainnya
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="hotel-detail-room-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--color-accent)', paddingTop: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 300 }}><Users size={12} /> {t('hotelDetail.maxGuests', { count: room.max_guest ?? room.maxGuest })}</div>
                            <div style={{ textAlign: 'right' }}>
                              {hasDiscount ? (
                                <>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', textDecoration: 'line-through' }}>
                                    {formatCurrency(room.price_per_night ?? room.pricePerNight)}
                                  </div>
                                  <div style={{ fontSize: '1rem', fontWeight: 500, color: '#C53030' }}>
                                    {formatCurrency((room.price_per_night ?? room.pricePerNight) * (1 - discountPercent / 100))}
                                    <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontWeight: 300 }}>{t('home.perNight')}</span>
                                  </div>
                                </>
                              ) : (
                                <div style={{ fontSize: '0.95rem', fontWeight: 400, color: 'var(--color-primary)' }}>
                                  {formatCurrency(room.price_per_night ?? room.pricePerNight)}
                                  <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>{t('home.perNight')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Sticky Reserve Summary */}
          <div className="hotel-detail-reservation" style={{ position: 'sticky', top: 120 }}>
            <div className="card" style={{ padding: '2rem', border: '1px solid var(--color-accent)', boxShadow: 'var(--shadow-float)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--color-text)', borderBottom: '1px solid var(--color-accent)', paddingBottom: '0.75rem', fontWeight: 300 }}>{t('hotelDetail.reservation')}</h3>
              
              {selectedRoom ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('hotelDetail.roomType')}</span>
                    <div style={{ fontWeight: 400, color: 'var(--color-text)', fontSize: '1rem', marginTop: '0.25rem' }}>{selectedRoom.name}</div>
                    {selectedRoomUnavailable && (
                      <div style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 400 }}>
                        {t('hotelDetail.roomUnavailableMessage')}
                      </div>
                    )}
                    {selectedRoomFullPeriods.length > 0 && (
                      <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {selectedRoomFullPeriods.map(period => (
                          <div key={`${period.start_date || period.startDate}-${period.end_date || period.endDate}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', color: 'var(--color-danger)', fontSize: '0.8rem', lineHeight: 1.5, fontWeight: 400 }}>
                            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                            <span>{period.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ background: 'var(--color-background)', border: '1px solid var(--color-accent)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                      <span>{t('hotelDetail.priceNight')}</span>
                      <span>{formatCurrency(selectedRoom.price_per_night ?? selectedRoom.pricePerNight)}</span>
                    </div>
                    {hasDiscount && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#C53030' }}>
                        <span>{t('hotelDetail.discount', { percent: discountPercent })}</span>
                        <span>-{formatCurrency((selectedRoom.price_per_night ?? selectedRoom.pricePerNight) * discountPercent / 100)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', marginBottom: '2rem', fontWeight: 300 }}>{t('hotelDetail.chooseRoom')}</p>
              )}

              {user?.role === 'ROLE_USER' ? (
                selectedRoomUnavailable ? (
                  <button type="button" className="btn btn-primary btn-full" disabled style={{ justifyContent: 'center', height: 50, opacity: 0.55, cursor: 'not-allowed' }}>
                    {t('hotelDetail.unavailableRoom')}
                  </button>
                ) : (
                <Link to={`/booking/${hotel.id_hotel}?roomTypeId=${activeRoom}`} className="btn btn-primary btn-full" style={{ justifyContent: 'center', height: 50, background: 'var(--color-primary)' }}>
                  {t('hotelDetail.reserve')}
                </Link>
                )
              ) : !user ? (
                <Link to={`/login?redirect=/hotels/${hotel.id_hotel}`} className="btn btn-full hotel-login-book-btn" style={{ justifyContent: 'center', height: 50 }}>
                  {t('hotelDetail.signInToBook')}
                </Link>
              ) : (
                <div style={{ background: 'var(--color-background)', border: '1px solid var(--color-accent)', padding: '1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 300 }}>
                  {t('hotelDetail.adminCannotBook')}
                </div>
              )}

              <p style={{ textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.75rem', marginTop: '1rem', fontWeight: 300 }}>
                {t('hotelDetail.secureCheckout')}
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* LIGHTBOX MODAL */}
      {lightboxOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(26,54,93,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <button onClick={() => setLightboxOpen(false)} style={{ position: 'absolute', top: 30, right: 30, background: 'transparent', border: 'none', cursor: 'pointer', color: 'white' }}>
            <X size={32} />
          </button>
          
          <button onClick={() => setActiveImg(c => (c - 1 + images.length) % images.length)} style={{ position: 'absolute', left: 40, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', padding: '0.75rem', cursor: 'pointer', color: 'white' }}>
            <ArrowLeft size={24} />
          </button>

          <div style={{ maxWidth: '80%', maxHeight: '80%', overflow: 'hidden' }}>
            <img src={images[activeImg]} alt={`${hotel.name} - foto ${activeImg + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          <button onClick={() => setActiveImg(c => (c + 1) % images.length)} style={{ position: 'absolute', right: 40, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', padding: '0.75rem', cursor: 'pointer', color: 'white' }}>
            <ArrowLeft size={24} style={{ transform: 'rotate(180deg)' }} />
          </button>
        </div>
      )}

      <style>{`
        .hotel-gallery {
          display: grid;
          grid-template-columns: minmax(0, 1.65fr) minmax(280px, 0.75fr);
          gap: 0.85rem;
          height: clamp(360px, 45vw, 560px);
          margin-bottom: 2.75rem;
        }

        .hotel-gallery.single {
          grid-template-columns: 1fr;
          height: clamp(360px, 48vw, 620px);
        }

        .hotel-gallery-main,
        .hotel-gallery-thumb {
          position: relative;
          display: block;
          width: 100%;
          height: 100%;
          padding: 0;
          border: 0;
          background: var(--color-background);
          overflow: hidden;
          cursor: zoom-in;
          border-radius: var(--radius-sm);
        }

        .hotel-gallery-main img,
        .hotel-gallery-thumb img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hotel-gallery-main:hover img,
        .hotel-gallery-thumb:hover img {
          transform: scale(1.035);
        }

        .hotel-gallery-shade {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.02) 35%, rgba(0,0,0,0.48) 100%);
          pointer-events: none;
        }

        .hotel-gallery-caption {
          position: absolute;
          left: 1.25rem;
          right: 1.25rem;
          bottom: 1.1rem;
          color: white;
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          text-shadow: 0 2px 12px rgba(0,0,0,0.35);
        }

        .hotel-gallery-caption span {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          opacity: 0.84;
        }

        .hotel-gallery-caption strong {
          font-family: var(--font-heading);
          font-size: clamp(1.5rem, 3vw, 2.6rem);
          font-weight: 300;
          line-height: 1.05;
        }

        .hotel-gallery-thumbs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 0.85rem;
          min-height: 0;
        }

        .hotel-gallery-more {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(26,54,93,0.64);
          color: white;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        @media (max-width: 900px) {
          .hotel-gallery {
            grid-template-columns: 1fr;
            height: auto;
          }

          .hotel-gallery-main {
            aspect-ratio: 16 / 10;
          }

          .hotel-gallery-thumbs {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            grid-template-rows: none;
          }

          .hotel-gallery-thumb {
            aspect-ratio: 1 / 1;
          }
        }

        @media (max-width: 560px) {
          .hotel-gallery-main {
            aspect-ratio: 4 / 3;
          }

          .hotel-gallery-thumbs {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>

    </div>
  );
};

export default HotelDetail;
