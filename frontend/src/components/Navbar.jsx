import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { animate, stagger } from 'animejs';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { LogOut, User, Calendar, Menu, X, ChevronDown, Globe } from 'lucide-react';
import LogoutConfirmModal from './LogoutConfirmModal';
import { cn } from '../lib/utils';

const navLinkClass = 'relative inline-flex min-h-9 items-center font-[var(--font-body)] text-[0.8rem] font-semibold text-white/90 no-underline transition hover:-translate-y-0.5 hover:text-[#F6D365]';
const mobileLinkClass = 'border-b border-white/15 pb-3 font-[var(--font-body)] text-[0.85rem] font-semibold text-white/95 no-underline transition-all duration-300 hover:pl-2 hover:text-[#F6D365]';
const frostedButtonClass = 'border-white/30 bg-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] hover:border-white/50 hover:bg-white/20';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = usePreferences();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const logoutTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (logoutTimerRef.current) {
        window.clearTimeout(logoutTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    window.requestAnimationFrame(() => {
      animate('.site-mobile-menu > *', {
        opacity: [0, 1],
        translateY: [-8, 0],
        duration: 360,
        delay: stagger(36),
        ease: 'outCubic'
      });
    });
  }, [isOpen]);

  const finishLogout = () => {
    setLogoutConfirmOpen(false);
    setLogoutLoading(false);
    sessionStorage.setItem('ngninep-flash', JSON.stringify({ type: 'success', key: 'flash.logoutSuccess' }));
    logout();
    window.location.assign('/');
  };

  const requestLogout = () => {
    setDropdownOpen(false);
    setIsOpen(false);
    setLogoutConfirmOpen(true);
  };

  const confirmLogout = () => {
    if (logoutLoading) return;
    setLogoutLoading(true);
    logoutTimerRef.current = window.setTimeout(finishLogout, 2000);
  };

  const cancelLogout = () => {
    if (logoutLoading) return;
    setLogoutConfirmOpen(false);
  };

  const isAdmin = user?.role === 'ROLE_ADMIN_HOTEL' || user?.role === 'ROLE_ADMIN_APP';

  const preferenceControls =
  <div className="[display:flex] [align-items:center] [gap:0.5rem]">
      <div className="[position:relative] [display:grid] [grid-template-columns:30px_38px_38px] [align-items:center] [height:40px] [padding:3px] [border:1px_solid_rgba(255,255,255,0.26)] [background:linear-gradient(135deg,_rgba(255,255,255,0.16),_rgba(255,255,255,0.07))] [border-radius:999px] [overflow:hidden] [box-shadow:inset_0_1px_0_rgba(255,255,255,0.18),_0_10px_22px_rgba(0,0,0,0.12)]">












        <Globe size={13} className="[color:rgba(255,255,255,0.86)] [justify-self:center] [z-index:2]" />
        <span className={cn(
        'absolute bottom-[3px] left-[33px] top-[3px] w-[38px] rounded-full bg-gradient-to-br from-[#F6D365] to-[#F9E39A]',
        'shadow-[0_6px_18px_rgba(0,0,0,0.16)] transition-transform duration-300 ease-out',
        language === 'id' ? 'translate-x-0' : 'translate-x-[38px]'
      )} />
        {['id', 'en'].map((lang) =>
      <button
        key={lang}
        type="button"
        onClick={() => setLanguage(lang)}
        title={t('nav.language')}
        className={cn(
          'relative z-[2] flex h-[34px] w-[38px] cursor-pointer items-center justify-center rounded-full border-0 bg-transparent',
          'font-[var(--font-body)] text-[0.7rem] font-bold uppercase leading-none tracking-[0.7px] transition hover:-translate-y-px',
          language === lang ? 'text-[#15314F]' : 'text-white/90'
        )}>

            {lang}
          </button>
      )}
      </div>
    </div>;


  return (
    <>
    <nav className="overflow-visible max-[920px]:sticky [background:linear-gradient(135deg,_rgba(9,_31,_59,_0.9),_rgba(30,_78,_128,_0.76)),_radial-gradient(circle_at_18%_10%,_rgba(246,211,101,0.18),_transparent_32%),_radial-gradient(circle_at_82%_0%,_rgba(122,183,240,0.18),_transparent_30%)] [backdrop-filter:blur(22px)_saturate(165%)] [-webkit-backdrop-filter:blur(22px)_saturate(165%)] [border-bottom:1px_solid_rgba(255,255,255,0.2)] [box-shadow:0_16px_40px_rgba(15,_48,_90,_0.22)] [position:sticky] [top:0] [z-index:100]">









      <div className="min-w-0 max-[920px]:!h-16 max-[920px]:!px-4 max-[380px]:!px-3 [max-width:1280px] [margin:0_auto] [padding:0_1.5rem] [display:flex] [align-items:center] [justify-content:space-between] [height:76px]">

        {/* Logo */}
        <Link to="/" className="[text-decoration:none]">
          <div className="inline-block origin-center transition duration-300 hover:-translate-y-px [font-family:var(--font-heading)] [font-weight:400] [font-size:1.8rem] [color:white] [letter-spacing:1px] [text-shadow:0_10px_26px_rgba(0,0,0,0.22)]">







            NgiNep<span className="[color:#F6D365]">.</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="flex items-center gap-10 max-[920px]:hidden">
          <Link to="/" className={navLinkClass}>{t('nav.home')}</Link>
          <Link to="/hotels" className={navLinkClass}>{t('nav.hotels')}</Link>
          <Link to="/about" className={navLinkClass}>{t('nav.about')}</Link>
          {isAdmin && <Link to="/admin/dashboard" className={cn(navLinkClass, 'text-[#F6D365]')}>{t('nav.admin')}</Link>}
        </div>

        {/* Desktop Auth */}
        <div className="flex items-center gap-4 max-[920px]:hidden">
          {preferenceControls}
          {user ?
            <div className="[position:relative]">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={cn("inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--color-text)] backdrop-blur-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-background)] min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem] transition-all duration-300 hover:-translate-y-px hover:brightness-105 hover:shadow-[0_12px_24px_rgba(0,0,0,0.16)] flex h-10 items-center gap-2 px-5", frostedButtonClass)}>

                <User size={14} />
                <span>{t('nav.greeting', { name: user.first_name })}</span>
                <ChevronDown size={12} />
              </button>
              <div className={cn(
                'absolute right-0 top-[calc(100%+8px)] z-[100] w-[220px] origin-top-right overflow-hidden rounded-lg',
                'border border-[var(--color-accent)] bg-[var(--color-surface-solid)] shadow-[var(--shadow-float)] transition duration-300',
                dropdownOpen ? 'pointer-events-auto translate-y-0 scale-100 opacity-100' : 'pointer-events-none -translate-y-2 scale-95 opacity-0'
              )}>
                <div className="[padding:1rem_1.25rem] [border-bottom:1px_solid_var(--color-accent)] [background:var(--color-surface-solid)]">
                  <p className="[font-family:var(--font-body)] [font-weight:400] [font-size:0.85rem] [margin:0] [color:var(--color-text)]">{user.first_name} {user.last_name}</p>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-accent)] bg-[var(--color-background)] px-3 py-1 text-[0.7rem] font-medium uppercase text-[var(--color-text)] max-sm:px-2.5 max-sm:py-1 max-sm:text-[0.64rem] [margin-top:6px] [font-size:0.65rem] [background:rgba(44,82,130,0.1)] [color:var(--color-primary)] [border-color:transparent]">{user.role?.replace('ROLE_', '')}</span>
                </div>
                {user.role === 'ROLE_USER' &&
                <Link to="/my-bookings" onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 border-b border-[var(--color-accent)] px-5 py-3.5 text-[0.8rem] uppercase tracking-[1px] text-[var(--color-text)] no-underline transition hover:bg-[var(--color-background)]">
                    <Calendar size={14} /> {t('nav.myBookings')}
                  </Link>
                }
                <Link to="/profile" onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 border-b border-[var(--color-accent)] px-5 py-3.5 text-[0.8rem] uppercase tracking-[1px] text-[var(--color-text)] no-underline transition hover:bg-[var(--color-background)]">
                  <User size={14} /> {t('nav.profile')}
                </Link>
                <button onClick={requestLogout}
                className="flex w-full cursor-pointer items-center gap-2 border-0 bg-transparent px-5 py-3.5 text-left text-[0.8rem] uppercase tracking-[1px] text-[#E53E3E] transition hover:bg-[var(--color-background)]">
                  <LogOut size={14} /> {t('nav.logout')}
                </button>
              </div>
            </div> :

            <>
              <Link to="/login" className={cn("inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--color-text)] backdrop-blur-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-background)] min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem] transition-all duration-300 hover:-translate-y-px hover:brightness-105 hover:shadow-[0_12px_24px_rgba(0,0,0,0.16)] flex h-10 items-center px-6", frostedButtonClass)}>{t('nav.signIn')}</Link>
              <Link to="/register" className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[color-mix(in_srgb,var(--color-primary)_46%,transparent)] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))] text-[#061426] hover:brightness-105 min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem] transition-all duration-300 hover:-translate-y-px hover:brightness-105 hover:shadow-[0_12px_24px_rgba(0,0,0,0.16)] [height:40px] [padding:0_1.5rem] [display:flex] [align-items:center] [background:#F6D365] [color:#15314F] [border-color:transparent]">{t('nav.signUp')}</Link>
            </>
            }
        </div>

        {/* Mobile Hamburger */}
        <button onClick={() => setIsOpen(!isOpen)} className="hidden cursor-pointer items-center justify-center rounded-lg border border-white/25 bg-white/10 p-2 text-white max-[920px]:inline-flex">
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen &&
        <div className="max-[920px]:max-h-[calc(100vh-64px)] max-[920px]:overflow-y-auto max-[920px]:!p-4 [border-top:1px_solid_rgba(255,255,255,0.16)] [background:linear-gradient(135deg,_rgba(14,45,82,0.94),_rgba(37,99,154,0.86))] [backdrop-filter:blur(16px)_saturate(140%)] [-webkit-backdrop-filter:blur(16px)_saturate(140%)] [padding:1.5rem] [display:flex] [flex-direction:column] [gap:1.25rem] [box-shadow:0_18px_35px_rgba(15,48,90,0.22)]">










          <div className="[display:flex] [justify-content:space-between] [align-items:center] [gap:1rem]">
            {preferenceControls}
          </div>
          <Link to="/" onClick={() => setIsOpen(false)} className={mobileLinkClass}>{t('nav.home')}</Link>
          <Link to="/hotels" onClick={() => setIsOpen(false)} className={mobileLinkClass}>{t('nav.hotels')}</Link>
          <Link to="/about" onClick={() => setIsOpen(false)} className={mobileLinkClass}>{t('nav.about')}</Link>
          {user ?
          <>
              {user.role === 'ROLE_USER' && <Link to="/my-bookings" onClick={() => setIsOpen(false)} className={cn("inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--color-text)] backdrop-blur-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-background)] min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem] justify-center text-center", frostedButtonClass)}>{t('nav.myBookings')}</Link>}
              <Link to="/profile" onClick={() => setIsOpen(false)} className={cn("inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--color-text)] backdrop-blur-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-background)] min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem] justify-center text-center", frostedButtonClass)}>{t('nav.profile')}</Link>
              <button onClick={requestLogout} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[color-mix(in_srgb,var(--color-primary)_46%,transparent)] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))] text-[#061426] hover:brightness-105 min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem] transition-all duration-300 hover:-translate-y-px hover:brightness-105 hover:shadow-[0_12px_24px_rgba(0,0,0,0.16)] [background:#E53E3E] [color:white] [justify-content:center]">{t('nav.logout')}</button>
            </> :

          <>
              <Link to="/login" onClick={() => setIsOpen(false)} className={cn("inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--color-text)] backdrop-blur-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-background)] min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem] transition-all duration-300 hover:-translate-y-px hover:brightness-105 hover:shadow-[0_12px_24px_rgba(0,0,0,0.16)] justify-center text-center", frostedButtonClass)}>{t('nav.signIn')}</Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--glass-border)] px-8 py-3 text-sm font-bold no-underline shadow-[0_14px_34px_-24px_rgba(15,23,42,0.42)] transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-hover)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-h-[42px] max-sm:whitespace-normal max-sm:px-4 max-sm:py-2.5 max-sm:text-xs border-[color-mix(in_srgb,var(--color-primary)_46%,transparent)] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))] text-[#061426] hover:brightness-105 min-h-9 px-5 py-2 text-xs max-sm:min-h-[38px] max-sm:px-3 max-sm:py-2 max-sm:text-[0.7rem] transition-all duration-300 hover:-translate-y-px hover:brightness-105 hover:shadow-[0_12px_24px_rgba(0,0,0,0.16)] [text-align:center] [justify-content:center] [background:#F6D365] [color:#15314F] [border-color:transparent]">{t('nav.signUp')}</Link>
            </>
          }
        </div>
        }
    </nav>
    <LogoutConfirmModal
        open={logoutConfirmOpen}
        loading={logoutLoading}
        title={t('nav.logoutConfirmTitle')}
        message={t('nav.logoutConfirmMessage')}
        confirmLabel={t('nav.logoutConfirmAction')}
        cancelLabel={t('nav.logoutCancelAction')}
        loadingLabel={t('nav.logoutLoading')}
        onConfirm={confirmLogout}
        onCancel={cancelLogout} />

    </>);

};

export default Navbar;
