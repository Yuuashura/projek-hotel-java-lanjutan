import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, Star, MapPin, ArrowRight, ChevronDown } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import api from '../../utils/api';

// FAQ Data
const faqs = [
  { q: 'Bagaimana cara memesan hotel di NgiNep?', a: 'Cari hotel yang Anda inginkan menggunakan fitur pencarian, pilih tipe kamar, isi data pemesan, lalu klik "Pesan Sekarang". Anda akan diarahkan ke halaman pembayaran.' },
  { q: 'Metode pembayaran apa saja yang tersedia?', a: 'Saat ini kami mendukung Transfer Bank BCA, Transfer Bank BRI, Transfer Bank BNI, dan QRIS. Upload bukti transfer Anda untuk dikonfirmasi oleh admin hotel.' },
  { q: 'Apakah saya bisa membatalkan pemesanan?', a: 'Pembatalan dapat dilakukan selama status pesanan masih PENDING (belum dikonfirmasi admin). Pesanan yang sudah CONFIRMED tidak dapat dibatalkan secara mandiri.' },
  { q: 'Berapa lama verifikasi pembayaran?', a: 'Verifikasi dilakukan oleh Admin Hotel dalam waktu 1x24 jam setelah bukti pembayaran diunggah. Anda akan mendapat notifikasi perubahan status pesanan.' },
  { q: 'Apakah data pribadi saya aman?', a: 'Ya! Kami menggunakan JWT Token terenkripsi, BCrypt untuk password, dan pola DTO untuk menjaga data Anda tetap aman dan tidak bocor.' },
];

// Slide Banner Data
const slides = [
  { id: 1, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1600&h=600', title: 'Neo Brutalism Palace', city: 'Bandung', desc: 'Pengalaman menginap premium di jantung Kota Kembang', price: 650000 },
  { id: 2, image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=1600&h=600', title: 'Retro Modern Resort', city: 'Bali', desc: 'Resort tepi pantai dengan kolam renang infinity yang memukau', price: 1200000 },
  { id: 3, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=1600&h=600', title: 'The Angular Inn', city: 'Jakarta', desc: 'Hotel bisnis modern di pusat ibu kota dengan fasilitas lengkap', price: 450000 },
];

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '3px solid var(--neo-dark)', marginBottom: '0.75rem', background: 'white', boxShadow: open ? 'var(--neo-shadow)' : 'none', transition: 'all 0.15s ease' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', background: open ? 'var(--neo-yellow)' : 'white', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: open ? '3px solid var(--neo-dark)' : 'none', transition: 'background 0.15s' }}>
        <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.95rem' }}>{q}</span>
        <ChevronDown size={18} style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
      </button>
      {open && <div style={{ padding: '1rem 1.25rem', color: '#374151', fontWeight: 500, lineHeight: 1.6, fontSize: '0.9rem' }}>{a}</div>}
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
      timerRef.current = setInterval(() => setCurrent(c => (c + 1) % slides.length), 3500);
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
    <div style={{ minHeight: '100vh' }}>

      {/* ====== HERO SLIDER ====== */}
      <section
        style={{ position: 'relative', height: 500, overflow: 'hidden', borderBottom: '4px solid var(--neo-dark)' }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {slides.map((s, i) => (
          <div key={s.id} style={{
            position: 'absolute', inset: 0,
            opacity: i === current ? 1 : 0,
            transition: 'opacity 0.7s ease',
            zIndex: i === current ? 1 : 0
          }}>
            <img src={s.image} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.75) 40%, rgba(0,0,0,0.15))' }} />
            <div style={{ position: 'absolute', bottom: '4rem', left: '3rem', zIndex: 2, color: 'white', maxWidth: 500 }}>
              <span className="badge badge-yellow" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>{s.city}</span>
              <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', textTransform: 'uppercase', margin: '0.5rem 0', lineHeight: 1.1 }}>{s.title}</h1>
              <p style={{ fontWeight: 500, color: 'rgba(255,255,255,0.8)', marginBottom: '1rem' }}>{s.desc}</p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1.2rem' }}>Mulai {formatCurrency(s.price)}/malam</span>
                <Link to="/hotels" className="btn btn-primary btn-sm">Lihat Hotel <ArrowRight size={14} /></Link>
              </div>
            </div>
          </div>
        ))}

        {/* Arrows */}
        <button onClick={() => setCurrent(c => (c - 1 + slides.length) % slides.length)}
          style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'white', border: '3px solid var(--neo-dark)', padding: '0.5rem', cursor: 'pointer', boxShadow: 'var(--neo-shadow)' }}>
          <ChevronLeft size={22} />
        </button>
        <button onClick={() => setCurrent(c => (c + 1) % slides.length)}
          style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'white', border: '3px solid var(--neo-dark)', padding: '0.5rem', cursor: 'pointer', boxShadow: 'var(--neo-shadow)' }}>
          <ChevronRight size={22} />
        </button>

        {/* Dots */}
        <div style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{ width: i === current ? 32 : 12, height: 12, background: i === current ? 'var(--neo-yellow)' : 'rgba(255,255,255,0.5)', border: '2px solid white', cursor: 'pointer', transition: 'all 0.3s' }} />
          ))}
        </div>
      </section>

      {/* ====== SEARCH BAR ====== */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
        <form onSubmit={handleSearch} style={{ background: 'white', border: '4px solid var(--neo-dark)', padding: '1.5rem', marginTop: '-2.5rem', position: 'relative', zIndex: 10, boxShadow: 'var(--neo-shadow-lg)' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: 180 }}>
              <label className="label">🔍 Nama Hotel / Kata Kunci</label>
              <input className="input" placeholder="Cari hotel, fasilitas..." value={search.keyword} onChange={e => setSearch(s => ({ ...s, keyword: e.target.value }))} />
            </div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <label className="label">📍 Kota Tujuan</label>
              <select className="input" value={search.city} onChange={e => setSearch(s => ({ ...s, city: e.target.value }))}>
                <option value="">Semua Kota</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-orange btn-lg" style={{ flexShrink: 0 }}>
              <Search size={18} /> Cari Hotel
            </button>
          </div>
        </form>
      </div>

      {/* ====== FEATURED HOTELS ====== */}
      <div style={{ maxWidth: 1280, margin: '4rem auto 0', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontFamily: 'Space Grotesk', fontWeight: 900, color: 'var(--neo-orange)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem' }}>Pilihan Editor</span>
            <h2 className="section-title" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', margin: '0.25rem 0 0' }}>Hotel Rekomendasi Terbaik</h2>
          </div>
          <Link to="/hotels" className="btn btn-white btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Lihat Semua <ArrowRight size={14} /></Link>
        </div>

        {featuredHotels.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {featuredHotels.map(hotel => <HotelCard key={hotel.id_hotel} hotel={hotel} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {slides.map(s => (
              <div key={s.id} className="card card-hover" style={{ overflow: 'hidden' }}>
                <div style={{ height: 180, overflow: 'hidden', borderBottom: '3px solid var(--neo-dark)' }}>
                  <img src={s.image} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="badge badge-yellow">{s.city}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--neo-orange)', fontWeight: 700, fontSize: '0.875rem' }}><Star size={14} fill="var(--neo-orange)" />4.8</span>
                  </div>
                  <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1.1rem', textTransform: 'uppercase', margin: '0.5rem 0' }}>{s.title}</h3>
                  <p style={{ color: '#6b7280', fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1rem' }}>{s.desc}</p>
                  <div style={{ borderTop: '2px dashed #e5e7eb', paddingTop: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600 }}>Mulai dari</div>
                      <div style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1.1rem' }}>{formatCurrency(s.price)}<span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#9ca3af' }}>/malam</span></div>
                    </div>
                    <Link to={`/hotels/${s.id}`} className="btn btn-primary btn-sm">Detail</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ====== PROMO SALE HOTELS ====== */}
      {saleHotels.length > 0 && (
        <div style={{ maxWidth: 1280, margin: '4rem auto 0', padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
              <span style={{ fontFamily: 'Space Grotesk', fontWeight: 900, color: 'var(--neo-pink)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem' }}>🔥 Terbatas!</span>
              <h2 className="section-title" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', margin: '0.25rem 0 0' }}>Hotel Sedang Diskon</h2>
            </div>
            <Link to="/hotels?sale=true" className="btn btn-white btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Lihat Semua <ArrowRight size={14} /></Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {saleHotels.map(hotel => <HotelCard key={hotel.id_hotel} hotel={hotel} showDiscount />)}
          </div>
        </div>
      )}

      {/* ====== FEATURES ====== */}
      <div style={{ maxWidth: 1280, margin: '5rem auto 0', padding: '0 1.5rem' }}>
        <h2 className="section-title" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', textAlign: 'center', marginBottom: '3rem' }}>
          Kenapa Harus <span style={{ background: 'var(--neo-blue)', border: '3px solid var(--neo-dark)', padding: '2px 10px', boxShadow: 'var(--neo-shadow-sm)', display: 'inline-block', transform: 'rotate(-1deg)' }}>NgiNep?</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {[
            { emoji: '🏨', color: 'var(--neo-purple)', title: 'Pilihan Hotel Terbaik', desc: 'Menyediakan beragam pilihan kamar dari hotel butik yang estetik hingga resort mewah bintang lima di destinasi favorit Anda.' },
            { emoji: '🔒', color: 'var(--neo-green)', title: 'Transaksi Aman & Mudah', desc: 'Sistem enkripsi modern menjamin privasi Anda, didukung pilihan pembayaran transfer bank & QRIS yang mudah dan terpercaya.' },
            { emoji: '⚡', color: 'var(--neo-yellow)', title: 'Konfirmasi Instan', desc: 'Proses verifikasi pembayaran yang cepat oleh pihak hotel memastikan voucher menginap Anda segera terbit tanpa repot.' },
            { emoji: '💸', color: 'var(--neo-orange)', title: 'Promo Diskon Eksklusif', desc: 'Nikmati potongan harga spesial hingga penawaran menit-menit terakhir (last-minute deals) setiap harinya.' },
          ].map(f => (
            <div key={f.title} className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '2rem' }}>{f.emoji}</div>
              <div style={{ width: 40, height: 4, background: f.color, border: '2px solid var(--neo-dark)' }} />
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, textTransform: 'uppercase', fontSize: '1rem', margin: 0 }}>{f.title}</h3>
              <p style={{ color: '#6b7280', fontWeight: 500, lineHeight: 1.6, fontSize: '0.875rem', margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ====== FAQ ====== */}
      <div id="faq" style={{ maxWidth: 800, margin: '5rem auto 0', padding: '0 1.5rem' }}>
        <h2 className="section-title" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', textAlign: 'center', marginBottom: '2.5rem' }}>Pertanyaan yang Sering Diajukan</h2>
        {faqs.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
      </div>

      <div style={{ height: '4rem' }} />
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
    <div className="card card-hover" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 180, overflow: 'hidden', borderBottom: '3px solid var(--neo-dark)', position: 'relative' }}>
        <img
          src={hotel.images?.[0]?.image_url || `https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400`}
          alt={hotel.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />
        {showDiscount && hotel.discount_percent > 0 && (
          <span className="badge badge-red" style={{ position: 'absolute', top: 10, left: 10 }}>-{hotel.discount_percent}%</span>
        )}
        {hotel.featured && <span className="badge badge-yellow" style={{ position: 'absolute', top: 10, right: 10 }}>Featured</span>}
        {hotel.roomTypes?.some(r => r.room_available <= 3) && (
          <span className="badge badge-orange" style={{ position: 'absolute', bottom: 10, left: 10 }}>Terbatas!</span>
        )}
      </div>
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="badge badge-yellow" style={{ fontSize: '0.7rem' }}>{hotel.city?.name || 'Indonesia'}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--neo-orange)', fontWeight: 700, fontSize: '0.85rem' }}>
            <Star size={13} fill="var(--neo-orange)" />{hotel.rating?.toFixed(1) || '4.5'}
          </span>
        </div>
        <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1rem', textTransform: 'uppercase', margin: 0, lineHeight: 1.3 }}>{hotel.name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#9ca3af', fontSize: '0.8rem', fontWeight: 500 }}>
          <MapPin size={12} />{hotel.address || hotel.city?.name}
        </div>
        <div style={{ borderTop: '2px dashed #e5e7eb', paddingTop: '0.875rem', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {showDiscount && hotel.discount_percent > 0 && (
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', textDecoration: 'line-through', fontWeight: 500 }}>{formatCurrency(minPrice)}</div>
            )}
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1rem' }}>
              {formatCurrency(discountedPrice || minPrice || 0)}
              <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 500 }}>/malam</span>
            </div>
          </div>
          <Link to={`/hotels/${hotel.id_hotel}`} className="btn btn-primary btn-sm">Detail</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
