import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Hotel, Users, Calendar, LogOut, Menu, Globe, House, UserCog } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import LogoutConfirmModal from '../LogoutConfirmModal';
import { cn } from '../../lib/utils';

const adminMenu = [
{ path: '/admin/dashboard', labelKey: 'admin.menu.dashboard', icon: LayoutDashboard },
{ path: '/admin/hotels', labelKey: 'admin.menu.hotels', icon: Hotel },
{ path: '/admin/admin-hotels', labelKey: 'admin.menu.adminHotels', icon: UserCog, roles: ['ROLE_ADMIN_APP'] },
{ path: '/admin/visitors', labelKey: 'admin.menu.visitors', icon: Users, roles: ['ROLE_ADMIN_APP'] },
{ path: '/admin/bookings', labelKey: 'admin.menu.bookings', icon: Calendar }];


const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = usePreferences();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = React.useState(false);
  const [logoutLoading, setLogoutLoading] = React.useState(false);
  const logoutTimerRef = React.useRef(null);
  const visibleMenu = adminMenu.filter((menu) => !menu.roles || menu.roles.includes(user?.role));
  const activeMenu = visibleMenu.find((m) => m.path === location.pathname);

  React.useEffect(() => {
    return () => {
      if (logoutTimerRef.current) {
        window.clearTimeout(logoutTimerRef.current);
      }
    };
  }, []);

  const finishLogout = () => {
    setLogoutConfirmOpen(false);
    setLogoutLoading(false);
    sessionStorage.setItem('ngninep-flash', JSON.stringify({ type: 'success', key: 'flash.logoutSuccess' }));
    logout();
    window.location.assign('/');
  };

  const requestLogout = () => {
    setSidebarOpen(false);
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

  const preferenceControls =
  <div className="[display:flex] [align-items:center] [gap:0.5rem]">
      <div className="[position:relative] [display:grid] [grid-template-columns:30px_38px_38px] [align-items:center] [height:40px] [padding:3px] [border:1px_solid_var(--color-accent)] [background:var(--color-background)] [border-radius:999px] [overflow:hidden] [box-shadow:inset_0_1px_0_rgba(255,255,255,0.08)]">












        <Globe size={13} className="[color:var(--color-muted)] [justify-self:center] [z-index:2]" />
        <span className={cn(
        'absolute bottom-[3px] left-[33px] top-[3px] w-[38px] rounded-full bg-[var(--color-primary)] shadow-[var(--shadow-float)] transition-transform duration-300 ease-out',
        language === 'id' ? 'translate-x-0' : 'translate-x-[38px]'
      )} />
        {['id', 'en'].map((lang) =>
      <button
        key={lang}
        type="button"
        onClick={() => setLanguage(lang)}
        title="Language"
        className={cn(
          'relative z-[2] flex h-[34px] w-[38px] cursor-pointer items-center justify-center rounded-full border-0 bg-transparent',
          'font-[var(--font-body)] text-[0.7rem] font-bold uppercase leading-none tracking-[0.7px] transition hover:-translate-y-px',
          language === lang ? 'text-white' : 'text-[var(--color-muted)]'
        )}>

            {lang}
          </button>
      )}
      </div>
    </div>;


  return (
    <div className="min-w-0 [display:flex] [min-height:100vh] [background:var(--color-background)]">
      {/* Sidebar */}
      <aside className={cn(
        "overflow-hidden shadow-[18px_0_45px_-34px_rgba(4,18,42,0.8)] fixed top-0 z-50 flex h-screen w-[260px] shrink-0 flex-col border-r border-[var(--admin-sidebar-border)] bg-[var(--admin-sidebar-bg)] transition-transform duration-300",
        'max-md:-translate-x-[264px]',
        sidebarOpen ? 'max-md:translate-x-0 max-md:shadow-[var(--shadow-hover)]' : 'shadow-none'
      )}>
        {/* Logo */}
         <div className="[padding:1.25rem_1.5rem] [border-bottom:1px_solid_var(--admin-sidebar-border)] [display:flex] [align-items:center] [justify-content:space-between]">
           <Link to="/" className="[text-decoration:none]">
             <div className="inline-block origin-center transition duration-300 hover:-translate-y-px text-white [text-shadow:0_8px_24px_rgba(122,183,240,0.28)] [font-family:var(--font-heading)] [font-weight:400] [font-size:1.4rem] [color:#FFFFFF] [font-style:italic] [letter-spacing:1px]">NgiNep.</div>
           </Link>
           <span className="text-[var(--admin-sidebar-muted)] [color:var(--admin-sidebar-muted)] [font-family:var(--font-body)] [font-weight:400] [font-size:0.65rem] [text-transform:uppercase] [letter-spacing:1.5px]">Admin</span>
         </div>

        {/* User Info */}
        <div className="border-[var(--admin-sidebar-border)] bg-[var(--admin-sidebar-user-bg)] [padding:1.25rem_1.5rem] [border-bottom:1px_solid_var(--admin-sidebar-border)] [background:var(--admin-sidebar-user-bg)]">
          <div className="text-[var(--admin-sidebar-text)] [font-family:var(--font-heading)] [font-weight:400] [font-size:1.1rem] [color:var(--admin-sidebar-text)]">{user?.first_name} {user?.last_name}</div>
          <div className="text-[var(--admin-sidebar-muted)] [color:var(--admin-sidebar-muted)] [font-weight:300] [font-size:0.75rem] [margin-bottom:0.5rem]">{user?.email}</div>
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-accent)] bg-[var(--color-background)] px-3 py-1 text-[0.7rem] font-medium uppercase text-[var(--color-text)] max-sm:px-2.5 max-sm:py-1 max-sm:text-[0.64rem] border-[var(--color-primary-soft)] bg-[var(--color-primary-soft)] text-[var(--color-primary)] [font-size:0.65rem]">{user?.role?.replace('ROLE_', '')}</span>
        </div>

         {/* Nav Links */}
         <nav className="[flex:1] [padding:1rem_0] [overflow-y:auto]">
           {visibleMenu.map(({ path, labelKey, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'mx-3 my-1 flex items-center gap-3 rounded-lg border px-4 py-3.5 text-[0.85rem] font-semibold uppercase no-underline transition-all duration-300',
                  'hover:translate-x-1 hover:border-white/15 hover:bg-[var(--admin-sidebar-hover)] hover:text-[var(--admin-sidebar-text)]',
                  active
                    ? 'border-amber-200/35 bg-[var(--admin-sidebar-active)] text-white shadow-[inset_3px_0_0_var(--color-gold),0_14px_32px_-24px_rgba(0,0,0,0.8)]'
                    : 'border-transparent text-[var(--admin-sidebar-muted)]',
                )}
              >
                 <Icon size={16} />
                 {t(labelKey)}
               </Link>);

          })}
         </nav>

         {/* Home Link */}
         <Link to="/" onClick={() => setSidebarOpen(false)} className="[display:flex] [align-items:center] [padding:1rem_1.5rem] [text-decoration:none] [color:var(--admin-sidebar-text)] [border-top:1px_solid_var(--admin-sidebar-border)]">
           <House size={16} />
           <span className="[margin-left:0.75rem] [font-family:var(--font-body)] [font-weight:400] [font-size:0.75rem] [text-transform:uppercase] [letter-spacing:1.5px]">
             {t('nav.home')}
           </span>
         </Link>

        {/* Logout */}
        <div className="[border-top:1px_solid_var(--admin-sidebar-border)] [padding:1rem]">
          <button className="hover:!border-red-200/50 hover:!bg-red-700/90 hover:!text-white [width:100%] [display:flex] [align-items:center] [justify-content:center] [gap:0.75rem] [padding:0.75rem_1rem] [background:rgba(127,_29,_29,_0.1)] [border:1px_solid_rgba(252,_165,_165,_0.34)] [cursor:pointer] [font-family:var(--font-body)] [font-weight:400] [font-size:0.75rem] [color:#FECACA] [text-transform:uppercase] [letter-spacing:1.5px] [border-radius:var(--radius-sm)] [transition:all_0.3s_ease]" onClick={requestLogout}>
            <LogOut size={14} /> {t('admin.actions.logout')}
          </button>
        </div>
      </aside>

      {/* Overlay (mobile) */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="[position:fixed] [inset:0] [background:rgba(0,0,0,0.3)] [z-index:40]" />}

      {/* Main Content */}
      <div className="min-w-0 [&_p]:font-normal [&_td]:font-normal [&_label]:font-normal [&_input]:font-normal [&_select]:font-normal [&_textarea]:font-normal ml-[260px] flex flex-1 flex-col max-md:ml-0">
        {/* Top Bar */}
        <div className="max-[920px]:!min-h-16 max-[920px]:!px-4 max-[920px]:!py-3 max-sm:flex-wrap max-sm:[&>h1]:order-2 max-sm:[&>h1]:basis-full [background:var(--color-surface)] [border-bottom:1px_solid_var(--color-accent)] [padding:1rem_2rem] [display:flex] [align-items:center] [gap:1rem] [position:sticky] [top:0] [z-index:30]">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden max-md:inline-flex max-md:items-center max-md:justify-center hidden cursor-pointer rounded-lg border border-[var(--color-accent)] bg-transparent p-2 max-md:block">
            <Menu size={16} />
          </button>
          <h1 className="[font-family:var(--font-heading)] [font-weight:300] [font-size:1.4rem] [text-transform:uppercase] [letter-spacing:1px] [flex:1] [margin:0] [color:var(--color-text)]">
            {activeMenu?.labelKey ? t(activeMenu.labelKey) : t('admin.panel')}
          </h1>
          {preferenceControls}
          <span className="[font-family:var(--font-body)] [font-weight:300] [font-size:0.75rem] [color:var(--color-muted)] [letter-spacing:1px] [text-transform:uppercase]">{t('admin.brand')}</span>
        </div>

        {/* Page Content */}
        <main className="min-w-0 max-[920px]:!px-4 max-[920px]:!py-5 max-sm:!px-3.5 max-sm:!py-4 [flex:1] [padding:2.5rem_2rem]">
          {children}
        </main>
      </div>

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

    </div>);

};

export default AdminLayout;
