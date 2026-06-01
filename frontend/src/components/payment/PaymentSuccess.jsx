import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const PaymentSuccess = () => (
  <div className="payment-success-shell" style={{ maxWidth: 520, margin: '6rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
    <div className="card" style={{ padding: '3.5rem 2.5rem', border: '1px solid var(--color-accent)' }}>
      <div style={{ width: 64, height: 64, background: 'rgba(72,187,120,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
        <Check size={32} style={{ color: '#38A169' }} />
      </div>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '0.75rem', fontWeight: 300 }}>Pembayaran Dikirim</h2>
      <p style={{ color: 'var(--color-muted)', fontWeight: 300, lineHeight: 1.7, marginBottom: '2.5rem', fontSize: '0.9rem' }}>
        Bukti transfer Anda telah kami terima dan sedang dalam proses verifikasi oleh Admin Hotel. Voucher menginap Anda akan aktif dalam 1x24 jam.
      </p>
      <Link to="/my-bookings" className="btn btn-dark btn-full" style={{ justifyContent: 'center', height: 50 }}>Lihat Pesanan Saya</Link>
    </div>
  </div>
);

export default PaymentSuccess;
