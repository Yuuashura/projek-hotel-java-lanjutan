import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

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
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ROLE_USER') return <Navigate to="/admin/dashboard" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ROLE_ADMIN_HOTEL' && user.role !== 'ROLE_ADMIN_APP') return <Navigate to="/" replace />;
  return children;
};

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

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollRevealManager />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
