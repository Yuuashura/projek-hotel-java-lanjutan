import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, Star, MapPin, ArrowRight, ChevronDown } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import api from '../../utils/api';
import CitySearchSelect from '../../components/CitySearchSelect';

// FAQ Data
const faqs = [
  { q: 'Bagaimana cara memesan hotel di NgiNep?', a: 'Cari hotel yang Anda inginkan menggunakan fitur pencarian, pilih tipe kamar, isi data pemesan, lalu klik "Pesan Sekarang". Anda akan diarahkan ke halaman pembayaran.' },
  { q: 'Metode pembayaran apa saja yang tersedia?', a: 'Saat ini kami mendukung Transfer Bank BCA, Transfer Bank BRI, Transfer Bank BNI, dan QRIS. Upload bukti transfer Anda untuk dikonfirmasi oleh admin hotel.' },
  { q: 'Apakah saya bisa membatalkan pemesanan?', a: 'Pembatalan dapat dilakukan selama status pesanan masih PENDING (belum dikonfirmasi admin). Pesanan yang sudah CONFIRMED tidak dapat dibatalkan secara mandiri.' },
  { q: 'Berapa lama verifikasi pembayaran?', a: 'Verifikasi dilakukan oleh Admin Hotel dalam waktu 1x24 jam setelah bukti pembayaran diunggah. Anda akan mendapat notifikasi perubahan status pesanan.' },
  { q: 'Apakah data pribadi saya aman?', a: 'Ya! Kami menggunakan JWT Token terenkripsi, BCrypt untuk password, dan pola DTO untuk menjaga data Anda tetap aman dan tidak bocor.' },
];

// Slide Banner Data (Luxury resorts photography)
const slides = [
  { id: 1, image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1600&h=1000', title: 'Aman Sanctuary Villa', city: 'Bali', desc: 'Sebuah peristirahatan privat berdesain minimalis mewah di tebing laut Uluwatu', price: 1850000 },
  { id: 2, image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=1600&h=1000', title: 'Coastal Serenity Resort', city: 'Lombok', desc: 'Paduan keindahan samudera biru dengan kemewahan fasilitas bintang lima privat', price: 2400000 },
  { id: 3, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1600&h=1000', title: 'The Heritage Pavilion', city: 'Yogyakarta', desc: 'Ketenteraman arsitektur klasik Jawa berbalut layanan berstandar internasional modern', price: 1200000 },
];

// Destinations Collections Data
const collections = [
  { name: 'Bali', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=600&h=800', count: '12 Sanctuaries' },
  { name: 'Yogyakarta', image: 'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&q=80&w=600&h=800', count: '8 Sanctuaries' },
  { name: 'Bandung', image: 'https://images.unsplash.com/photo-1626125353112-9c4c798ca30a?auto=format&fit=crop&q=80&w=600&h=800', count: '15 Sanctuaries' },
];

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--color-accent)', background: 'transparent', transition: 'all 0.3s ease' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '1rem', color: 'var(--color-text)' }}>{q}</span>
        <ChevronDown size={18} style={{ flexShrink: 0, color: 'var(--color-muted)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
      </button>
      <div style={{ maxHeight: open ? '200px' : '0px', overflow: 'hidden', transition: 'max-height 0.3s ease-out' }}>
        <p style={{ paddingBottom: '1.5rem', color: 'var(--color-muted)', fontWeight: 300, lineHeight: 1.7, fontSize: '0.9rem' }}>{a}</p>
      </div>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [cities, setCities] = useState([]);
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [saleHotels, setSaleHotels] = useState([]);
  const [search, setSearch] = useState({ city: '', keyword: '' });
  const timerRef = useRef(null);

  // Auto-play slider
  useEffect(() => {
    if (!hovering) {
      timerRef.current = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000);
    }
    return () => clearInterval(timerRef.current);
  }, [hovering]);

  // Fetch initial data
  useEffect(() => {
    api.get('/api/cities').then(r => setCities(r.data.data || [])).catch(() => {});
    api.get('/api/hotels/featured').then(r => setFeaturedHotels((r.data.data || []).slice(0, 3))).catch(() => {});
    api.get('/api/hotels?keyword=sale').then(r => setSaleHotels((r.data.data || []).filter(h => h.is_on_sale).slice(0, 3))).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.keyword) params.set('keyword', search.keyword);
    if (search.city) params.set('cityId', search.city);
    navigate(`/hotels?${params.toString()}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)' }}>

      {/* ====== HERO SLIDER (FULL-BLEED 100VH) ====== */}
      <section
        style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {slides.map((s, i) => (
          <div key={s.id} style={{
            position: 'absolute', inset: 0,
            opacity: i === current ? 1 : 0,
            transition: 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: i === current ? 1 : 0
          }}>
            <img src={s.image} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: i === current ? 'scale(1.02)' : 'scale(1)', transition: 'transform 6s ease' }} />
            {/* Dark luxury navy overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,54,93,0.7) 10%, rgba(26,54,93,0.2) 100%)' }} />
            <div style={{ position: 'absolute', bottom: '12rem', left: '5%', right: '5%', zIndex: 2, color: 'white', maxWidth: 800 }}>
              <span className="badge badge-yellow animate-fade-in" style={{ marginBottom: '1rem', background: 'rgba(212,175,55,0.2)', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', padding: '0.4rem 1rem' }}>{s.city}</span>
              <h1 className="animate-slide-in" style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: 'clamp(2rem, 6vw, 4.5rem)', textTransform: 'none', margin: '0.5rem 0', lineHeight: 1.1 }}>
                {s.title}
              </h1>
              <p className="animate-slide-in" style={{ fontFamily: 'var(--font-body)', fontWeight: 300, color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', letterSpacing: '0.5px' }}>
                {s.desc}
              </p>
              <div className="animate-slide-in" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '1.1rem', letterSpacing: '1px' }}>Mulai {formatCurrency(s.price)}/malam</span>
                <Link to="/hotels" className="btn btn-primary" style={{ background: 'var(--color-primary)', color: '#FFFFFF' }}>Jelajahi Sanctuari</Link>
              </div>
            </div>
          </div>
        ))}

        {/* Controls */}
        <button onClick={() => setCurrent(c => (c - 1 + slides.length) % slides.length)}
          style={{ position: 'absolute', left: '2rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', padding: '0.75rem', cursor: 'pointer', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--color-text)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'white'; }}>
          <ChevronLeft size={20} />
        </button>
        <button onClick={() => setCurrent(c => (c + 1) % slides.length)}
          style={{ position: 'absolute', right: '2rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', padding: '0.75rem', cursor: 'pointer', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--color-text)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'white'; }}>
          <ChevronRight size={20} />
        </button>

        {/* Dots */}
        <div style={{ position: 'absolute', bottom: '9rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.75rem', zIndex: 10 }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{ width: i === current ? 24 : 8, height: 8, borderRadius: 4, background: i === current ? 'var(--color-primary)' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
          ))}
        </div>
      </section>

      {/* ====== FLOATING SEARCH BAR ====== */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 1.5rem', position: 'relative', marginTop: '-5rem', zIndex: 30 }}>
        <form onSubmit={handleSearch} style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', padding: '1.25rem 2rem', boxShadow: 'var(--shadow-float)', border: '1px solid var(--color-accent)' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: 200 }}>
              <label className="label" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Destinasi / Hotel</label>
              <input className="input" style={{ border: 'none', borderBottom: '1px solid var(--color-accent)', padding: '0.5rem 0', background: 'transparent', borderRadius: 0 }} placeholder="Ke mana Anda ingin pergi?" value={search.keyword} onChange={e => setSearch(s => ({ ...s, keyword: e.target.value }))} />
            </div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <label className="label" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Kota</label>
              <CitySearchSelect
                cities={cities}
                value={search.city}
                onChange={val => setSearch(s => ({ ...s, city: val }))}
                placeholder="Semua Kota"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ height: 56, flexShrink: 0, padding: '0 2.5rem', background: 'var(--color-primary)' }}>
              Discover
            </button>
          </div>
        </form>
      </div>

      {/* ====== EDITORIAL DESTINATIONS GRID ====== */}
      <div className="reveal" style={{ maxWidth: 1280, margin: '8rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 400, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>Editorial Collection</span>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', margin: '0.5rem 0 0', fontWeight: 300 }}>Koleksi Destinasi Terkurasi</h2>
          <p style={{ color: 'var(--color-muted)', fontWeight: 300, maxWidth: 500, margin: '1rem auto 0', fontSize: '0.95rem' }}>Jelajahi berbagai sudut peristirahatan terbaik di nusantara yang memadukan keindahan alam dengan kemewahan desain arsitektur modern.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {collections.map((col, index) => (
            <div key={col.name} style={{ position: 'relative', overflow: 'hidden', aspectRatio: '3/4', cursor: 'pointer', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-float)' }}
              onMouseEnter={e => {
                e.currentTarget.querySelector('img').style.transform = 'scale(1.05)';
                e.currentTarget.querySelector('.overlay').style.background = 'rgba(26,54,93,0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.querySelector('img').style.transform = 'scale(1)';
                e.currentTarget.querySelector('.overlay').style.background = 'rgba(26,54,93,0.2)';
              }}>
              <img src={col.image} alt={col.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }} />
              <div className="overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(26,54,93,0.2)', transition: 'background 0.5s ease', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '2.5rem 2rem', color: 'white' }} />
              <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem', color: 'white', zIndex: 10 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'white', fontSize: '2rem', margin: 0, fontWeight: 300 }}>{col.name}</h3>
                <span style={{ fontSize: '0.8rem', opacity: 0.8, letterSpacing: '1px', textTransform: 'uppercase' }}>{col.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ====== FEATURED SANCTUARIES ====== */}
      <div className="reveal" style={{ maxWidth: 1280, margin: '8rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 400, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>Pilihan Editor</span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', margin: '0.5rem 0 0', fontWeight: 300 }}>Sanctuari Rekomendasi</h2>
          </div>
          <Link to="/hotels" className="btn btn-white btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Lihat Semua <ArrowRight size={14} /></Link>
        </div>

        {featuredHotels.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {featuredHotels.map(hotel => <HotelCard key={hotel.id_hotel} hotel={hotel} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {slides.map(s => (
              <div key={s.id} className="card card-hover" style={{ overflow: 'hidden', border: '1px solid var(--color-accent)' }}>
                <div style={{ height: 220, overflow: 'hidden', position: 'relative' }}>
                  <img src={s.image} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                    <span className="badge badge-yellow">{s.city}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)', fontWeight: 400, fontSize: '0.85rem' }}><Star size={13} fill="var(--color-primary)" />4.8</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.4rem', margin: '0.5rem 0' }}>{s.title}</h3>
                  <p style={{ color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>{s.desc}</p>
                  <div style={{ borderTop: '1px solid var(--color-accent)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Mulai dari</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '1.1rem', color: 'var(--color-text)' }}>{formatCurrency(s.price)}<span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>/malam</span></div>
                    </div>
                    <Link to={`/hotels/${s.id}`} className="btn btn-primary btn-sm" style={{ background: 'var(--color-primary)' }}>Detail</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ====== PROMO SALE HOTELS ====== */}
      {saleHotels.length > 0 && (
        <div className="reveal" style={{ maxWidth: 1280, margin: '8rem auto 0', padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 400, color: '#C53030', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>🔥 Penawaran Eksklusif</span>
              <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', margin: '0.5rem 0 0', fontWeight: 300 }}>Sanctuari Sedang Diskon</h2>
            </div>
            <Link to="/hotels?sale=true" className="btn btn-white btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Lihat Semua <ArrowRight size={14} /></Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {saleHotels.map(hotel => <HotelCard key={hotel.id_hotel} hotel={hotel} showDiscount />)}
          </div>
        </div>
      )}

      {/* ====== EXCLUSIVE BENEFITS ====== */}
      <div className="reveal" style={{ maxWidth: 1280, margin: '10rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 400, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>Mengapa Memilih Kami</span>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', margin: '0.5rem 0 0', fontWeight: 300 }}>Layanan Terbaik Untuk Kenyamanan Anda</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2.5rem' }}>
          {[
            { emoji: '🏨', color: 'rgba(212, 175, 55, 0.1)', title: 'Koleksi Sanctuari Terpilih', desc: 'Kami mengurasi hotel butik terindah dengan penekanan pada estetika arsitektur dan fasilitas kelas atas.' },
            { emoji: '🔒', color: 'rgba(72, 187, 120, 0.1)', title: 'Reservasi Instan & Aman', desc: 'Nikmati kemudahan verifikasi pembayaran instan melalui transfer terenkripsi dan standardisasi DTO yang aman.' },
            { emoji: '⚡', color: 'rgba(66, 153, 225, 0.1)', title: 'Layanan Bantuan 24/7', desc: 'Kami hadir mendampingi seluruh proses perjalanan Anda, mulai dari check-in hingga layanan concierge khusus.' },
            { emoji: '💸', color: 'rgba(229, 62, 62, 0.1)', title: 'Harga Terbaik Terjamin', desc: 'Nikmati penawaran eksklusif khusus anggota dan diskon musiman tanpa biaya pemesanan tambahan.' },
          ].map((f, i) => (
            <div key={f.title} className="card-hover" style={{ background: 'var(--color-surface)', padding: '2.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-accent)', boxShadow: 'var(--shadow-float)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '2.5rem', width: 64, height: 64, background: f.color, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{f.emoji}</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '1.25rem', margin: '0.5rem 0 0', color: 'var(--color-text)' }}>{f.title}</h3>
              <p style={{ color: 'var(--color-muted)', fontWeight: 300, lineHeight: 1.7, fontSize: '0.875rem', margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ====== FAQ ====== */}
      <div id="faq" className="reveal" style={{ maxWidth: 800, margin: '10rem auto 0', padding: '0 1.5rem' }}>
        <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', textAlign: 'center', marginBottom: '3rem', fontWeight: 300 }}>Pertanyaan Umum</h2>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {faqs.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
        </div>
      </div>

      <div style={{ height: '8rem' }} />
    </div>
  );
};

// Reusable Hotel Card
export const HotelCard = ({ hotel, showDiscount }) => {
  const discountedPrice = showDiscount && hotel.discount_percent
    ? hotel.roomTypes?.[0]?.price_per_night * (1 - hotel.discount_percent / 100)
    : hotel.roomTypes?.[0]?.price_per_night;

  const minPrice = hotel.roomTypes?.length > 0
    ? Math.min(...hotel.roomTypes.map(r => r.price_per_night))
    : 0;

  return (
    <div className="card card-hover" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid var(--color-accent)' }}>
      <div style={{ height: 220, overflow: 'hidden', position: 'relative' }}>
        <img
          src={hotel.images?.[0]?.image_url || `https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400`}
          alt={hotel.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />
        {showDiscount && hotel.discount_percent > 0 && (
          <span className="badge badge-red" style={{ position: 'absolute', top: 15, left: 15 }}>-{hotel.discount_percent}%</span>
        )}
        {hotel.featured && <span className="badge badge-yellow" style={{ position: 'absolute', top: 15, right: 15 }}>Featured</span>}
        {hotel.roomTypes?.some(r => r.room_available <= 3) && (
          <span className="badge badge-orange" style={{ position: 'absolute', bottom: 15, left: 15, background: 'rgba(237,137,54,0.1)', color: '#DD6B20', borderColor: 'rgba(237,137,54,0.2)' }}>Terbatas!</span>
        )}
      </div>
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="badge badge-yellow" style={{ fontSize: '0.7rem' }}>{hotel.city?.name || 'Indonesia'}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)', fontWeight: 400, fontSize: '0.85rem' }}>
            <Star size={13} fill="var(--color-primary)" />{hotel.rating?.toFixed(1) || '4.5'}
          </span>
        </div>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.3rem', margin: '0.25rem 0', lineHeight: 1.3, color: 'var(--color-text)' }}>{hotel.name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-muted)', fontSize: '0.8rem', fontWeight: 300 }}>
          <MapPin size={12} />{hotel.address || hotel.city?.name}
        </div>
        <div style={{ borderTop: '1px solid var(--color-accent)', paddingTop: '1rem', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {showDiscount && hotel.discount_percent > 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textDecoration: 'line-through', fontWeight: 300 }}>{formatCurrency(minPrice)}</div>
            )}
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '1.05rem', color: 'var(--color-text)' }}>
              {formatCurrency(discountedPrice || minPrice || 0)}
              <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 300 }}>/malam</span>
            </div>
          </div>
          <Link to={`/hotels/${hotel.id_hotel}`} className="btn btn-primary btn-sm" style={{ background: 'var(--color-primary)' }}>Detail</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
