import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, Users, Wifi, ArrowLeft, Calendar, Check, X } from 'lucide-react';
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
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    api.get(`/api/hotels/${id}`)
      .then(r => { 
        setHotel(r.data.data); 
        if (r.data.data?.roomTypes?.length > 0) {
          setActiveRoom(r.data.data.roomTypes[0].id_room_type); 
        }
      })
      .catch(() => navigate('/hotels'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-muted)' }}>Memuat data hotel...</span>
      </div>
    );
  }
  if (!hotel) return null;

  const selectedRoom = hotel.roomTypes?.find(r => r.id_room_type === activeRoom);

  // Setup gallery images (must support up to 5 for masonry)
  const images = hotel.images?.length > 0 
    ? hotel.images 
    : [{ image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800' }];

  return (
    <div style={{ background: 'var(--color-background)', minHeight: '100vh', padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: 1300, margin: '0 auto' }}>
        
        {/* Back Link */}
        <Link to="/hotels" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-body)', fontWeight: 400, textDecoration: 'none', color: 'var(--color-text)', marginBottom: '2.5rem', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>
          <ArrowLeft size={14} /> Back to Sanctuaries
        </Link>

        {/* MASONRY GALLERY */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', height: 480, marginBottom: '2.5rem', overflow: 'hidden', borderRadius: 'var(--radius-sm)' }}>
          {/* Main feature image */}
          <div style={{ position: 'relative', cursor: 'zoom-in', overflow: 'hidden' }} onClick={() => { setActiveImg(0); setLightboxOpen(true); }}>
            <img src={images[0]?.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.8s ease' }} 
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
          </div>
          {/* Grid of smaller images */}
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '1rem' }}>
            <div style={{ position: 'relative', cursor: 'zoom-in', overflow: 'hidden' }} onClick={() => { setActiveImg(Math.min(1, images.length - 1)); setLightboxOpen(true); }}>
              <img src={images[1]?.image_url || images[0]?.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.8s ease' }} 
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
            </div>
            <div style={{ position: 'relative', cursor: 'zoom-in', overflow: 'hidden' }} onClick={() => { setActiveImg(Math.min(2, images.length - 1)); setLightboxOpen(true); }}>
              <img src={images[2]?.image_url || images[0]?.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.8s ease' }} 
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
              </div>
          </div>
        </div>

        {/* SPLIT LAYOUT */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '3.5rem', alignItems: 'flex-start' }}>
          
          {/* LEFT COLUMN: Info, Amenities, Room Matrix */}
          <div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <span className="badge badge-yellow">{hotel.city?.name}</span>
              <span className="badge badge-gray">{hotel.type || 'Luxury Resort'}</span>
              {hotel.featured && <span className="badge badge-yellow" style={{ background: 'var(--color-primary)', color: 'white' }}>Featured</span>}
            </div>
            
            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '3rem', margin: '0 0 1rem', color: 'var(--color-text)', lineHeight: 1.1 }}>{hotel.name}</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem', borderBottom: '1px solid var(--color-accent)', paddingBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)', fontWeight: 400 }}>
                <Star size={14} fill="var(--color-primary)" /> {hotel.rating?.toFixed(1) || '4.5'} Rating
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-muted)', fontSize: '0.9rem', fontWeight: 300 }}>
                <MapPin size={14} /> {hotel.address}
              </div>
            </div>

            <p style={{ color: 'var(--color-text)', lineHeight: 1.8, fontWeight: 300, fontSize: '1rem', marginBottom: '3rem' }}>
              {hotel.description || 'Nikmati keindahan peristirahatan terpencil di kelilingi lanskap alam memukau. Properti kami menawarkan paduan keanggunan desain arsitektur kontemporer dengan keramahtamahan lokal yang hangat.'}
            </p>

            {/* AMENITIES */}
            {hotel.facilities?.length > 0 && (
              <div style={{ marginBottom: '4rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--color-text)' }}>Fasilitas Sanctuari</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  {hotel.facilities.map(f => (
                    <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text)', fontSize: '0.9rem', fontWeight: 300 }}>
                      <div style={{ background: 'var(--color-background)', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-accent)' }}>
                        <Check size={14} style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <span>{f.facility?.name || f.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ROOM MATRIX */}
            {hotel.roomTypes?.length > 0 && (
              <div>
                <h3 id="room-matrix" style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--color-text)' }}>Pilih Suite & Kamar</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {hotel.roomTypes.map(room => {
                    const isSelected = activeRoom === room.id_room_type;
                    return (
                      <div key={room.id_room_type} onClick={() => setActiveRoom(room.id_room_type)}
                        style={{
                          display: 'flex', height: 180, cursor: 'pointer', borderRadius: 'var(--radius-sm)', overflow: 'hidden',
                          border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--color-accent)',
                          background: isSelected ? 'var(--color-surface)' : 'transparent',
                          boxShadow: isSelected ? 'var(--shadow-hover)' : 'none',
                          transition: 'all 0.3s ease'
                        }}>
                        <div style={{ width: 220, height: '100%', flexShrink: 0, overflow: 'hidden' }}>
                          <img src={room.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=400'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        {/* Room description */}
                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', margin: 0, fontWeight: 300, color: 'var(--color-text)' }}>{room.name}</h4>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <span className="badge" style={{ fontSize: '0.65rem', background: room.room_available > 3 ? 'rgba(72,187,120,0.1)' : 'rgba(237,137,54,0.1)', color: room.room_available > 3 ? '#276749' : '#DD6B20', borderColor: 'transparent' }}>
                                  {room.room_available} Available
                                </span>
                              </div>
                            </div>
                            <p style={{ color: 'var(--color-muted)', fontSize: '0.8rem', fontWeight: 300, marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                              <span>📐 45 sqm</span>
                              <span>•</span>
                              <span>🛏️ King Bed</span>
                            </p>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--color-accent)', paddingTop: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 300 }}><Users size={12} /> Max. {room.max_guest} Guests</div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.95rem', fontWeight: 400, color: 'var(--color-primary)' }}>{formatCurrency(room.price_per_night)}<span style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>/night</span></div>
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
          <div style={{ position: 'sticky', top: 120 }}>
            <div className="card" style={{ padding: '2rem', border: '1px solid var(--color-accent)', boxShadow: 'var(--shadow-float)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--color-text)', borderBottom: '1px solid var(--color-accent)', paddingBottom: '0.75rem', fontWeight: 300 }}>Reservasi</h3>
              
              {selectedRoom ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tipe Kamar</span>
                    <div style={{ fontWeight: 400, color: 'var(--color-text)', fontSize: '1rem', marginTop: '0.25rem' }}>{selectedRoom.name}</div>
                  </div>
                  
                  <div style={{ background: 'var(--color-background)', border: '1px solid var(--color-accent)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                      <span>Price / night</span>
                      <span>{formatCurrency(selectedRoom.price_per_night)}</span>
                    </div>
                    {hotel.onSale && hotel.discountPercent > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#C53030' }}>
                        <span>Discount {hotel.discountPercent}%</span>
                        <span>-{formatCurrency(selectedRoom.price_per_night * hotel.discountPercent / 100)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', marginBottom: '2rem', fontWeight: 300 }}>Silakan pilih salah satu tipe kamar untuk memesan.</p>
              )}

              {user?.role === 'ROLE_USER' ? (
                <Link to={`/booking/${hotel.id_hotel}?roomTypeId=${activeRoom}`} className="btn btn-primary btn-full" style={{ justifyContent: 'center', height: 50, background: 'var(--color-primary)' }}>
                  Reserve Suite
                </Link>
              ) : !user ? (
                <Link to={`/login?redirect=/hotels/${hotel.id_hotel}`} className="btn btn-dark btn-full" style={{ justifyContent: 'center', height: 50 }}>
                  Sign In to Book
                </Link>
              ) : (
                <div style={{ background: 'var(--color-background)', border: '1px solid var(--color-accent)', padding: '1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-muted)', fontWeight: 300 }}>
                  Admin cannot book rooms
                </div>
              )}

              <p style={{ textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.75rem', marginTop: '1rem', fontWeight: 300 }}>
                🔒 Secure checkout powered by NgiNep
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
            <img src={images[activeImg]?.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          <button onClick={() => setActiveImg(c => (c + 1) % images.length)} style={{ position: 'absolute', right: 40, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', padding: '0.75rem', cursor: 'pointer', color: 'white' }}>
            <ArrowLeft size={24} style={{ transform: 'rotate(180deg)' }} />
          </button>
        </div>
      )}

    </div>
  );
};

export default HotelDetail;
