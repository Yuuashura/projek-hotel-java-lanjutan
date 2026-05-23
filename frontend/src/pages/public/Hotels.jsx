import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, MapPin, Grid, List, X, Loader } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import api from '../../utils/api';

const Hotels = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePin, setActivePin] = useState(null);
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    cityId: searchParams.get('cityId') || '',
    sortBy: 'default',
  });

  useEffect(() => {
    api.get('/api/cities').then(r => setCities(r.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filters.keyword) params.keyword = filters.keyword;
        if (filters.cityId) params.cityId = filters.cityId;
        const res = await api.get('/api/hotels', { params });
        let data = res.data.data || [];
        if (filters.sortBy === 'price_asc') data = [...data].sort((a, b) => (a.roomTypes?.[0]?.price_per_night || 0) - (b.roomTypes?.[0]?.price_per_night || 0));
        if (filters.sortBy === 'price_desc') data = [...data].sort((a, b) => (b.roomTypes?.[0]?.price_per_night || 0) - (a.roomTypes?.[0]?.price_per_night || 0));
        if (filters.sortBy === 'rating') data = [...data].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        setHotels(data);
      } catch (e) { setHotels([]); }
      finally { setLoading(false); }
    };
    fetch();
  }, [filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ keyword: filters.keyword, cityId: filters.cityId });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header Panel */}
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-accent)', padding: '2.5rem 1.5rem 1.5rem' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '2rem', margin: 0, color: 'var(--color-text)' }}>Jelajahi Sanctuari</h1>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', fontWeight: 300, margin: '0.25rem 0 0' }}>Menampilkan {hotels.length} tempat peristirahatan premium</p>
          </div>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end', maxWidth: 800 }}>
            <input className="input" style={{ width: 'auto', minWidth: 200, padding: '0.5rem 1rem', height: 42 }} placeholder="Cari kata kunci..." value={filters.keyword} onChange={e => setFilters(f => ({ ...f, keyword: e.target.value }))} />
            <select className="input" style={{ width: 'auto', minWidth: 160, padding: '0.5rem 1rem', height: 42 }} value={filters.cityId} onChange={e => setFilters(f => ({ ...f, cityId: e.target.value }))}>
              <option value="">Semua Kota</option>
              {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem', height: 42, background: 'var(--color-primary)' }}><Search size={14} /> Cari</button>
          </form>
        </div>
      </div>

      {/* Main Split Layout */}
      <div style={{ display: 'flex', flex: 1, width: '100%', maxWidth: 1400, margin: '0 auto', position: 'relative' }}>
        
        {/* Left Column (60%): Property list & filters */}
        <div style={{ width: '60%', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderRight: '1px solid var(--color-accent)' }}>
          
          {/* Filters Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-accent)', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-white btn-sm" style={{ height: 36, display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'none', letterSpacing: '0.5px', padding: '0 1rem' }}>
                <SlidersHorizontal size={12} /> Price
              </button>
              <button className="btn btn-white btn-sm" style={{ height: 36, display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'none', letterSpacing: '0.5px', padding: '0 1rem' }}>
                Amenities
              </button>
              <button className="btn btn-white btn-sm" style={{ height: 36, display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'none', letterSpacing: '0.5px', padding: '0 1rem' }}>
                Property Type
              </button>
            </div>
            
            <select className="input" style={{ width: 'auto', padding: '0.4rem 1rem', height: 36, fontSize: '0.8rem', borderRadius: '30px' }}
              value={filters.sortBy} onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value }))}>
              <option value="default">Urutkan: Default</option>
              <option value="price_asc">Harga: Terendah</option>
              <option value="price_desc">Harga: Tertinggi</option>
              <option value="rating">Rating: Tertinggi</option>
            </select>
          </div>

          {/* Active Filter Tags */}
          {(filters.keyword || filters.cityId) && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-muted)' }}>Filter Aktif:</span>
              {filters.keyword && (
                <span className="badge" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.75rem' }} onClick={() => setFilters(f => ({ ...f, keyword: '' }))}>
                  "{filters.keyword}" <X size={10} />
                </span>
              )}
              {filters.cityId && (
                <span className="badge" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.75rem' }} onClick={() => setFilters(f => ({ ...f, cityId: '' }))}>
                  {cities.find(c => c.id == filters.cityId)?.name} <X size={10} />
                </span>
              )}
            </div>
          )}

          {/* Property Cards */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: 240, background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 'var(--radius-sm)' }} />
              ))}
            </div>
          ) : hotels.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1.5rem', opacity: 0.6 }}>🌴</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 300 }}>No sanctuaries found for these dates.</h3>
              <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginBottom: '2rem', fontWeight: 300 }}>Coba ubah kata kunci atau pilih kota tujuan lain.</p>
              <button onClick={() => setFilters({ keyword: '', cityId: '', sortBy: 'default' })} className="btn btn-primary" style={{ background: 'var(--color-primary)' }}>Clear Filters</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {hotels.map((hotel, index) => (
                <PropertyHorizontalCard key={hotel.id_hotel} hotel={hotel} onHover={setActivePin} activePin={activePin} />
              ))}
            </div>
          )}
        </div>

        {/* Right Column (40%): Sticky interactive styled map */}
        <div style={{ width: '40%', position: 'sticky', top: 80, height: 'calc(100vh - 80px)', background: '#E2E8F0', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ width: '100%', height: '100%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 2s infinite' }}>
              <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-muted)' }}>Loading Map...</span>
            </div>
          ) : (
            <div style={{ width: '100%', height: '100%', position: 'relative', background: '#eef2f7' }}>
              {/* Elegant Blueprint Coastal background grid */}
              <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(var(--color-text) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              
              {/* Decorative Luxury Sea/Land design */}
              <div style={{ position: 'absolute', top: '15%', left: '10%', width: '40%', height: '30%', borderRadius: '40% 60% 70% 30% / 50% 60% 40% 50%', background: 'rgba(212,175,55,0.05)', border: '1px dashed rgba(212,175,55,0.2)' }} />
              <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: '35%', height: '35%', borderRadius: '50% 50% 30% 70% / 60% 40% 60% 40%', background: 'rgba(26,54,93,0.03)', border: '1px dashed rgba(26,54,93,0.1)' }} />
              
              <div style={{ position: 'absolute', top: 15, left: 15, background: 'rgba(255,255,255,0.9)', padding: '0.5rem 1rem', borderRadius: 20, boxShadow: 'var(--shadow-float)', border: '1px solid var(--color-accent)', fontSize: '0.75rem', letterSpacing: '0.5px', color: 'var(--color-text)' }}>
                📍 Interactive Sanctuary Map
              </div>

              {/* Pins matching the positions of the hotels */}
              {hotels.map((hotel, index) => {
                const isActive = activePin === hotel.id_hotel;
                // Generate semi-random deterministic positions based on hotel id
                const top = 20 + ((hotel.id_hotel * 17) % 65) + '%';
                const left = 15 + ((hotel.id_hotel * 23) % 70) + '%';
                const minPrice = hotel.roomTypes?.length > 0 ? Math.min(...hotel.roomTypes.map(r => r.price_per_night)) : 0;
                
                return (
                  <div key={hotel.id_hotel} style={{ position: 'absolute', top, left, transform: 'translate(-50%, -50%)', zIndex: isActive ? 50 : 10, cursor: 'pointer' }}
                    onMouseEnter={() => setActivePin(hotel.id_hotel)}
                    onMouseLeave={() => setActivePin(null)}>
                    
                    {/* Tooltip */}
                    {isActive && (
                      <div style={{ position: 'absolute', bottom: '130%', left: '50%', transform: 'translateX(-50%)', background: 'var(--color-surface)', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', width: 150, boxShadow: 'var(--shadow-hover)', pointerEvents: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <img src={hotel.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=150'} alt="" style={{ height: 60, width: '100%', objectFit: 'cover', borderRadius: 2 }} />
                        <span style={{ fontWeight: 500, fontSize: '0.7rem', color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{hotel.name}</span>
                        <span style={{ fontWeight: 400, fontSize: '0.7rem', color: 'var(--color-primary)' }}>{formatCurrency(minPrice)}</span>
                      </div>
                    )}

                    {/* Gold Pin Indicator */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isActive ? 'var(--color-text)' : 'var(--color-primary)',
                      color: isActive ? 'white' : 'var(--color-text)',
                      fontWeight: 500, fontSize: '0.75rem',
                      padding: '0.35rem 0.6rem', borderRadius: 15,
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                      border: '1px solid white',
                      transform: isActive ? 'scale(1.2)' : 'scale(1)',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                      ⭐ {formatCurrency(minPrice).replace('Rp', '').replace(',00', '').trim()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
      `}</style>
    </div>
  );
};

// Horizontal Property Card
const PropertyHorizontalCard = ({ hotel, onHover, activePin }) => {
  const minPrice = hotel.roomTypes?.length > 0 ? Math.min(...hotel.roomTypes.map(r => r.price_per_night)) : 0;
  const isActive = activePin === hotel.id_hotel;

  return (
    <div className="reveal active"
      style={{
        display: 'flex', height: 240, overflow: 'hidden', borderBottom: '1px solid var(--color-accent)', paddingBottom: '1.5rem',
        background: isActive ? 'var(--color-surface)' : 'transparent',
        boxShadow: isActive ? 'var(--shadow-float)' : 'none',
        borderRadius: isActive ? 'var(--radius-md)' : 0,
        padding: isActive ? '1rem' : '0 0 1.5rem 0',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      onMouseEnter={() => onHover(hotel.id_hotel)}
      onMouseLeave={() => onHover(null)}>
      
      {/* Left: Image */}
      <div style={{ width: 240, height: '100%', flexShrink: 0, overflow: 'hidden', borderRadius: 'var(--radius-sm)' }}>
        <img src={hotel.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400'} alt={hotel.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.8s ease' }} />
      </div>

      {/* Right: Info */}
      <div style={{ padding: '0 0 0 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 400 }}>{hotel.city?.name || 'Sanctuary'}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)', fontSize: '0.85rem' }}>
              <Star size={12} fill="var(--color-primary)" /> {hotel.rating?.toFixed(1) || '4.5'}
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-text)', margin: '0.25rem 0 0.5rem', fontWeight: 300 }}>{hotel.name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-muted)', fontSize: '0.8rem', fontWeight: 300, marginBottom: '0.5rem' }}>
            <MapPin size={12} /> {hotel.address || hotel.city?.name}
          </div>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', fontWeight: 300, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.5 }}>
            {hotel.description || 'Pengalaman bermalam eksklusif di kelilingi lanskap alam memukau dengan pelayanan berkelas dunia.'}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--color-accent)', paddingTop: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price per night</span>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '1.1rem', color: 'var(--color-text)' }}>
              {formatCurrency(minPrice)}
            </div>
          </div>
          <Link to={`/hotels/${hotel.id_hotel}`} style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 400, display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}>
            View Details →
          </Link>
        </div>
      </div>

    </div>
  );
};

export default Hotels;
