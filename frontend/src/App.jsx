import React from 'react';
import { createPortal } from 'react-dom';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PreferencesProvider } from './context/PreferencesContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingState from './components/LoadingState';
import { usePreferences } from './context/PreferencesContext';

// === Public Pages ===
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import VerifyOtp from './pages/public/VerifyOtp';
import Hotels from './pages/public/Hotels';
import HotelDetail from './pages/public/HotelDetail';
import About from './pages/public/About';

// === User Pages ===
import Booking from './pages/user/Booking';
import Payment from './pages/user/Payment';
import MyBookings from './pages/user/MyBookings';
import Profile from './pages/user/Profile';

// === Admin Pages ===
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminHotels from './pages/admin/AdminHotels';
import AdminVisitors from './pages/admin/AdminVisitors';
import AdminBookings from './pages/admin/AdminBookings';
import AdminRoomTypes from './pages/admin/AdminRoomTypes';

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

// ==========================================
// Public Layout (Navbar + Footer)
// ==========================================
const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
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
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/hotels" element={<PublicLayout><Hotels /></PublicLayout>} />
      <Route path="/hotels/:id" element={<PublicLayout><HotelDetail /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />

      {/* Auth (No Layout) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />

      {/* ============ USER ROUTES ============ */}
      <Route path="/booking/:hotelId" element={<UserRoute><PublicLayout><Booking /></PublicLayout></UserRoute>} />
      <Route path="/payment/:bookingId" element={<UserRoute><PublicLayout><Payment /></PublicLayout></UserRoute>} />
      <Route path="/my-bookings" element={<UserRoute><PublicLayout><MyBookings /></PublicLayout></UserRoute>} />
      <Route path="/profile" element={<UserRoute><PublicLayout><Profile /></PublicLayout></UserRoute>} />

      {/* ============ ADMIN ROUTES ============ */}
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/hotels" element={<AdminRoute><AdminHotels /></AdminRoute>} />
      <Route path="/admin/hotels/:hotelId/rooms" element={<AdminRoute><AdminRoomTypes /></AdminRoute>} />
      <Route path="/admin/visitors" element={<AdminRoute><AdminVisitors /></AdminRoute>} />
      <Route path="/admin/bookings" element={<AdminRoute><AdminBookings /></AdminRoute>} />

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
