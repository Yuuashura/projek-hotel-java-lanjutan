const HomeBenefitsSection = ({ t }) => (
  <div className="reveal" style={{ maxWidth: 1280, margin: '10rem auto 0', padding: '0 1.5rem' }}>
    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
      <span style={{ fontFamily: 'var(--font-body)', fontWeight: 400, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>{t('home.whyEyebrow')}</span>
      <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', margin: '0.5rem 0 0', fontWeight: 300 }}>{t('home.whyTitle')}</h2>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2.5rem' }}>
      {t('home.benefits').map(benefit => (
        <div key={benefit.title} className="card-hover" style={{ background: 'var(--color-surface)', padding: '2.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-accent)', boxShadow: 'var(--shadow-float)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '2.5rem', width: 64, height: 64, background: benefit.color, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{benefit.emoji}</div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '1.25rem', margin: '0.5rem 0 0', color: 'var(--color-text)' }}>{benefit.title}</h3>
          <p style={{ color: 'var(--color-muted)', fontWeight: 300, lineHeight: 1.7, fontSize: '0.875rem', margin: 0 }}>{benefit.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

export default HomeBenefitsSection;
