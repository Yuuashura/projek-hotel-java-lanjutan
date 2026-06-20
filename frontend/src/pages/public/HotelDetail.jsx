import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
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
  AlertCircle } from
'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import LoadingState from '../../components/LoadingState';
import api from '../../utils/api';

const HOTEL_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200';
const ROOM_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=600';

const getImageUrl = (image) => {
  if (!image) return '';
  const path = typeof image === 'string' ? image : image.image_url || image.imageUrl || image.url || '';
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
  'washing-machine': WashingMachine
};

const normalizeFacility = (item) => {
  if (!item) return null;
  const source = item.facility || item;
  const name = source.name || source.facility_name || source.facilityName || item.name;
  if (!name) return null;

  return {
    id: source.id_facility || source.idFacility || source.id || item.facility_id || item.facilityId || name,
    name,
    icon: source.icon || item.icon || 'check'
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
      api.get(`/api/bookings/availability/hotel/${id}`)]
      );

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
      <div className="[min-height:70vh] [display:grid] [place-items:center] [padding:2rem]">
        <LoadingState text={t('common.loadingHotel')} />
      </div>);

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
  const selectedRoom = roomTypes.find((r) => (r.id_room_type || r.idRoomType) === activeRoom);
  const selectedRoomFullPeriods = selectedRoom ? roomFullPeriodsByRoom[activeRoom] || [] : [];
  const selectedRoomAvailable = getRoomAvailability(selectedRoom);
  const selectedRoomUnavailable = selectedRoom && selectedRoomAvailable <= 0;
  const hotelFacilities = (hotel.facilities || hotel.hotelFacilities || []).
  map(normalizeFacility).
  filter(Boolean);

  const uploadedImages = hotel.images?.map(getImageUrl).filter(Boolean) || [];
  const images = uploadedImages.length > 0 ? uploadedImages : [HOTEL_FALLBACK_IMAGE];

  return (
    <div className="hotel-detail-page [background:var(--color-background)] [min-height:100vh] [padding:4rem_1.5rem]">
      <div className="[max-width:1300px] [margin:0_auto]">
        
        {/* Back Link */}
        <Link to="/hotels" className="[display:inline-flex] [align-items:center] [gap:0.5rem] [font-family:var(--font-body)] [font-weight:400] [text-decoration:none] [color:var(--color-text)] [margin-bottom:2.5rem] [text-transform:uppercase] [font-size:0.75rem] [letter-spacing:1px]">
          <ArrowLeft size={14} /> {t('hotelDetail.back')}
        </Link>

        <section className={`hotel-gallery ${images.length === 1 ? 'single' : ''}`} aria-label={t('hotelDetail.gallery')}>
          <button type="button" className="hotel-gallery-main" onClick={() => {setActiveImg(0);setLightboxOpen(true);}}>
            <img src={images[0]} alt={`${hotel.name} - foto utama`} />
            <span className="hotel-gallery-shade" />
            <span className="hotel-gallery-caption">
              <span>{t('hotelDetail.gallery')}</span>
              <strong>{hotel.name}</strong>
            </span>
          </button>

          {images.length > 1 &&
          <div className="hotel-gallery-thumbs">
              {[1, 2, 3, 4].map((slot) => {
              const imageIndex = Math.min(slot, images.length - 1);
              const showMore = slot === 4 && images.length > 5;
              return (
                <button
                  type="button"
                  key={slot}
                  className="hotel-gallery-thumb"
                  onClick={() => {setActiveImg(imageIndex);setLightboxOpen(true);}}>
                  
                    <img src={images[imageIndex]} alt={`${hotel.name} - foto ${imageIndex + 1}`} />
                    {showMore && <span className="hotel-gallery-more">{t('hotelDetail.morePhotos', { count: images.length - 4 })}</span>}
                  </button>);

            })}
            </div>
          }
        </section>

        {/* SPLIT LAYOUT */}
        <div className="hotel-detail-layout [display:grid] [grid-template-columns:1fr_400px] [gap:3.5rem] [align-items:flex-start]">
          
          {/* LEFT COLUMN: Info, Amenities, Room Matrix */}
          <div>
            <div className="[display:flex] [gap:0.75rem] [flex-wrap:wrap] [margin-bottom:1rem]">
              <span className="badge badge-yellow">{hotel.city?.name}</span>
              <span className="badge badge-gray">{hotel.type || t('hotelDetail.luxuryResort')}</span>
              {hotel.featured && <span className="badge badge-yellow [background:var(--color-primary)] [color:white]">{t('common.featured')}</span>}
            </div>
            
            <h1 className="[font-family:var(--font-heading)] [font-weight:300] [font-size:3rem] [margin:0_0_1rem] [color:var(--color-text)] [line-height:1.1]">{hotel.name}</h1>
            
            <div className="[display:flex] [align-items:center] [gap:2rem] [flex-wrap:wrap] [margin-bottom:2rem] [border-bottom:1px_solid_var(--color-accent)] [padding-bottom:1.5rem]">
              <div className="[display:flex] [align-items:center] [gap:0.25rem] [color:var(--color-primary)] [font-weight:400]">
                <Star size={14} fill="var(--color-primary)" /> {hotel.rating?.toFixed(1) || '4.5'} {t('common.rating')}
              </div>
              <div className="[display:flex] [align-items:center] [gap:0.25rem] [color:var(--color-muted)] [font-size:0.9rem] [font-weight:300]">
                <MapPin size={14} /> {hotel.address}
              </div>
            </div>

            <p className="[color:var(--color-text)] [line-height:1.8] [font-weight:300] [font-size:1rem] [margin-bottom:3rem]">
              {hotel.description || t('hotelDetail.defaultDescription')}
            </p>

            {/* AMENITIES */}
            <div className="[margin-bottom:4rem]">
              <h3 className="[font-family:var(--font-heading)] [font-weight:300] [font-size:1.8rem] [margin-bottom:1.5rem] [color:var(--color-text)]">{t('hotelDetail.facilities')}</h3>
              {hotelFacilities.length > 0 ?
              <div className="hotel-detail-facilities-grid [display:grid] [grid-template-columns:1fr_1fr] [gap:1.25rem]">
                  {hotelFacilities.map((f) => {
                  const iconKey = String(f.icon || '').toLowerCase();
                  const FacilityIcon = facilityIconMap[iconKey] || Check;
                  return (
                    <div key={f.id} className="[display:flex] [align-items:center] [gap:0.75rem] [color:var(--color-text)] [font-size:0.9rem] [font-weight:300]">
                      <div className="[background:var(--color-background)] [width:32px] [height:32px] [border-radius:50%] [display:flex] [align-items:center] [justify-content:center] [border:1px_solid_var(--color-accent)]">
                        <FacilityIcon size={14} className="[color:var(--color-primary)]" />
                      </div>
                      <span>{f.name}</span>
                    </div>);

                })}
                </div> :

              <p className="[color:var(--color-muted)] [font-size:0.9rem] [line-height:1.6]">
                  {t('hotelDetail.noFacilities')}
                </p>
              }
            </div>

            {/* ROOM MATRIX */}
            {roomTypes.length > 0 &&
            <div>
                <h3 id="room-matrix" className="[font-family:var(--font-heading)] [font-weight:300] [font-size:1.8rem] [margin-bottom:1.5rem] [color:var(--color-text)]">{t('hotelDetail.rooms')}</h3>
                <div className="[display:flex] [flex-direction:column] [gap:1.5rem]">
                  {roomTypes.map((room) => {
                  const roomId = room.id_room_type || room.idRoomType;
                  const isSelected = activeRoom === roomId;
                  const roomAvailable = getRoomAvailability(room);
                  const roomUnavailable = roomAvailable <= 0;
                  const fullPeriods = roomFullPeriodsByRoom[roomId] || [];
                  const roomFacilities = (room.facilities || []).
                  map(normalizeFacility).
                  filter(Boolean);
                  return (
                    <div key={roomId} onClick={() => setActiveRoom(roomId)}
                    className={cn(
                      'hotel-detail-room-card flex min-h-[180px] cursor-pointer overflow-hidden rounded-lg border transition duration-300',
                      isSelected
                        ? 'border-[var(--color-primary)] bg-[var(--color-surface)] shadow-[var(--shadow-hover)]'
                        : 'border-[var(--color-accent)] bg-transparent shadow-none',
                    )}>
                        <div className="hotel-detail-room-media [width:220px] [height:100%] [flex-shrink:0] [overflow:hidden]">
                          <img src={getImageUrl(room.images?.[0]) || ROOM_FALLBACK_IMAGE} alt={room.name} className="[width:100%] [height:100%] [object-fit:cover]" />
                        </div>
                        {/* Room description */}
                        <div className="hotel-detail-room-body [padding:1.5rem] [flex:1] [display:flex] [flex-direction:column] [justify-content:space-between]">
                          <div>
                            <div className="[display:flex] [justify-content:space-between] [align-items:flex-start]">
                              <h4 className="[font-family:var(--font-heading)] [font-size:1.3rem] [margin:0] [font-weight:300] [color:var(--color-text)]">{room.name}</h4>
                              <div className="[display:flex] [gap:0.5rem]">
                                <span className={cn(
                                  'badge border-transparent text-[0.65rem]',
                                  roomUnavailable
                                    ? 'bg-red-500/10 text-[#C53030]'
                                    : roomAvailable > 3
                                      ? 'bg-emerald-500/10 text-[#276749]'
                                      : 'bg-orange-500/10 text-[#DD6B20]',
                                )}>
                                  {roomUnavailable ? t('hotelDetail.unavailableRoom') : t('hotelDetail.available', { count: roomAvailable })}
                                </span>
                              </div>
                            </div>
                            <p className="[color:var(--color-muted)] [font-size:0.8rem] [font-weight:300] [margin-top:0.5rem] [display:flex] [gap:1rem]">
                              <span>{t('hotelDetail.roomSize')}</span>
                              <span>-</span>
                              <span>{t('hotelDetail.bed')}</span>
                            </p>
                            {roomFacilities.length > 0 &&
                          <div className="[display:flex] [flex-wrap:wrap] [gap:0.4rem] [margin-top:0.75rem]">
                                {roomFacilities.map((facility) => {
                              const RoomFacilityIcon = facilityIconMap[String(facility.icon || '').toLowerCase()] || Check;
                              return (
                                <span
                                  key={facility.id}
                                  className="badge badge-gray [display:inline-flex] [align-items:center] [gap:0.3rem] [font-size:0.65rem]">

                                  
                                      <RoomFacilityIcon size={11} />
                                      {facility.name}
                                    </span>);

                            })}
                              </div>
                          }
                            {fullPeriods.length > 0 &&
                          <div className="[margin-top:0.75rem] [display:flex] [flex-direction:column] [gap:0.35rem]">
                                {fullPeriods.slice(0, 2).map((period) =>
                            <div key={`${period.start_date || period.startDate}-${period.end_date || period.endDate}`} className="[display:flex] [align-items:flex-start] [gap:0.4rem] [color:var(--color-danger)] [font-size:0.78rem] [line-height:1.45] [font-weight:400]">
                                    <AlertCircle size={14} className="[flex-shrink:0] [margin-top:1px]" />
                                    <span>{period.message}</span>
                                  </div>
                            )}
                                {fullPeriods.length > 2 &&
                            <span className="[color:var(--color-danger)] [font-size:0.75rem] [font-weight:400]">
                                    +{fullPeriods.length - 2} periode penuh lainnya
                                  </span>
                            }
                              </div>
                          }
                          </div>

                          <div className="hotel-detail-room-footer [display:flex] [justify-content:space-between] [align-items:flex-end] [border-top:1px_solid_var(--color-accent)] [padding-top:0.75rem]">
                            <div className="[display:flex] [align-items:center] [gap:0.35rem] [font-size:0.8rem] [color:var(--color-muted)] [font-weight:300]"><Users size={12} /> {t('hotelDetail.maxGuests', { count: room.max_guest ?? room.maxGuest })}</div>
                            <div className="[text-align:right]">
                              {hasDiscount ?
                            <>
                                  <div className="[font-size:0.8rem] [color:var(--color-muted)] [text-decoration:line-through]">
                                    {formatCurrency(room.price_per_night ?? room.pricePerNight)}
                                  </div>
                                  <div className="[font-size:1rem] [font-weight:500] [color:#C53030]">
                                    {formatCurrency((room.price_per_night ?? room.pricePerNight) * (1 - discountPercent / 100))}
                                    <span className="[font-size:0.7rem] [color:var(--color-muted)] [font-weight:300]">{t('home.perNight')}</span>
                                  </div>
                                </> :

                            <div className="[font-size:0.95rem] [font-weight:400] [color:var(--color-primary)]">
                                  {formatCurrency(room.price_per_night ?? room.pricePerNight)}
                                  <span className="[font-size:0.7rem] [color:var(--color-muted)]">{t('home.perNight')}</span>
                                </div>
                            }
                            </div>
                          </div>
                        </div>
                      </div>);

                })}
                </div>
              </div>
            }

          </div>

          {/* RIGHT COLUMN: Sticky Reserve Summary */}
          <div className="hotel-detail-reservation [position:sticky] [top:120px]">
            <div className="card [padding:2rem] [border:1px_solid_var(--color-accent)] [box-shadow:var(--shadow-float)]">
              <h3 className="[font-family:var(--font-heading)] [font-size:1.5rem] [margin-bottom:1.5rem] [color:var(--color-text)] [border-bottom:1px_solid_var(--color-accent)] [padding-bottom:0.75rem] [font-weight:300]">{t('hotelDetail.reservation')}</h3>
              
              {selectedRoom ?
              <div className="[display:flex] [flex-direction:column] [gap:1.25rem] [margin-bottom:2rem]">
                  <div>
                    <span className="[font-size:0.7rem] [color:var(--color-muted)] [text-transform:uppercase] [letter-spacing:0.5px]">{t('hotelDetail.roomType')}</span>
                    <div className="[font-weight:400] [color:var(--color-text)] [font-size:1rem] [margin-top:0.25rem]">{selectedRoom.name}</div>
                    {selectedRoomUnavailable &&
                  <div className="[color:var(--color-danger)] [font-size:0.8rem] [margin-top:0.5rem] [font-weight:400]">
                        {t('hotelDetail.roomUnavailableMessage')}
                      </div>
                  }
                    {selectedRoomFullPeriods.length > 0 &&
                  <div className="[margin-top:0.75rem] [display:flex] [flex-direction:column] [gap:0.4rem]">
                        {selectedRoomFullPeriods.map((period) =>
                    <div key={`${period.start_date || period.startDate}-${period.end_date || period.endDate}`} className="[display:flex] [align-items:flex-start] [gap:0.45rem] [color:var(--color-danger)] [font-size:0.8rem] [line-height:1.5] [font-weight:400]">
                            <AlertCircle size={14} className="[flex-shrink:0] [margin-top:2px]" />
                            <span>{period.message}</span>
                          </div>
                    )}
                      </div>
                  }
                  </div>
                  
                  <div className="[background:var(--color-background)] [border:1px_solid_var(--color-accent)] [padding:1rem] [border-radius:var(--radius-sm)]">
                    <div className="[display:flex] [justify-content:space-between] [font-size:0.85rem] [color:var(--color-text)] [margin-bottom:0.5rem]">
                      <span>{t('hotelDetail.priceNight')}</span>
                      <span>{formatCurrency(selectedRoom.price_per_night ?? selectedRoom.pricePerNight)}</span>
                    </div>
                    {hasDiscount &&
                  <div className="[display:flex] [justify-content:space-between] [font-size:0.85rem] [color:#C53030]">
                        <span>{t('hotelDetail.discount', { percent: discountPercent })}</span>
                        <span>-{formatCurrency((selectedRoom.price_per_night ?? selectedRoom.pricePerNight) * discountPercent / 100)}</span>
                      </div>
                  }
                  </div>
                </div> :

              <p className="[color:var(--color-muted)] [font-size:0.85rem] [margin-bottom:2rem] [font-weight:300]">{t('hotelDetail.chooseRoom')}</p>
              }

              {user?.role === 'ROLE_USER' ?
              selectedRoomUnavailable ?
              <button type="button" className="btn btn-primary btn-full [justify-content:center] [height:50px] [opacity:0.55] [cursor:not-allowed]" disabled>
                    {t('hotelDetail.unavailableRoom')}
                  </button> :

              <Link to={`/booking/${hotel.id_hotel}?roomTypeId=${activeRoom}`} className="btn btn-primary btn-full [justify-content:center] [height:50px] [background:var(--color-primary)]">
                  {t('hotelDetail.reserve')}
                </Link> :

              !user ?
              <Link to={`/login?redirect=/hotels/${hotel.id_hotel}`} className="btn btn-full hotel-login-book-btn [justify-content:center] [height:50px]">
                  {t('hotelDetail.signInToBook')}
                </Link> :

              <div className="[background:var(--color-background)] [border:1px_solid_var(--color-accent)] [padding:1rem] [text-align:center] [font-size:0.8rem] [color:var(--color-muted)] [font-weight:300]">
                  {t('hotelDetail.adminCannotBook')}
                </div>
              }

              <p className="[text-align:center] [color:var(--color-muted)] [font-size:0.75rem] [margin-top:1rem] [font-weight:300]">
                {t('hotelDetail.secureCheckout')}
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* LIGHTBOX MODAL */}
      {lightboxOpen &&
      <div className="[position:fixed] [inset:0] [z-index:1000] [background:rgba(26,54,93,0.95)] [display:flex] [align-items:center] [justify-content:center] [padding:2rem]">
          <button onClick={() => setLightboxOpen(false)} className="[position:absolute] [top:30px] [right:30px] [background:transparent] [border:none] [cursor:pointer] [color:white]">
            <X size={32} />
          </button>
          
          <button onClick={() => setActiveImg((c) => (c - 1 + images.length) % images.length)} className="[position:absolute] [left:40px] [background:transparent] [border:1px_solid_rgba(255,255,255,0.2)] [border-radius:50%] [padding:0.75rem] [cursor:pointer] [color:white]">
            <ArrowLeft size={24} />
          </button>

          <div className="[max-width:80%] [max-height:80%] [overflow:hidden]">
            <img src={images[activeImg]} alt={`${hotel.name} - foto ${activeImg + 1}`} className="[width:100%] [height:100%] [object-fit:contain]" />
          </div>

          <button onClick={() => setActiveImg((c) => (c + 1) % images.length)} className="[position:absolute] [right:40px] [background:transparent] [border:1px_solid_rgba(255,255,255,0.2)] [border-radius:50%] [padding:0.75rem] [cursor:pointer] [color:white]">
            <ArrowLeft size={24} className="[transform:rotate(180deg)]" />
          </button>
        </div>
      }

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

    </div>);

};

export default HotelDetail;
