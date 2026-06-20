import { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, MapPin, ArrowRight, ChevronDown } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import api from '../../utils/api';
import CitySearchSelect from '../../components/CitySearchSelect';
import LoadingState from '../../components/LoadingState';
import { usePreferences } from '../../context/PreferencesContext';
import { getImageUrl } from '../../utils/uploads';

// Slide Banner Data (Luxury resorts photography)
const slides = [
{ id: 1, image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1600&h=1000', title: 'Aman Sanctuary Villa', city: 'Bali', desc: 'Sebuah peristirahatan privat berdesain minimalis mewah di tebing laut Uluwatu', price: 1850000 },
{ id: 2, image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=1600&h=1000', title: 'Coastal Serenity Resort', city: 'Lombok', desc: 'Paduan keindahan samudera biru dengan kemewahan fasilitas bintang lima privat', price: 2400000 },
{ id: 3, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1600&h=1000', title: 'The Heritage Pavilion', city: 'Yogyakarta', desc: 'Ketenteraman arsitektur klasik Jawa berbalut layanan berstandar internasional modern', price: 1200000 }];


const FEATURED_LIMIT = 30;
const SALE_LIMIT = 10;

const getHotelMinPrice = (hotel) => {
  if (hotel.min_price != null) return hotel.min_price;
  if (hotel.minPrice != null) return hotel.minPrice;

  const roomPrices = (hotel.roomTypes || []).
  map((room) => room.price_per_night ?? room.pricePerNight ?? 0).
  filter((price) => price > 0);

  return roomPrices.length > 0 ? Math.min(...roomPrices) : 0;
};



const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="[border-bottom:1px_solid_var(--color-accent)] [background:transparent] [transition:all_0.3s_ease]">
      <button onClick={() => setOpen(!open)} className="[width:100%] [display:flex] [justify-content:space-between] [align-items:center] [padding:1.5rem_0] [background:transparent] [border:none] [cursor:pointer] [text-align:left]">
        <span className="[font-family:var(--font-body)] [font-weight:400] [font-size:1rem] [color:var(--color-text)]">{q}</span>
        <ChevronDown size={18} className={cn('shrink-0 text-[var(--color-muted)] transition-transform duration-300', open && 'rotate-180')} />
      </button>
      <div className={cn('overflow-hidden transition-[max-height] duration-300 ease-out', open ? 'max-h-[200px]' : 'max-h-0')}>
        <p className="[padding-bottom:1.5rem] [color:var(--color-muted)] [font-weight:300] [line-height:1.7] [font-size:0.9rem]">{a}</p>
      </div>
    </div>);

};

const Home = () => {
  const { t } = usePreferences();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [cities, setCities] = useState([]);
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [saleHotels, setSaleHotels] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [search, setSearch] = useState({ city: '', keyword: '' });
  const timerRef = useRef(null);

  // Auto-play slider
  useEffect(() => {
    if (!hovering) {
      timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    }
    return () => clearInterval(timerRef.current);
  }, [hovering]);

  // Fetch initial data
  useEffect(() => {
    const controller = new AbortController();

    api.get('/api/cities', { signal: controller.signal }).
    then((r) => setCities(r.data.data || [])).
    catch(() => {});

    api.get('/api/hotels', {
      params: { page: 0, size: FEATURED_LIMIT, sortBy: 'rating' },
      signal: controller.signal
    }).
    then((r) => {
      const list = r.data.data || [];
      setFeaturedHotels(list.filter((h) => !h.onSale && !h.on_sale && !h.discountPercent && !h.discount_percent).slice(0, 10));
    }).
    catch(() => setFeaturedHotels([])).
    finally(() => setFeaturedLoading(false));

    api.get('/api/hotels', {
      params: { onSale: true, page: 0, size: SALE_LIMIT, sortBy: 'rating' },
      signal: controller.signal
    }).
    then((r) => setSaleHotels(r.data.data || [])).
    catch(() => {});

    return () => controller.abort();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.keyword) params.set('keyword', search.keyword);
    if (search.city) params.set('cityId', search.city);
    navigate(`/hotels?${params.toString()}`);
  };

  return (
    <div className="[min-height:100vh]">

      {/* ====== HERO SLIDER (FULL-BLEED 100VH) ====== */}
      <section

        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)} className="[position:relative] [height:100vh] [overflow:hidden]">

        {slides.map((s, i) =>
        <div key={s.id} className={cn('absolute inset-0 transition-opacity duration-1000 ease-out', i === current ? 'z-[1] opacity-100' : 'z-0 opacity-0')}>
            <img src={s.image} alt={s.title} className={cn('h-full w-full object-cover transition-transform duration-[6000ms]', i === current ? 'scale-[1.02]' : 'scale-100')} />
            {/* Dark luxury navy overlay */}
            <div className="[position:absolute] [inset:0] [background:linear-gradient(90deg,_rgba(7,22,38,0.74)_0%,_rgba(7,22,38,0.48)_42%,_rgba(7,22,38,0.16)_100%)]" />
            <div className="[position:absolute] [inset:0] [background:linear-gradient(to_top,_rgba(7,22,38,0.74)_0%,_rgba(7,22,38,0.2)_58%,_rgba(7,22,38,0.34)_100%)]" />
            <div className="absolute bottom-48 left-[5%] right-[5%] z-[2] flex max-w-[820px] flex-col items-start gap-3.5 text-white max-sm:bottom-[8.5rem] max-sm:gap-3">
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-accent)] bg-[var(--color-background)] px-3 py-1 text-[0.7rem] font-medium uppercase text-[var(--color-text)] max-sm:px-2.5 max-sm:py-1 max-sm:text-[0.64rem] border-[var(--color-primary-soft)] bg-[var(--color-primary-soft)] text-[var(--color-primary)] animate-[fadeIn_1s_cubic-bezier(0.16,1,0.3,1)_forwards] [margin-bottom:1rem] [background:rgba(246,211,101,0.95)] [border:1px_solid_rgba(246,211,101,0.95)] [color:#15314F] [padding:0.4rem_1rem] [text-shadow:none]">{s.city}</span>
              <h1 className="m-0 animate-[fadeInUp_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards] font-[var(--font-heading)] text-[clamp(2.4rem,5.2vw,4rem)] font-extrabold leading-[1.04] text-white [text-shadow:0_16px_42px_rgba(0,0,0,0.42)] max-sm:text-[clamp(2rem,12vw,3.2rem)]">
                {s.title}
              </h1>
              <p className="mb-3 max-w-[700px] animate-[fadeInUp_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards] text-[clamp(1rem,1.5vw,1.25rem)] font-normal leading-relaxed text-white/95 [text-shadow:0_8px_24px_rgba(0,0,0,0.34)] max-sm:text-[0.98rem]">
                {s.desc}
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 animate-[fadeInUp_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards] max-sm:w-full max-sm:gap-3 max-sm:[&_a]:w-full max-sm:[&_a]:max-w-[260px]">
                <span className="text-[1.1rem] font-medium leading-snug text-white [text-shadow:0_8px_24px_rgba(0,0,0,0.36)]">{t('home.heroPrice', { price: formatCurrency(s.price) })}</span>
                <Link to="/hotels" className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[color-mix(in_srgb,var(--color-primary)_46%,transparent)] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))] text-[#061426] hover:brightness-105 [background:var(--color-primary)] [color:#FFFFFF]">{t('home.heroCta')}</Link>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <button onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)}

        className="absolute left-8 top-1/2 z-10 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-transparent p-3 text-white transition hover:bg-white hover:text-[var(--color-text)]">
          <ChevronLeft size={20} />
        </button>
        <button onClick={() => setCurrent((c) => (c + 1) % slides.length)}

        className="absolute right-8 top-1/2 z-10 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-transparent p-3 text-white transition hover:bg-white hover:text-[var(--color-text)]">
          <ChevronRight size={20} />
        </button>

        {/* Dots */}
        <div className="[position:absolute] [bottom:9rem] [left:50%] [transform:translateX(-50%)] [display:flex] [gap:0.75rem] [z-index:10]">
          {slides.map((_, i) =>
          <button key={i} onClick={() => setCurrent(i)} className={cn('h-2 cursor-pointer rounded border-0 transition-all duration-300', i === current ? 'w-6 bg-[var(--color-primary)]' : 'w-2 bg-white/40')} />
          )}
        </div>
      </section>

      {/* ====== FLOATING SEARCH BAR ====== */}
      <div className="[max-width:1000px] [margin:0_auto] [padding:0_1.5rem] [position:relative] [margin-top:-5rem] [z-index:30]">
        <form onSubmit={handleSearch} className="[background:var(--color-surface-solid)] [border-radius:var(--radius-sm)] [padding:1.25rem_2rem] [box-shadow:var(--shadow-float)] [border:1px_solid_var(--color-accent)]">
          <div className="[display:flex] [gap:1.5rem] [align-items:center] [flex-wrap:wrap]">
            <div className="[flex:2] [min-width:200px]">
              <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem] [font-size:0.7rem] [letter-spacing:1px] [color:var(--color-text)] [font-weight:500]">{t('home.searchDestination')}</label>
              <input className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-3 text-[0.95rem] font-normal text-[var(--color-text)] outline-none backdrop-blur-xl transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-11 max-sm:px-3.5 max-sm:py-3 max-sm:text-sm [border:none] [border-bottom:1px_solid_var(--color-accent)] [padding:0.5rem_0] [background:transparent] [border-radius:0] [color:var(--color-text)] [font-weight:400]" placeholder={t('home.searchPlaceholder')} value={search.keyword} onChange={(e) => setSearch((s) => ({ ...s, keyword: e.target.value }))} />
            </div>
            <div className="[flex:1] [min-width:150px]">
              <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-muted)] max-sm:text-[0.68rem] [font-size:0.7rem] [letter-spacing:1px] [color:var(--color-text)] [font-weight:500]">{t('common.city')}</label>
              <CitySearchSelect
                cities={cities}
                value={search.city}
                onChange={(val) => setSearch((s) => ({ ...s, city: val }))}
                placeholder={t('home.allCities')} />

            </div>
            <button type="submit" className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[color-mix(in_srgb,var(--color-primary)_46%,transparent)] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))] text-[#061426] hover:brightness-105 min-h-12 px-10 py-4 text-base [height:56px] [flex-shrink:0] [padding:0_2.5rem] [background:var(--color-primary)]">
              {t('home.discover')}
            </button>
          </div>
        </form>
      </div>

      {/* ====== FEATURED SANCTUARIES ====== */}
      <div className="reveal [max-width:1280px] [margin:8rem_auto_0] [padding:0_1.5rem]">
        <div className="[display:flex] [justify-content:space-between] [align-items:flex-end] [margin-bottom:3rem] [flex-wrap:wrap] [gap:1.5rem]">
          <div>
            <span className="[font-family:var(--font-body)] [font-weight:400] [color:var(--color-primary)] [text-transform:uppercase] [letter-spacing:2px] [font-size:0.8rem]">{t('home.editorPick')}</span>
            <h2 className="[font-size:clamp(2rem,_3.5vw,_2.8rem)] [margin:0.5rem_0_0] [font-weight:300]">{t('home.featuredTitle')}</h2>
          </div>
          <Link to="/hotels" className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--color-text)] backdrop-blur-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-background)] min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem] [display:flex] [align-items:center] [gap:0.5rem]">{t('home.viewAll')} <ArrowRight size={14} /></Link>
        </div>

        {featuredLoading ?
        <LoadingState text={t('common.loadingHotel')} /> :
        featuredHotels.length > 0 ?
        <div className="grid auto-cols-[minmax(292px,360px)] grid-flow-col gap-5 overflow-x-auto overflow-y-hidden px-0.5 pb-5 pt-1 [scroll-snap-type:x_proximity] max-sm:auto-cols-[minmax(260px,82vw)] max-sm:gap-3.5" aria-label={t('home.featuredTitle')}>
            {featuredHotels.map((hotel) => <HotelCard key={hotel.id_hotel} hotel={hotel} className="h-full min-w-0 [scroll-snap-align:start]" />)}
          </div> :

        <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--color-text)] shadow-[var(--shadow-float)] backdrop-blur-xl transition-all duration-300 [padding:3rem_2rem] [text-align:center]">
            <h3 className="[margin:0] [font-size:1.35rem] [color:var(--color-text)]">{t('hotels.emptyTitle')}</h3>
            <p className="[margin:0.75rem_auto_0] [max-width:520px] [color:var(--color-muted)] [font-weight:400] [line-height:1.6]">{t('hotels.emptyText')}</p>
          </div>
        }
      </div>

      {/* ====== PROMO SALE HOTELS ====== */}
      {saleHotels.length > 0 &&
      <div className="reveal [max-width:1280px] [margin:8rem_auto_0] [padding:0_1.5rem]">
          <div className="[display:flex] [justify-content:space-between] [align-items:flex-end] [margin-bottom:3rem]">
            <div>
              <span className="[font-family:var(--font-body)] [font-weight:400] [color:#C53030] [text-transform:uppercase] [letter-spacing:2px] [font-size:0.8rem]">{t('home.saleEyebrow')}</span>
              <h2 className="[font-size:clamp(2rem,_3.5vw,_2.8rem)] [margin:0.5rem_0_0] [font-weight:300]">{t('home.saleTitle')}</h2>
            </div>
            <Link to="/hotels?sale=true" className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--color-text)] backdrop-blur-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-background)] min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem] [display:flex] [align-items:center] [gap:0.5rem]">{t('home.viewAll')} <ArrowRight size={14} /></Link>
          </div>
          <div className="grid auto-cols-[minmax(292px,360px)] grid-flow-col gap-5 overflow-x-auto overflow-y-hidden px-0.5 pb-5 pt-1 [scroll-snap-type:x_proximity] max-sm:auto-cols-[minmax(260px,82vw)] max-sm:gap-3.5" aria-label={t('home.saleTitle')}>
            {saleHotels.map((hotel) => <HotelCard key={hotel.id_hotel} hotel={hotel} className="h-full min-w-0 [scroll-snap-align:start]" />)}
          </div>
        </div>
      }

      {/* ====== EXCLUSIVE BENEFITS ====== */}
      <div className="reveal [max-width:1280px] [margin:10rem_auto_0] [padding:0_1.5rem]">
        <div className="[text-align:center] [margin-bottom:5rem]">
          <span className="[font-family:var(--font-body)] [font-weight:400] [color:var(--color-primary)] [text-transform:uppercase] [letter-spacing:2px] [font-size:0.8rem]">{t('home.whyEyebrow')}</span>
          <h2 className="[font-size:clamp(2rem,_4vw,_3rem)] [margin:0.5rem_0_0] [font-weight:300]">{t('home.whyTitle')}</h2>
        </div>
        <div className="[display:grid] [grid-template-columns:repeat(auto-fit,_minmax(260px,_1fr))] [gap:2.5rem]">
          {t('home.benefits').map((f, index) =>
          <div key={f.title} className="hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-hover)] [background:var(--color-surface)] [padding:2.5rem] [border-radius:var(--radius-sm)] [border:1px_solid_var(--color-accent)] [box-shadow:var(--shadow-float)] [display:flex] [flex-direction:column] [gap:1rem]">
              <div className={cn('flex size-16 items-center justify-center rounded-full text-[2.5rem]', ['bg-amber-400/10', 'bg-blue-500/10', 'bg-emerald-500/10'][index % 3])}>{f.emoji}</div>
              <h3 className="[font-family:var(--font-heading)] [font-weight:400] [font-size:1.25rem] [margin:0.5rem_0_0] [color:var(--color-text)]">{f.title}</h3>
              <p className="[color:var(--color-muted)] [font-weight:300] [line-height:1.7] [font-size:0.875rem] [margin:0]">{f.desc}</p>
            </div>
          )}
        </div>
      </div>

      {/* ====== FAQ ====== */}
      <div id="faq" className="reveal [max-width:800px] [margin:10rem_auto_0] [padding:0_1.5rem]">
        <h2 className="[font-size:clamp(2rem,_3.5vw,_2.8rem)] [text-align:center] [margin-bottom:3rem] [font-weight:300]">{t('home.faqTitle')}</h2>
        <div className="[display:flex] [flex-direction:column]">
          {t('home.faqs').map((f) => <FAQItem key={f.q} q={f.q} a={f.a} />)}
        </div>
      </div>

      <div className="[height:8rem]" />
    </div>);

};

// Reusable Hotel Card
export const HotelCard = ({ hotel, className = '' }) => {
  const { t } = usePreferences();
  const minPrice = getHotelMinPrice(hotel);

  const discountPercent = hotel.discount_percent || hotel.discountPercent || 0;
  const hasDiscount = (hotel.onSale || hotel.on_sale) && discountPercent > 0;

  const discountedPrice = hasDiscount ?
  minPrice * (1 - discountPercent / 100) :
  minPrice;

  return (
    <div className={cn(`rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--color-text)] shadow-[var(--shadow-float)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-hover)] ${className}`, "[overflow:hidden] [display:flex] [flex-direction:column] [border:1px_solid_var(--color-accent)]")}>
      <div className="[height:220px] [overflow:hidden] [position:relative]">
        <img
          src={getImageUrl(hotel.images?.[0]?.image_url, `https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400`)}
          alt={hotel.name}
          loading="lazy"
          decoding="async"

          className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-105" />

        {hasDiscount &&
        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-accent)] bg-[var(--color-background)] px-3 py-1 text-[0.7rem] font-medium uppercase text-[var(--color-text)] max-sm:px-2.5 max-sm:py-1 max-sm:text-[0.64rem] border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger)] [position:absolute] [top:15px] [left:15px] [background:#C53030] [color:white]">-{discountPercent}%</span>
        }
        {hotel.featured && <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-accent)] bg-[var(--color-background)] px-3 py-1 text-[0.7rem] font-medium uppercase text-[var(--color-text)] max-sm:px-2.5 max-sm:py-1 max-sm:text-[0.64rem] border-[var(--color-primary-soft)] bg-[var(--color-primary-soft)] text-[var(--color-primary)] [position:absolute] [top:15px] [right:15px]">{t('common.featured')}</span>}
        {hotel.roomTypes?.some((r) => (r.room_available ?? r.roomAvailable) <= 3) &&
        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-accent)] bg-[var(--color-background)] px-3 py-1 text-[0.7rem] font-medium uppercase text-[var(--color-text)] max-sm:px-2.5 max-sm:py-1 max-sm:text-[0.64rem] border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] text-[var(--color-warning)] [position:absolute] [bottom:15px] [left:15px] [background:rgba(237,137,54,0.1)] [color:#DD6B20] [border-color:rgba(237,137,54,0.2)]">{t('home.limited')}</span>
        }
      </div>
      <div className="[padding:1.5rem] [display:flex] [flex-direction:column] [gap:0.5rem] [flex:1]">
        <div className="[display:flex] [justify-content:space-between] [align-items:center]">
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-accent)] bg-[var(--color-background)] px-3 py-1 text-[0.7rem] font-medium uppercase text-[var(--color-text)] max-sm:px-2.5 max-sm:py-1 max-sm:text-[0.64rem] border-[var(--color-primary-soft)] bg-[var(--color-primary-soft)] text-[var(--color-primary)] [font-size:0.7rem]">{hotel.city?.name || 'Indonesia'}</span>
          <span className="[display:flex] [align-items:center] [gap:0.25rem] [color:var(--color-primary)] [font-weight:400] [font-size:0.85rem]">
            <Star size={13} fill="var(--color-primary)" />{hotel.rating?.toFixed(1) || '4.5'}
          </span>
        </div>
        <h3 className="[font-family:var(--font-heading)] [font-weight:300] [font-size:1.3rem] [margin:0.25rem_0] [line-height:1.3] [color:var(--color-text)]">{hotel.name}</h3>
        <div className="[display:flex] [align-items:center] [gap:0.25rem] [color:var(--color-muted)] [font-size:0.8rem] [font-weight:300]">
          <MapPin size={12} />{hotel.address || hotel.city?.name}
        </div>
        <div className="[border-top:1px_solid_var(--color-accent)] [padding-top:1rem] [margin-top:auto] [display:flex] [justify-content:space-between] [align-items:center]">
          <div>
            {hasDiscount &&
            <div className="[font-size:0.75rem] [color:var(--color-muted)] [text-decoration:line-through] [font-weight:300]">{formatCurrency(minPrice)}</div>
            }
            <div className={cn('font-[var(--font-body)] text-[1.05rem] font-normal', hasDiscount ? 'text-[#C53030]' : 'text-[var(--color-text)]')}>
              {formatCurrency(discountedPrice || minPrice || 0)}
              <span className="[font-size:0.75rem] [color:var(--color-muted)] [font-weight:300]">{t('home.perNight')}</span>
            </div>
          </div>
          <Link to={`/hotels/${hotel.id_hotel}`} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[color-mix(in_srgb,var(--color-primary)_46%,transparent)] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))] text-[#061426] hover:brightness-105 min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem] [background:var(--color-primary)]">{t('common.details')}</Link>
        </div>
      </div>
    </div>);

};

export default Home;
