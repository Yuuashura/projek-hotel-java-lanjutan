import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Award, Users } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';

const About = () => {
  const { t } = usePreferences();
  const values = t('about.values');
  const icons = [
    { icon: ShieldCheck, color: 'rgba(72, 187, 120, 0.1)', iconColor: '#38A169' },
    { icon: Heart, color: 'rgba(229, 62, 62, 0.1)', iconColor: '#E53E3E' },
    { icon: Award, color: 'rgba(212, 175, 55, 0.1)', iconColor: 'var(--color-primary)' },
    { icon: Users, color: 'rgba(43, 108, 176, 0.1)', iconColor: '#2B6CB0' },
  ];

  return (
    <div className="about-page" style={{ minHeight: '100vh', background: 'var(--color-background)', padding: '6rem 1.5rem' }}>
      <div className="about-shell" style={{ maxWidth: 850, margin: '0 auto' }}>
        
        {/* Title Section */}
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 400, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>{t('about.eyebrow')}</span>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginTop: '0.5rem', marginBottom: '1.5rem', lineHeight: 1.1 }}>
            {t('about.title')} <span style={{ color: 'var(--color-primary)', fontStyle: 'italic' }}>NgiNep.</span>
          </h1>
          <p style={{ color: 'var(--color-muted)', fontWeight: 300, fontSize: '1.1rem', maxWidth: 650, margin: '0 auto', lineHeight: 1.8 }}>
            {t('about.intro')}
          </p>
        </div>

        {/* Story Section */}
        <div className="card reveal flow-animate about-story-card" style={{ padding: '3rem', marginBottom: '4rem', border: '1px solid var(--color-accent)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--color-text)' }}>{t('about.missionTitle')}</h2>
          <p style={{ color: 'var(--color-text)', fontWeight: 300, lineHeight: 1.9, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            {t('about.mission1')}
          </p>
          <p style={{ color: 'var(--color-text)', fontWeight: 300, lineHeight: 1.9, fontSize: '0.95rem' }}>
            {t('about.mission2')}
          </p>
        </div>

        {/* Value Grid */}
        <div className="reveal" style={{ marginBottom: '5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '2rem', textAlign: 'center', marginBottom: '3rem', color: 'var(--color-text)' }}>{t('about.valuesTitle')}</h2>
          <div className="about-value-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            {values.map((v, i) => {
              const meta = icons[i];
              const Icon = meta.icon;
              return (
                <div key={i} className="card card-hover" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--color-accent)' }}>
                  <div style={{ background: meta.color, width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} style={{ color: meta.iconColor }} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '1.3rem', margin: 0, color: 'var(--color-text)' }}>{v.title}</h3>
                  <p style={{ color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="reveal about-cta-panel" style={{ borderRadius: 'var(--radius-sm)', padding: '3.5rem 2rem', color: 'white', textAlign: 'center', boxShadow: 'var(--shadow-hover)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '2.2rem', color: 'white', marginBottom: '1rem' }}>{t('about.ctaTitle')}</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 300, marginBottom: '2.5rem', maxWidth: 500, margin: '0 auto 2.5rem', fontSize: '0.95rem' }}>{t('about.ctaText')}</p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/hotels" className="btn btn-primary" style={{ background: 'var(--color-primary)' }}>{t('about.explore')}</Link>
            <Link to="/register" className="btn btn-white" style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>{t('about.createAccount')}</Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
