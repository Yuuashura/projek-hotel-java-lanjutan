import { Clock, X } from 'lucide-react';

const PaymentTimerBanner = ({ timeLeft, formatCountdown }) => {
  if (timeLeft > 0) {
    const urgent = timeLeft < 3600;

    return (
      <div style={{ background: urgent ? '#FFF5F5' : '#FFFDF3', border: `1px solid ${urgent ? '#FEB2B2' : '#FEEBC8'}`, padding: '1.25rem 1.5rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: 'var(--radius-sm)' }}>
        <Clock size={24} style={{ color: urgent ? '#E53E3E' : '#DD6B20', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-muted)', letterSpacing: '1px' }}>Sisa Waktu Pembayaran</div>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '1.5rem', color: urgent ? '#E53E3E' : '#DD6B20', marginTop: '0.15rem' }}>
            {formatCountdown(timeLeft)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', padding: '1.25rem 1.5rem', marginBottom: '2.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', borderRadius: 'var(--radius-sm)' }}>
      <X size={20} style={{ color: '#E53E3E', flexShrink: 0 }} />
      <span style={{ fontWeight: 300, color: '#C53030', fontSize: '0.9rem' }}>Batas waktu pembayaran telah habis. Silakan buat pesanan baru.</span>
    </div>
  );
};

export default PaymentTimerBanner;
