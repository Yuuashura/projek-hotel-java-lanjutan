import { getImageUrl } from '../../../utils/uploads';

export const HOTEL_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200';
export const ROOM_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=600';

export const resolveHotelImageUrl = (image, fallback = '') => {
  if (!image) return fallback;
  const path = typeof image === 'string' ? image : (image.image_url || image.imageUrl || image.url || '');
  return getImageUrl(path, fallback);
};

export const normalizeFacility = (item) => {
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

export const getRoomAvailability = (room) => Number(room?.room_available ?? room?.roomAvailable ?? 0);
