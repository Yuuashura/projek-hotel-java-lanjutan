import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { homeSlides } from './homeSlides';

const HomeHeroSlider = ({ current, setCurrent, setHovering, t }) => (
  <section style={{ position: 'relative', height: '100vh', overflow: 'hidden' }} onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
    {homeSlides.map((slide, index) => (
      <div key={slide.id} style={{ position: 'absolute', inset: 0, opacity: index === current ? 1 : 0, transition: 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1)', zIndex: index === current ? 1 : 0 }}>
        <img src={slide.image} alt={slide.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: index === current ? 'scale(1.02)' : 'scale(1)', transition: 'transform 6s ease' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(7,22,38,0.74) 0%, rgba(7,22,38,0.48) 42%, rgba(7,22,38,0.16) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7,22,38,0.74) 0%, rgba(7,22,38,0.2) 58%, rgba(7,22,38,0.34) 100%)' }} />
        <div className="home-hero-copy" style={{ position: 'absolute', bottom: '12rem', left: '5%', right: '5%', zIndex: 2, color: '#FFFFFF', maxWidth: 800, textShadow: '0 3px 18px rgba(0,0,0,0.38)' }}>
          <span className="badge badge-yellow animate-fade-in" style={{ marginBottom: '1rem', background: 'rgba(246,211,101,0.95)', border: '1px solid rgba(246,211,101,0.95)', color: '#15314F', padding: '0.4rem 1rem', textShadow: 'none' }}>{slide.city}</span>
          <h1 className="home-hero-title animate-slide-in" style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: 'clamp(2rem, 6vw, 4.5rem)', textTransform: 'none', margin: '0.5rem 0', lineHeight: 1.05, color: '#FFFFFF', textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>{slide.title}</h1>
          <p className="home-hero-description animate-slide-in" style={{ fontFamily: 'var(--font-body)', fontWeight: 400, color: 'rgba(255,255,255,0.94)', marginBottom: '2rem', fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', letterSpacing: '0.5px', maxWidth: 720 }}>{slide.desc}</p>
          <div className="home-hero-actions animate-slide-in" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="home-hero-price" style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '1.1rem', letterSpacing: '1px', color: '#FFFFFF' }}>{t('home.heroPrice', { price: formatCurrency(slide.price) })}</span>
            <Link to="/hotels" className="btn btn-primary" style={{ background: 'var(--color-primary)', color: '#FFFFFF' }}>{t('home.heroCta')}</Link>
          </div>
        </div>
      </div>
    ))}

    {[
      { side: 'left', Icon: ChevronLeft, onClick: () => setCurrent(currentIndex => (currentIndex - 1 + homeSlides.length) % homeSlides.length) },
      { side: 'right', Icon: ChevronRight, onClick: () => setCurrent(currentIndex => (currentIndex + 1) % homeSlides.length) },
    ].map(({ side, Icon, onClick }) => (
      <button key={side} onClick={onClick} style={{ position: 'absolute', [side]: '2rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', padding: '0.75rem', cursor: 'pointer', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }} onMouseEnter={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--color-text)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'white'; }}>
        <Icon size={20} />
      </button>
    ))}

    <div style={{ position: 'absolute', bottom: '9rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.75rem', zIndex: 10 }}>
      {homeSlides.map((_, index) => (
        <button key={index} onClick={() => setCurrent(index)} style={{ width: index === current ? 24 : 8, height: 8, borderRadius: 4, background: index === current ? 'var(--color-primary)' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
      ))}
    </div>
  </section>
);

export default HomeHeroSlider;
