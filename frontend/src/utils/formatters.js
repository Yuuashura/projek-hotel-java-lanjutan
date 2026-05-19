// src/utils/formatters.js
export const formatCurrency = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });

export const formatDateShort = (dateStr) =>
  new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

export const diffDays = (checkIn, checkOut) => {
  const a = new Date(checkIn), b = new Date(checkOut);
  return Math.max(1, Math.round((b - a) / (1000 * 60 * 60 * 24)));
};

export const statusColor = (status) => {
  switch (status) {
    case 'PENDING': return { bg: 'var(--neo-yellow)', color: 'var(--neo-dark)', label: 'Menunggu Pembayaran' };
    case 'CONFIRMED': return { bg: 'var(--neo-green)', color: 'var(--neo-dark)', label: 'Dikonfirmasi' };
    case 'CANCELLED': return { bg: 'var(--neo-pink)', color: 'white', label: 'Dibatalkan' };
    case 'COMPLETED': return { bg: '#6b7280', color: 'white', label: 'Selesai' };
    default: return { bg: '#e5e7eb', color: 'var(--neo-dark)', label: status };
  }
};
