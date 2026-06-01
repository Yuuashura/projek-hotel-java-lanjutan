import { Globe, Moon, Sun } from 'lucide-react';

const AdminPreferenceControls = ({ language, setLanguage, theme, toggleTheme }) => {
  const ThemeIcon = theme === 'dark' ? Sun : Moon;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '30px 38px 38px', alignItems: 'center', height: 40, padding: 3, border: '1px solid var(--color-accent)', background: 'var(--color-background)', borderRadius: 999, overflow: 'hidden', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)' }}>
        <Globe size={13} style={{ color: 'var(--color-muted)', justifySelf: 'center', zIndex: 2 }} />
        <span style={{ position: 'absolute', top: 3, bottom: 3, left: 33, width: 38, borderRadius: 999, background: 'var(--color-primary)', boxShadow: 'var(--shadow-float)', transform: language === 'id' ? 'translateX(0)' : 'translateX(38px)', transition: 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)' }} />
        {['id', 'en'].map(lang => (
          <button key={lang} type="button" onClick={() => setLanguage(lang)} title="Language" style={{ height: 34, width: 38, border: 'none', cursor: 'pointer', position: 'relative', zIndex: 2, borderRadius: 999, background: 'transparent', color: language === lang ? 'white' : 'var(--color-muted)', fontFamily: 'var(--font-body)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.7px', lineHeight: 1, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.24s ease, transform 0.24s ease' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
            {lang}
          </button>
        ))}
      </div>
      <button type="button" onClick={toggleTheme} title="Theme" className="btn btn-white btn-sm navbar-control-button" style={{ height: 38, width: 42, padding: 0 }}>
        <ThemeIcon key={theme} size={15} className="theme-icon-rotate" />
      </button>
    </div>
  );
};

export default AdminPreferenceControls;
