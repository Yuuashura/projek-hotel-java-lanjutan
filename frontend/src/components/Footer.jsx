import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Heart, Globe, MessageCircle, Share2 } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';

const Footer = () => {
  const { t } = usePreferences();

  const services = [
    { text: t('nav.home'), to: '/' },
    { text: t('footer.searchHotels'), to: '/hotels' },
    { text: t('footer.deals'), to: '/hotels?sale=true' },
    { text: t('nav.myBookings'), to: '/my-bookings' },
    { text: t('nav.profile'), to: '/profile' },
  ];

  const company = [
    { text: t('nav.about'), to: '/about' },
    { text: t('footer.terms'), to: '#' },
    { text: t('footer.privacy'), to: '#' },
    { text: t('footer.careers'), to: '#' },
    { text: 'Blog', to: '#' },
  ];

  return (
    <footer style={{ background: 'linear-gradient(135deg, #081827, #102A43)', color: '#F9FAFB', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '6rem', fontFamily: 'var(--font-body)', fontWeight: 300 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '4rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '3rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: '#FFFFFF', letterSpacing: '1px', marginBottom: '1.25rem' }}>
            NgiNep<span style={{ color: 'var(--color-gold)' }}>.</span>
          </div>
          <p style={{ color: '#9CA3AF', lineHeight: 1.7, fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            {t('footer.description')}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {[Globe, MessageCircle, Share2].map((Icon, i) => (
              <button
                key={i}
                type="button"
                style={{ background: 'transparent', border: '1px solid #374151', width: 36, height: 36, cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', borderRadius: '50%' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-gold)'; e.currentTarget.style.color = '#FFFFFF'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#374151'; e.currentTarget.style.color = '#9CA3AF'; }}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>

        <FooterLinks title={t('footer.services')} links={services} />
        <FooterLinks title={t('footer.company')} links={company} />

        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: '#FFFFFF', letterSpacing: '1px', fontSize: '1rem', marginBottom: '1.25rem', fontWeight: 400 }}>{t('footer.contact')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { Icon: MapPin, text: 'Jl. Raya Pariwisata No. 99, Bandung' },
              { Icon: Phone, text: '+62 812-3456-7890' },
              { Icon: Mail, text: 'support@ngninep.id' },
            ].map(({ Icon, text }) => (
              <div key={text} style={{ display: 'flex', gap: '0.75rem', color: '#9CA3AF', fontSize: '0.85rem', alignItems: 'flex-start' }}>
                <Icon size={16} style={{ color: 'var(--color-gold)', flexShrink: 0, marginTop: 2 }} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', background: '#071626', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '1rem', textAlign: 'center' }}>
        <span style={{ color: '#6B7280', fontSize: '0.75rem' }}>
          Copyright {new Date().getFullYear()} NgiNep Corp. {t('footer.rights')}
        </span>
        <span style={{ color: '#6B7280', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {t('footer.madeFor')} <Heart size={10} style={{ color: 'var(--color-gold)', fill: 'var(--color-gold)' }} />
        </span>
      </div>
    </footer>
  );
};

const FooterLinks = ({ title, links }) => (
  <div>
    <h3 style={{ fontFamily: 'var(--font-heading)', color: '#FFFFFF', letterSpacing: '1px', fontSize: '1rem', marginBottom: '1.25rem', fontWeight: 400 }}>{title}</h3>
    {links.map(link => (
      <Link
        key={link.text}
        to={link.to}
        style={{ display: 'block', color: '#9CA3AF', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '0.75rem', transition: 'color 0.3s' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--color-gold)'}
        onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
      >
        {link.text}
      </Link>
    ))}
  </div>
);

export default Footer;
