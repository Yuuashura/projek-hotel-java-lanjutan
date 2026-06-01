import { Calendar, Hotel, LayoutDashboard, Users } from 'lucide-react';

export const adminMenu = [
  { path: '/admin/dashboard', labelKey: 'admin.menu.dashboard', icon: LayoutDashboard },
  { path: '/admin/hotels', labelKey: 'admin.menu.hotels', icon: Hotel },
  { path: '/admin/visitors', labelKey: 'admin.menu.visitors', icon: Users },
  { path: '/admin/bookings', labelKey: 'admin.menu.bookings', icon: Calendar },
];
