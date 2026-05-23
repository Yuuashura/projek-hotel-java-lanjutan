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
    case 'PENDING': return { bg: 'rgba(212,175,55,0.1)', color: 'var(--color-primary)', label: 'Menunggu Pembayaran' };
    case 'CONFIRMED': return { bg: 'rgba(72,187,120,0.1)', color: '#276749', label: 'Dikonfirmasi' };
    case 'CANCELLED': return { bg: 'rgba(229,62,62,0.1)', color: '#9B2C2C', label: 'Dibatalkan' };
    case 'COMPLETED': return { bg: 'var(--color-accent)', color: 'var(--color-text)', label: 'Selesai' };
    default: return { bg: 'var(--color-accent)', color: 'var(--color-text)', label: status };
  }
};
