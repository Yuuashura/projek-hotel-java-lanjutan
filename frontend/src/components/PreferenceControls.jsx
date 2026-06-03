import { Globe2, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePreferences } from '../context/PreferencesContext';

const toneClasses = {
  navbar: {
    shell: 'border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--color-text)] shadow-[inset_0_1px_0_rgba(255,255,255,.16),0_8px_18px_rgba(15,23,42,.08)] backdrop-blur-xl',
    globe: 'text-[var(--color-muted)]',
    inactive: 'text-[var(--color-muted)] hover:text-[var(--color-text)]',
    active: 'text-[var(--color-text)] dark:text-[#061426]',
    pill: 'bg-[color-mix(in_srgb,var(--color-primary)_24%,white)] dark:bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))]',
    themeButton: 'border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--color-text)] shadow-none hover:bg-[var(--glass-bg-strong)]',
  },
  surface: {
    shell: 'border-[var(--color-accent)] bg-[var(--color-background)] text-[var(--color-text)] shadow-[inset_0_1px_0_rgba(255,255,255,.08)]',
    globe: 'text-[var(--color-muted)]',
    inactive: 'text-[var(--color-muted)]',
    active: 'text-[var(--color-text)] dark:text-white',
    pill: 'bg-[color-mix(in_srgb,var(--color-primary)_22%,white)] dark:bg-[var(--color-primary)]',
    themeButton: 'border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--color-text)] hover:bg-[var(--color-background)]',
  },
};

const PreferenceControls = ({ tone = 'surface', className }) => {
  const { language, setLanguage, theme, toggleTheme, t } = usePreferences();
  const ThemeIcon = theme === 'dark' ? Sun : Moon;
  const styles = toneClasses[tone] || toneClasses.surface;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('relative grid h-10 grid-cols-[30px_38px_38px] items-center overflow-hidden rounded-full border p-[3px]', styles.shell)}>
        <Globe2 size={13} className={cn('relative z-10 justify-self-center', styles.globe)} />
        <span
          aria-hidden="true"
          className={cn(
            'absolute bottom-[3px] left-[33px] top-[3px] w-[38px] rounded-full shadow-[0_6px_18px_rgba(0,0,0,.16)] transition-transform duration-300 ease-out',
            styles.pill,
            language === 'en' && 'translate-x-[38px]',
          )}
        />
        {['id', 'en'].map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setLanguage(lang)}
            title={t('nav.language')}
            className={cn(
              'relative z-10 flex h-[34px] w-[38px] items-center justify-center rounded-full border-0 bg-transparent text-[0.7rem] font-bold uppercase leading-none transition duration-200 hover:-translate-y-0.5',
              language === lang ? styles.active : styles.inactive,
            )}
          >
            {lang}
          </button>
        ))}
      </div>

      <Button
        type="button"
        variant="secondary"
        size="icon"
        onClick={toggleTheme}
        title={`${t('nav.theme')}: ${theme === 'dark' ? t('nav.light') : t('nav.dark')}`}
        className={cn('h-[38px] w-[42px]', styles.themeButton)}
      >
        <ThemeIcon key={theme} size={15} className="theme-icon-rotate" />
      </Button>
    </div>
  );
};

export default PreferenceControls;
