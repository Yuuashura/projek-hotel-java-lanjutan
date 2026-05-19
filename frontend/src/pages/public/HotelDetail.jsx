import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, Users, Wifi, ArrowLeft, Calendar, Check } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const HotelDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [activeRoom, setActiveRoom] = useState(null);

  useEffect(() => {
    api.get(`/api/hotels/${id}`)
      .then(r => { setHotel(r.data.data); if (r.data.data?.roomTypes?.length > 0) setActiveRoom(r.data.data.roomTypes[0].id_room_type); })
      .catch(() => navigate('/hotels'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><div style={{ fontFamily: 'Space Grotesk', fontWeight: 700 }}>Memuat data hotel...</div></div>;
  if (!hotel) return null;

  const selectedRoom = hotel.roomTypes?.find(r => r.id_room_type === activeRoom);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Back */}
      <Link to="/hotels" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'Space Grotesk', fontWeight: 700, textDecoration: 'none', color: 'var(--neo-dark)', marginBottom: '1.5rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>
        <ArrowLeft size={16} /> Kembali ke Daftar Hotel
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'flex-start' }}>
        {/* LEFT */}
        <div>
          {/* Image Gallery */}
          <div style={{ border: '4px solid var(--neo-dark)', overflow: 'hidden', marginBottom: '0.75rem', boxShadow: 'var(--neo-shadow-lg)', position: 'relative', height: 400 }}>
            <img src={hotel.images?.[activeImg]?.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800'} alt={hotel.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {hotel.onSale && hotel.discountPercent > 0 && (
              <span className="badge badge-red" style={{ position: 'absolute', top: 16, left: 16, fontSize: '0.85rem' }}>DISKON {hotel.discountPercent}%</span>
            )}
          </div>
          {hotel.images?.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {hotel.images.map((img, i) => (
                <div key={i} onClick={() => setActiveImg(i)} style={{ width: 80, height: 60, flexShrink: 0, border: `3px solid ${i === activeImg ? 'var(--neo-orange)' : 'var(--neo-dark)'}`, cursor: 'pointer', overflow: 'hidden', transition: 'border 0.15s', boxShadow: i === activeImg ? 'var(--neo-shadow)' : 'none' }}>
                  <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}

          {/* Hotel Info */}
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <span className="badge badge-yellow">{hotel.city?.name}</span>
              <span className="badge badge-gray">{hotel.type}</span>
              {hotel.featured && <span className="badge badge-dark">Featured</span>}
            </div>
            <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase', margin: '0 0 0.75rem' }}>{hotel.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--neo-orange)', fontWeight: 700 }}>
                <Star size={16} fill="var(--neo-orange)" />{hotel.rating?.toFixed(1) || '4.5'} / 5.0
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#6b7280', fontWeight: 500, fontSize: '0.9rem' }}>
                <MapPin size={14} />{hotel.address}
              </div>
            </div>
            <p style={{ color: '#374151', lineHeight: 1.7, fontWeight: 500, marginBottom: '2rem' }}>{hotel.description || 'Hotel mewah dengan fasilitas lengkap dan pelayanan bintang lima. Nikmati pengalaman menginap yang tak terlupakan di lokasi strategis.'}</p>

            {/* Facilities */}
            {hotel.facilities?.length > 0 && (
              <div>
                <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, textTransform: 'uppercase', fontSize: '1rem', marginBottom: '1rem' }}>Fasilitas Hotel</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {hotel.facilities.map(f => (
                    <span key={f.id} className="badge badge-gray" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Check size={10} /> {f.facility?.name || f.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Room Types */}
          {hotel.roomTypes?.length > 0 && (
            <div style={{ marginTop: '2.5rem' }}>
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, textTransform: 'uppercase', fontSize: '1rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '3px solid var(--neo-dark)' }}>Pilih Tipe Kamar</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {hotel.roomTypes.map(room => (
                  <div key={room.id_room_type} onClick={() => setActiveRoom(room.id_room_type)} className="card" style={{ padding: '1.25rem', cursor: 'pointer', border: activeRoom === room.id_room_type ? '3px solid var(--neo-orange)' : '3px solid var(--neo-dark)', background: activeRoom === room.id_room_type ? '#fff8f0' : 'white', boxShadow: activeRoom === room.id_room_type ? '4px 4px 0px 0px var(--neo-orange)' : 'var(--neo-shadow)', transition: 'all 0.15s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <h4 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '0.95rem', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>{room.name}</h4>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#6b7280', fontWeight: 600, fontSize: '0.8rem' }}><Users size={13} /> Maks. {room.max_guest} tamu</span>
                          <span className="badge" style={{ fontSize: '0.7rem', background: room.room_available > 3 ? '#d1fae5' : '#fef3c7', color: room.room_available > 3 ? '#065f46' : '#92400e', border: '2px solid var(--neo-dark)' }}>
                            {room.room_available > 0 ? `${room.room_available} kamar tersedia` : 'Habis'}
                          </span>
                          {room.is_smoking && <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>Smoking Room</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1.2rem', color: 'var(--neo-orange)' }}>{formatCurrency(room.price_per_night)}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500 }}>/malam</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT - Booking Card */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, textTransform: 'uppercase', fontSize: '1rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '3px solid var(--neo-dark)' }}>Ringkasan Harga</h3>

            {selectedRoom && (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Tipe Kamar Dipilih</div>
                  <div style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '0.95rem', textTransform: 'uppercase' }}>{selectedRoom.name}</div>
                </div>
                <div style={{ background: 'var(--neo-light)', border: '3px solid var(--neo-dark)', padding: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <span>Harga/malam</span>
                    <span style={{ fontFamily: 'Space Grotesk', fontWeight: 900 }}>{formatCurrency(selectedRoom.price_per_night)}</span>
                  </div>
                  {hotel.onSale && hotel.discountPercent > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.9rem', color: 'var(--neo-pink)' }}>
                      <span>Diskon {hotel.discountPercent}%</span>
                      <span>-{formatCurrency(selectedRoom.price_per_night * hotel.discountPercent / 100)}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {user?.role === 'ROLE_USER' ? (
              <Link to={`/booking/${hotel.id_hotel}?roomTypeId=${activeRoom}`} className="btn btn-orange btn-full" style={{ justifyContent: 'center' }}>
                <Calendar size={16} /> Pesan Sekarang
              </Link>
            ) : !user ? (
              <Link to={`/login?redirect=/hotels/${hotel.id_hotel}`} className="btn btn-dark btn-full" style={{ justifyContent: 'center' }}>
                Masuk untuk Memesan
              </Link>
            ) : (
              <div style={{ background: '#f3f4f6', border: '3px solid #e5e7eb', padding: '1rem', textAlign: 'center', fontWeight: 600, fontSize: '0.875rem', color: '#6b7280' }}>Admin tidak dapat melakukan pemesanan</div>
            )}

            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#9ca3af', fontWeight: 500, textAlign: 'center', lineHeight: 1.5 }}>
              ✅ Tidak dikenakan biaya hingga pemesanan dikonfirmasi
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetail;
