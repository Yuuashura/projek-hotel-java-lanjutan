import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import LoadingState from '../../components/LoadingState';
import HotelFacilities from '../../components/hotels/detail/HotelFacilities';
import HotelGallery from '../../components/hotels/detail/HotelGallery';
import HotelLightbox from '../../components/hotels/detail/HotelLightbox';
import HotelReservationCard from '../../components/hotels/detail/HotelReservationCard';
import HotelRoomCard from '../../components/hotels/detail/HotelRoomCard';
import { getRoomAvailability, HOTEL_FALLBACK_IMAGE, normalizeFacility, resolveHotelImageUrl } from '../../components/hotels/detail/hotelDetailUtils';
import api from '../../utils/api';

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
  const [allFacilities, setAllFacilities] = useState([]);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      const [hotelResult, facilitiesResult] = await Promise.allSettled([
        api.get(`/api/hotels/${id}`),
        api.get('/api/facilities'),
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

      if (facilitiesResult.status === 'fulfilled') {
        const facilityData = facilitiesResult.value.data.data || facilitiesResult.value.data || [];
        if (Array.isArray(facilityData)) {
          setAllFacilities(facilityData.map(normalizeFacility).filter(Boolean));
        }
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
  const selectedRoom = roomTypes.find(room => (room.id_room_type || room.idRoomType) === activeRoom);
  const selectedRoomUnavailable = selectedRoom && getRoomAvailability(selectedRoom) <= 0;
  const hotelFacilities = (hotel.facilities || hotel.hotelFacilities || []).map(normalizeFacility).filter(Boolean);
  const displayFacilities = hotelFacilities.length > 0 ? hotelFacilities : allFacilities;
  const usingFacilityFallback = hotelFacilities.length === 0 && displayFacilities.length > 0;
  const uploadedImages = hotel.images?.map(image => resolveHotelImageUrl(image)).filter(Boolean) || [];
  const images = uploadedImages.length > 0 ? uploadedImages : [HOTEL_FALLBACK_IMAGE];

  const openLightbox = (index) => {
    setActiveImg(index);
    setLightboxOpen(true);
  };

  return (
    <div className="hotel-detail-page" style={{ background: 'var(--color-background)', minHeight: '100vh', padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: 1300, margin: '0 auto' }}>
        <Link to="/hotels" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-body)', fontWeight: 400, textDecoration: 'none', color: 'var(--color-text)', marginBottom: '2.5rem', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>
          <ArrowLeft size={14} /> {t('hotelDetail.back')}
        </Link>

        <HotelGallery images={images} hotelName={hotel.name} t={t} onOpen={openLightbox} />

        <div className="hotel-detail-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '3.5rem', alignItems: 'flex-start' }}>
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

            <HotelFacilities facilities={displayFacilities} usingFallback={usingFacilityFallback} t={t} />

            {roomTypes.length > 0 && (
              <div>
                <h3 id="room-matrix" style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--color-text)' }}>{t('hotelDetail.rooms')}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {roomTypes.map(room => {
                    const roomId = room.id_room_type || room.idRoomType;
                    return (
                      <HotelRoomCard
                        key={roomId}
                        room={room}
                        selected={activeRoom === roomId}
                        onSelect={() => setActiveRoom(roomId)}
                        t={t}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <HotelReservationCard
            hotel={hotel}
            selectedRoom={selectedRoom}
            activeRoom={activeRoom}
            selectedRoomUnavailable={selectedRoomUnavailable}
            user={user}
            t={t}
          />
        </div>
      </div>

      {lightboxOpen && (
        <HotelLightbox
          images={images}
          activeImg={activeImg}
          setActiveImg={setActiveImg}
          onClose={() => setLightboxOpen(false)}
          hotelName={hotel.name}
        />
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
