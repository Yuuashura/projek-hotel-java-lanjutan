const AboutValueCard = ({ value, meta }) => {
  const Icon = meta.icon;

  return (
    <div className="card card-hover" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--color-accent)' }}>
      <div style={{ background: meta.color, width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} style={{ color: meta.iconColor }} />
      </div>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '1.3rem', margin: 0, color: 'var(--color-text)' }}>
        {value.title}
      </h3>
      <p style={{ color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>
        {value.desc}
      </p>
    </div>
  );
};

export default AboutValueCard;
