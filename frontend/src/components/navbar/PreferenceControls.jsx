import { Globe, Moon, Sun } from 'lucide-react';
import { frostedButtonStyle } from './navbarStyles';

const PreferenceControls = ({ language, setLanguage, theme, toggleTheme, t }) => {
  const nextThemeLabel = theme === 'dark' ? t('nav.light') : t('nav.dark');
  const ThemeIcon = theme === 'dark' ? Sun : Moon;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '30px 38px 38px', alignItems: 'center', height: 40, padding: 3, border: '1px solid rgba(255,255,255,0.26)', background: 'linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.07))', borderRadius: 999, overflow: 'hidden', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 10px 22px rgba(0,0,0,0.12)' }}>
        <Globe size={13} style={{ color: 'rgba(255,255,255,0.86)', justifySelf: 'center', zIndex: 2 }} />
        <span style={{ position: 'absolute', top: 3, bottom: 3, left: 33, width: 38, borderRadius: 999, background: 'linear-gradient(135deg, #F6D365, #F9E39A)', boxShadow: '0 6px 18px rgba(0,0,0,0.16)', transform: language === 'id' ? 'translateX(0)' : 'translateX(38px)', transition: 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)' }} />
        {['id', 'en'].map(lang => (
          <button key={lang} type="button" onClick={() => setLanguage(lang)} title={t('nav.language')} style={{ height: 34, width: 38, border: 'none', cursor: 'pointer', position: 'relative', zIndex: 2, borderRadius: 999, background: 'transparent', color: language === lang ? '#15314F' : 'rgba(255,255,255,0.9)', fontFamily: 'var(--font-body)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.7px', lineHeight: 1, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.24s ease, transform 0.24s ease' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
            {lang}
          </button>
        ))}
      </div>
      <button type="button" onClick={toggleTheme} title={`${t('nav.theme')}: ${nextThemeLabel}`} className="btn btn-white btn-sm navbar-control-button" style={{ ...frostedButtonStyle, height: 38, width: 42, padding: 0 }}>
        <ThemeIcon key={theme} size={15} className="theme-icon-rotate" />
      </button>
    </div>
  );
};

export default PreferenceControls;
