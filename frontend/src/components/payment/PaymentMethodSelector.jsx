import { PAYMENT_METHODS, qrisImg } from './paymentMethods';

const PaymentMethodSelector = ({ value, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
    {PAYMENT_METHODS.map(method => {
      const isChecked = value === method.id;

      return (
        <label
          key={method.id}
          style={{
            display: 'flex',
            gap: '1rem',
            padding: '1.25rem',
            cursor: 'pointer',
            borderRadius: 'var(--radius-sm)',
            border: isChecked ? '1px solid var(--color-primary)' : '1px solid var(--color-accent)',
            background: isChecked ? 'rgba(212,175,55,0.02)' : 'var(--color-surface)',
            transition: 'all 0.3s ease',
          }}
        >
          <input
            type="radio"
            name="payment"
            value={method.id}
            checked={isChecked}
            onChange={() => onChange(method.id)}
            style={{ accentColor: 'var(--color-primary)', marginTop: 5, width: 16, height: 16, flexShrink: 0 }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500, fontSize: '0.95rem', color: 'var(--color-text)' }}>
              {method.logo}
              <span>{method.label}</span>
            </div>
            <div style={{ color: 'var(--color-muted)', fontSize: '0.8rem', fontWeight: 300 }}>{method.info}</div>
          </div>
        </label>
      );
    })}

    {value === 'QRIS' && (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', background: '#F8FAFC', padding: '1.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-accent)', marginTop: '0.5rem', animation: 'fadeIn 0.4s ease' }}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>QRIS NgiNep Corp</div>
        <div style={{ background: 'white', padding: '0.75rem', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-sm)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <img src={qrisImg} alt="QRIS" style={{ width: '270px', height: '350px', borderRadius: 'var(--radius-sm)' }} />
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', textAlign: 'center' }}>Scan QR di atas dengan aplikasi bank atau e-wallet pilihan Anda</div>
      </div>
    )}
  </div>
);

export default PaymentMethodSelector;
