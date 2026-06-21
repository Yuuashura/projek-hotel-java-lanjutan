import React, { lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PreferencesProvider } from './context/PreferencesContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingState from './components/LoadingState';
import { usePreferences } from './context/PreferencesContext';
import { cn } from './lib/utils';

const Home = lazy(() => import('./pages/public/Home'));
const Login = lazy(() => import('./pages/public/Login'));
const Register = lazy(() => import('./pages/public/Register'));
const VerifyOtp = lazy(() => import('./pages/public/VerifyOtp'));
const ForgotPassword = lazy(() => import('./pages/public/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/public/ResetPassword'));
const Hotels = lazy(() => import('./pages/public/Hotels'));
const HotelDetail = lazy(() => import('./pages/public/HotelDetail'));
const About = lazy(() => import('./pages/public/About'));
const Booking = lazy(() => import('./pages/user/Booking'));
const Payment = lazy(() => import('./pages/user/Payment'));
const MyBookings = lazy(() => import('./pages/user/MyBookings'));
const Profile = lazy(() => import('./pages/user/Profile'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminHotels = lazy(() => import('./pages/admin/AdminHotels'));
const AdminVisitors = lazy(() => import('./pages/admin/AdminVisitors'));
const AdminAdminHotels = lazy(() => import('./pages/admin/AdminAdminHotels'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminRoomTypes = lazy(() => import('./pages/admin/AdminRoomTypes'));

// ==========================================
// Route Guards
// ==========================================
const UserRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <RouteLoading />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ROLE_USER') return <Navigate to="/admin/dashboard" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <RouteLoading />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ROLE_ADMIN_HOTEL' && user.role !== 'ROLE_ADMIN_APP') return <Navigate to="/" replace />;
  return children;
};

const AdminAppRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <RouteLoading />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ROLE_ADMIN_APP') return <Navigate to="/admin/dashboard" replace />;
  return children;
};

const RouteLoading = () =>
<div className="[min-height:100vh] [display:grid] [place-items:center] [padding:2rem]">
    <LoadingState text="Menyiapkan sesi..." />
  </div>;


// ==========================================
// Public Layout (Navbar + Footer)
// ==========================================
const PublicLayout = ({ children }) =>
<>
    <Navbar />
    <main className="min-w-0">{children}</main>
    <Footer />
  </>;


// ==========================================
// App Routes
// ==========================================
function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
      {/* ============ PUBLIC ROUTES ============ */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/hotels" element={<PublicLayout><Hotels /></PublicLayout>} />
      <Route path="/hotels/:id" element={<PublicLayout><HotelDetail /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />

      {/* Auth (No Layout) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ============ USER ROUTES ============ */}
      <Route path="/booking/:hotelId" element={<UserRoute><PublicLayout><Booking /></PublicLayout></UserRoute>} />
      <Route path="/payment/:bookingId" element={<UserRoute><PublicLayout><Payment /></PublicLayout></UserRoute>} />
      <Route path="/my-bookings" element={<UserRoute><PublicLayout><MyBookings /></PublicLayout></UserRoute>} />
      <Route path="/profile" element={<UserRoute><PublicLayout><Profile /></PublicLayout></UserRoute>} />

      {/* ============ ADMIN ROUTES ============ */}
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/hotels" element={<AdminRoute><AdminHotels /></AdminRoute>} />
      <Route path="/admin/hotels/:hotelId/rooms" element={<AdminRoute><AdminRoomTypes /></AdminRoute>} />
      <Route path="/admin/admin-hotels" element={<AdminAppRoute><AdminAdminHotels /></AdminAppRoute>} />
      <Route path="/admin/visitors" element={<AdminAppRoute><AdminVisitors /></AdminAppRoute>} />
      <Route path="/admin/bookings" element={<AdminRoute><AdminBookings /></AdminRoute>} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>);

}

const ScrollRevealManager = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal, .flow-animate').forEach((element) => element.classList.add('active'));
      return undefined;
    }

    const observed = new WeakSet();
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -48px', threshold: 0.08 });

    const observeElements = () => {
      document.querySelectorAll('.reveal, .flow-animate').forEach((element) => {
        if (observed.has(element)) return;
        observed.add(element);
        revealObserver.observe(element);
      });
    };

    observeElements();
    const mutationObserver = new MutationObserver(observeElements);
    mutationObserver.observe(document.getElementById('root'), { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      revealObserver.disconnect();
    };
  }, [pathname]);

  return null;
};

const FlashToast = () => {
  const { t } = usePreferences();
  const { pathname } = useLocation();
  const [flash, setFlash] = React.useState(null);

  React.useEffect(() => {
    const readFlash = () => {
      const raw = sessionStorage.getItem('ngninep-flash');
      if (!raw) return;
      sessionStorage.removeItem('ngninep-flash');
      try {
        setFlash(JSON.parse(raw));
      } catch {
        setFlash({ type: 'success', message: raw });
      }
    };

    readFlash();
    window.addEventListener('ngninep-flash', readFlash);
    return () => window.removeEventListener('ngninep-flash', readFlash);
  }, [pathname]);

  React.useEffect(() => {
    if (!flash) return undefined;
    const timer = window.setTimeout(() => setFlash(null), 3200);
    return () => window.clearTimeout(timer);
  }, [flash]);

  if (!flash) return null;

  const message = flash.key ? t(flash.key) : flash.message;

  return createPortal(
    <div
      className={cn(
        'fixed left-1/2 top-[5.5rem] z-[2000] w-[min(360px,calc(100vw-2rem))] -translate-x-1/2 animate-[toastDropIn_0.38s_cubic-bezier(0.16,1,0.3,1)]',
        'rounded-lg border border-l-4 bg-[var(--color-surface)] px-[1.1rem] py-4 shadow-[var(--shadow-hover)] max-[920px]:top-[4.75rem] max-sm:top-[4.35rem] max-sm:w-[calc(100vw-1rem)]',
        flash.type === 'danger'
          ? 'border-[var(--color-danger-border)] border-l-[var(--color-danger)]'
          : 'border-[var(--color-success-border)] border-l-[var(--color-success)]',
      )}
      role="status"
      aria-live="polite"
    >
      <p className="m-0 text-[0.82rem] font-semibold uppercase text-[var(--color-text)]">NgiNep</p>
      <p className="mt-1 text-[0.86rem] font-normal leading-relaxed text-[var(--color-muted)]">{message}</p>
    </div>,
    document.body
  );
};

function App() {
  React.useEffect(() => {
    const updateVisibility = () => {
      document.documentElement.classList.toggle('page-hidden', document.hidden);
    };
    updateVisibility();
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  return (
    <PreferencesProvider>
      <AuthProvider>
        <Router>
          <ScrollRevealManager />
          <FlashToast />
          <AppRoutes />
        </Router>
      </AuthProvider>
    </PreferencesProvider>);

}

export default App;
