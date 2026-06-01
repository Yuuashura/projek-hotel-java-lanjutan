import { User } from 'lucide-react';

const fields = [
  { key: 'orderer_name', label: 'Nama Lengkap *', type: 'text', full: true },
  { key: 'orderer_phone', label: 'Nomor Telepon *', type: 'tel' },
  { key: 'orderer_email', label: 'Alamat Email *', type: 'email' },
];

const BookingInput = ({ field, form, setForm }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
      {field.label}
    </label>
    <input
      type={field.type}
      className="input booking-solid-input"
      value={form[field.key]}
      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
      required
      disabled={form.for_self}
    />
  </div>
);

const BookingGuestDetails = ({ form, setForm }) => (
  <div className="booking-panel">
    <div className="booking-section-title">
      <User size={18} />
      <div>
        <span>Langkah 2</span>
        <h3>Data Tamu</h3>
      </div>
    </div>

    <div className="booking-guest-toggle">
      {[{ val: true, label: 'Saya tamunya' }, { val: false, label: 'Pesan untuk orang lain' }].map(({ val, label }) => (
        <label key={label} className={form.for_self === val ? 'active' : ''}>
          <input type="radio" checked={form.for_self === val} onChange={() => setForm(f => ({ ...f, for_self: val }))} />
          {label}
        </label>
      ))}
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
      <BookingInput field={fields[0]} form={form} setForm={setForm} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {fields.slice(1).map(field => <BookingInput key={field.key} field={field} form={form} setForm={setForm} />)}
      </div>
    </div>
  </div>
);

export default BookingGuestDetails;
