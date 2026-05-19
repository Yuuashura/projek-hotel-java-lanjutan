import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, MapPin, Grid, List, X } from 'lucide-react';
import { HotelCard } from './Home';
import { formatCurrency } from '../../utils/formatters';
import api from '../../utils/api';

const Hotels = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilter, setShowFilter] = useState(false);
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
    <div style={{ minHeight: '100vh', background: 'var(--neo-light)' }}>
      {/* Page Header */}
      <div style={{ background: 'var(--neo-dark)', borderBottom: '4px solid var(--neo-dark)', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, color: 'white', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Jelajahi Hotel</h1>
          <p style={{ color: '#9ca3af', fontWeight: 500 }}>Temukan penginapan terbaik dari {hotels.length} hotel tersedia</p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: 180 }}>
              <input className="input" placeholder="Cari hotel..." value={filters.keyword} onChange={e => setFilters(f => ({ ...f, keyword: e.target.value }))} />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <select className="input" value={filters.cityId} onChange={e => setFilters(f => ({ ...f, cityId: e.target.value }))}>
                <option value="">Semua Kota</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-primary"><Search size={16} /> Cari</button>
          </form>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <p style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.9rem' }}>
            Menampilkan <strong>{hotels.length}</strong> hasil hotel
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select className="input" style={{ width: 'auto', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
              value={filters.sortBy} onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value }))}>
              <option value="default">Urutkan: Default</option>
              <option value="price_asc">Harga: Terendah</option>
              <option value="price_desc">Harga: Tertinggi</option>
              <option value="rating">Rating: Tertinggi</option>
            </select>
            <div style={{ display: 'flex', border: '3px solid var(--neo-dark)', overflow: 'hidden' }}>
              <button onClick={() => setViewMode('grid')} style={{ padding: '0.5rem 0.75rem', background: viewMode === 'grid' ? 'var(--neo-dark)' : 'white', color: viewMode === 'grid' ? 'white' : 'var(--neo-dark)', border: 'none', cursor: 'pointer' }}><Grid size={16} /></button>
              <button onClick={() => setViewMode('list')} style={{ padding: '0.5rem 0.75rem', background: viewMode === 'list' ? 'var(--neo-dark)' : 'white', color: viewMode === 'list' ? 'white' : 'var(--neo-dark)', border: 'none', cursor: 'pointer', borderLeft: '2px solid var(--neo-dark)' }}><List size={16} /></button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(filters.keyword || filters.cityId) && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', color: '#6b7280' }}>Filter Aktif:</span>
            {filters.keyword && (
              <span className="badge badge-dark" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}
                onClick={() => setFilters(f => ({ ...f, keyword: '' }))}>
                "{filters.keyword}" <X size={10} />
              </span>
            )}
            {filters.cityId && (
              <span className="badge badge-blue" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}
                onClick={() => setFilters(f => ({ ...f, cityId: '' }))}>
                {cities.find(c => c.id == filters.cityId)?.name} <X size={10} />
              </span>
            )}
          </div>
        )}

        {/* Hotel List */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card" style={{ height: 380, background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
            ))}
          </div>
        ) : hotels.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏨</div>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1.25rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Hotel Tidak Ditemukan</h3>
            <p style={{ color: '#6b7280', fontWeight: 500, marginBottom: '1.5rem' }}>Coba ubah kata kunci atau pilih kota yang berbeda.</p>
            <button onClick={() => setFilters({ keyword: '', cityId: '', sortBy: 'default' })} className="btn btn-primary">Reset Filter</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : '1fr', gap: '1.5rem' }}>
            {hotels.map(hotel => viewMode === 'grid' ? <HotelCard key={hotel.id_hotel} hotel={hotel} /> : <HotelCardList key={hotel.id_hotel} hotel={hotel} />)}
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
    </div>
  );
};

const HotelCardList = ({ hotel }) => {
  const minPrice = hotel.roomTypes?.length > 0 ? Math.min(...hotel.roomTypes.map(r => r.price_per_night)) : 0;
  return (
    <div className="card card-hover" style={{ display: 'flex', overflow: 'hidden' }}>
      <div style={{ width: 220, flexShrink: 0, borderRight: '3px solid var(--neo-dark)' }}>
        <img src={hotel.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=300'} alt={hotel.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span className="badge badge-yellow">{hotel.city?.name}</span>
            <span className="badge badge-gray">{hotel.type}</span>
            {hotel.featured && <span className="badge badge-dark">Featured</span>}
          </div>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1.15rem', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>{hotel.name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#9ca3af', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>
            <MapPin size={13} />{hotel.address}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--neo-orange)', fontWeight: 700, fontSize: '0.9rem' }}>
            <Star size={14} fill="var(--neo-orange)" />{hotel.rating?.toFixed(1) || '4.5'}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px dashed #e5e7eb', paddingTop: '1rem', marginTop: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600 }}>Mulai dari</div>
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1.25rem' }}>{formatCurrency(minPrice)}<span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500 }}>/malam</span></div>
          </div>
          <Link to={`/hotels/${hotel.id_hotel}`} className="btn btn-primary">Lihat Detail</Link>
        </div>
      </div>
    </div>
  );
};

export default Hotels;
