import { formatCurrency } from '../../utils/formatters';

const PaymentSummaryCard = ({ nights, totalPrice }) => (
  <div className="payment-summary-sticky" style={{ position: 'sticky', top: 120 }}>
    <div className="payment-summary-card flow-animate" style={{ background: '#F7FAFC', border: '1px solid var(--color-accent)', padding: '2rem', borderRadius: 'var(--radius-sm)' }}>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--color-text)', borderBottom: '1px solid var(--color-accent)', paddingBottom: '0.75rem', fontWeight: 300 }}>Total Tagihan</h3>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
        <span>Suite & Nights</span>
        <span>{nights} malam</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--color-text)', borderTop: '1px solid var(--color-accent)', paddingTop: '1rem', fontWeight: 300 }}>
        <span>Total</span>
        <span style={{ color: 'var(--color-primary)' }}>{formatCurrency(totalPrice)}</span>
      </div>

      <div style={{ display: 'block', textAlign: 'center', marginTop: '1.5rem' }}>
        <span className="badge" style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--color-primary)', borderColor: 'transparent', width: '100%', height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          AWAITING PAYMENT VERIFICATION
        </span>
      </div>
    </div>
  </div>
);

export default PaymentSummaryCard;
