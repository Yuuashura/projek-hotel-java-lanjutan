import React, { Suspense, lazy } from 'react';
import { createPortal } from 'react-dom';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { animate, stagger } from 'animejs';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PreferencesProvider } from './context/PreferencesContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingState from './components/LoadingState';
import { usePreferences } from './context/PreferencesContext';

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

const RouteLoading = () => (
  <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
    <LoadingState text="Menyiapkan sesi..." />
  </div>
);

const LazyPage = ({ children }) => (
  <Suspense fallback={<RouteLoading />}>
    {children}
  </Suspense>
);

// ==========================================
// Public Layout (Navbar + Footer)
// ==========================================
const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="public-main">{children}</main>
    <Footer />
  </>
);

// ==========================================
// App Routes
// ==========================================
function AppRoutes() {
  return (
    <Routes>
      {/* ============ PUBLIC ROUTES ============ */}
      <Route path="/" element={<PublicLayout><LazyPage><Home /></LazyPage></PublicLayout>} />
      <Route path="/hotels" element={<PublicLayout><LazyPage><Hotels /></LazyPage></PublicLayout>} />
      <Route path="/hotels/:id" element={<PublicLayout><LazyPage><HotelDetail /></LazyPage></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><LazyPage><About /></LazyPage></PublicLayout>} />

      {/* Auth (No Layout) */}
      <Route path="/login" element={<LazyPage><Login /></LazyPage>} />
      <Route path="/register" element={<LazyPage><Register /></LazyPage>} />
      <Route path="/verify-otp" element={<LazyPage><VerifyOtp /></LazyPage>} />
      <Route path="/forgot-password" element={<LazyPage><ForgotPassword /></LazyPage>} />
      <Route path="/reset-password" element={<LazyPage><ResetPassword /></LazyPage>} />

      {/* ============ USER ROUTES ============ */}
      <Route path="/booking/:hotelId" element={<UserRoute><PublicLayout><LazyPage><Booking /></LazyPage></PublicLayout></UserRoute>} />
      <Route path="/payment/:bookingId" element={<UserRoute><PublicLayout><LazyPage><Payment /></LazyPage></PublicLayout></UserRoute>} />
      <Route path="/my-bookings" element={<UserRoute><PublicLayout><LazyPage><MyBookings /></LazyPage></PublicLayout></UserRoute>} />
      <Route path="/profile" element={<UserRoute><PublicLayout><LazyPage><Profile /></LazyPage></PublicLayout></UserRoute>} />

      {/* ============ ADMIN ROUTES ============ */}
      <Route path="/admin/dashboard" element={<AdminRoute><LazyPage><AdminDashboard /></LazyPage></AdminRoute>} />
      <Route path="/admin/hotels" element={<AdminRoute><LazyPage><AdminHotels /></LazyPage></AdminRoute>} />
      <Route path="/admin/hotels/:hotelId/rooms" element={<AdminRoute><LazyPage><AdminRoomTypes /></LazyPage></AdminRoute>} />
      <Route path="/admin/visitors" element={<AdminRoute><LazyPage><AdminVisitors /></LazyPage></AdminRoute>} />
      <Route path="/admin/bookings" element={<AdminRoute><LazyPage><AdminBookings /></LazyPage></AdminRoute>} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

const ScrollRevealManager = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);

    const handleReveal = () => {
      const reveals = document.querySelectorAll('.reveal');
      reveals.forEach((el) => {
        const windowHeight = window.innerHeight;
        const elementTop = el.getBoundingClientRect().top;
        const elementVisible = 50;
        if (elementTop < windowHeight - elementVisible) {
          el.classList.add('active');
        }
      });
    };

    window.setTimeout(() => {
      animate('.flow-animate, .reveal.active', {
        opacity: [0, 1],
        translateY: [14, 0],
        scale: [0.985, 1],
        duration: 520,
        delay: stagger(45),
        ease: 'outCubic',
      });
    }, 80);

    window.addEventListener('scroll', handleReveal);
    // Initial run to reveal elements already in view
    setTimeout(handleReveal, 100);
    return () => window.removeEventListener('scroll', handleReveal);
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
    <div className={`flash-toast ${flash.type === 'danger' ? 'danger' : ''}`} role="status" aria-live="polite">
      <p className="flash-toast-title">NgiNep</p>
      <p className="flash-toast-message">{message}</p>
    </div>,
    document.body
  );
};

function App() {
  return (
    <PreferencesProvider>
      <AuthProvider>
        <Router>
          <ScrollRevealManager />
          <FlashToast />
          <AppRoutes />
        </Router>
      </AuthProvider>
    </PreferencesProvider>
  );
}

export default App;
