import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, Users, User, Phone, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate, diffDays } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const Booking = () => {
  const { hotelId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [form, setForm] = useState({
    room_type_id: parseInt(searchParams.get('roomTypeId')) || '',
    check_in: searchParams.get('checkIn') || tomorrow,
    check_out: searchParams.get('checkOut') || '',
    number_of_guest: parseInt(searchParams.get('guests')) || 1,
    for_self: true,
    orderer_name: '',
    orderer_phone: '',
    orderer_email: '',
  });

  // Focus states for custom input floating label animation
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'ROLE_USER') navigate('/login');
  }, [user]);

  useEffect(() => {
    Promise.all([
      api.get(`/api/hotels/${hotelId}`),
      api.get(`/api/room-types/hotel/${hotelId}`)
    ]).then(([hotelRes, roomsRes]) => {
      setHotel(hotelRes.data.data);
      setRooms(roomsRes.data.data || []);
      if (!form.room_type_id && roomsRes.data.data?.length > 0) {
        setForm(f => ({ ...f, room_type_id: roomsRes.data.data[0].id_room_type }));
      }
    }).catch(() => navigate('/hotels')).finally(() => setLoading(false));
  }, [hotelId]);

  // Auto-fill for self
  useEffect(() => {
    if (form.for_self && user) {
      setForm(f => ({ 
        ...f, 
        orderer_name: `${user.first_name} ${user.last_name}`.trim(), 
        orderer_phone: user.phone || '', 
        orderer_email: user.email || '' 
      }));
    } else if (!form.for_self) {
      setForm(f => ({ ...f, orderer_name: '', orderer_phone: '', orderer_email: '' }));
    }
  }, [form.for_self, user]);

  const selectedRoom = rooms.find(r => r.id_room_type === parseInt(form.room_type_id));
  const nights = form.check_in && form.check_out ? diffDays(form.check_in, form.check_out) : 0;
  const totalPrice = selectedRoom ? selectedRoom.price_per_night * Math.max(nights, 1) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.check_out) return setError('Pilih tanggal check-out terlebih dahulu');
    if (form.check_out <= form.check_in) return setError('Tanggal check-out harus setelah check-in');
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/api/bookings', {
        hotel_id: parseInt(hotelId),
        room_type_id: parseInt(form.room_type_id),
        check_in: form.check_in,
        check_out: form.check_out,
        number_of_guest: form.number_of_guest,
        total_price: totalPrice,
        orderer_name: form.orderer_name,
        orderer_phone: form.orderer_phone,
        orderer_email: form.orderer_email,
        is_for_self: form.for_self,
      });
      const bookingId = res.data.data?.id_booking;
      navigate(`/payment/${bookingId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat pemesanan. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-muted)' }}>Memuat...</span>
      </div>
    );
  }

  // Helper styles for floating inputs
  const getInputStyle = (name) => ({
    width: '100%',
    height: 56,
    border: 'none',
    borderBottom: focusedField === name || form[name] ? '1px solid var(--color-text)' : '1px solid var(--color-muted)',
    background: 'transparent',
    color: 'var(--color-text)',
    outline: 'none',
    fontSize: '1rem',
    fontWeight: 300,
    transition: 'all 0.3s ease',
    padding: '1.25rem 0 0.25rem'
  });

  const getLabelStyle = (name) => ({
    position: 'absolute',
    left: 0,
    top: focusedField === name || form[name] ? 0 : 20,
    fontSize: focusedField === name || form[name] ? '0.75rem' : '0.95rem',
    color: focusedField === name || form[name] ? 'var(--color-text)' : 'var(--color-muted)',
    transition: 'all 0.3s ease',
    pointerEvents: 'none',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  });

  return (
    <div style={{ background: 'var(--color-background)', minHeight: '100vh', padding: '6rem 1.5rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '2.5rem', marginBottom: '3rem', color: 'var(--color-text)' }}>Checkout</h1>

        {error && (
          <div className="alert-danger" style={{ padding: '1rem', marginBottom: '2.5rem', display: 'flex', gap: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
            <AlertCircle size={18} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
            <span style={{ fontWeight: 300, color: 'var(--color-danger)', fontSize: '0.9rem' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '65% 35%', gap: '4rem', alignItems: 'flex-start' }}>
          
          {/* Left Column (65%): Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            
            {/* Stay Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.6rem', color: 'var(--color-text)', borderBottom: '1px solid var(--color-accent)', paddingBottom: '0.5rem' }}>Stay Details</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div style={{ position: 'relative' }}>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-muted)', letterSpacing: '1px', display: 'block', marginBottom: '0.25rem' }}>Check-In Date *</label>
                  <input type="date" className="input" min={today} value={form.check_in} onChange={e => setForm(f => ({ ...f, check_in: e.target.value, check_out: f.check_out && f.check_out <= e.target.value ? '' : f.check_out }))} required style={{ border: 'none', borderBottom: '1px solid var(--color-accent)', background: 'transparent', borderRadius: 0, paddingLeft: 0 }} />
                </div>
                <div style={{ position: 'relative' }}>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-muted)', letterSpacing: '1px', display: 'block', marginBottom: '0.25rem' }}>Check-Out Date *</label>
                  <input type="date" className="input" min={form.check_in || today} value={form.check_out} onChange={e => setForm(f => ({ ...f, check_out: e.target.value }))} required style={{ border: 'none', borderBottom: '1px solid var(--color-accent)', background: 'transparent', borderRadius: 0, paddingLeft: 0 }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-muted)', letterSpacing: '1px', display: 'block', marginBottom: '0.25rem' }}>Suite Type *</label>
                  <select className="input" value={form.room_type_id} onChange={e => setForm(f => ({ ...f, room_type_id: parseInt(e.target.value) }))} required style={{ border: 'none', borderBottom: '1px solid var(--color-accent)', background: 'transparent', borderRadius: 0, paddingLeft: 0 }}>
                    {rooms.map(r => <option key={r.id_room_type} value={r.id_room_type}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-muted)', letterSpacing: '1px', display: 'block', marginBottom: '0.25rem' }}>Number of Guests *</label>
                  <input type="number" className="input" min={1} max={selectedRoom?.max_guest || 10} value={form.number_of_guest} onChange={e => setForm(f => ({ ...f, number_of_guest: parseInt(e.target.value) }))} required style={{ border: 'none', borderBottom: '1px solid var(--color-accent)', background: 'transparent', borderRadius: 0, paddingLeft: 0 }} />
                </div>
              </div>
            </div>

            {/* Guest Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.6rem', color: 'var(--color-text)', borderBottom: '1px solid var(--color-accent)', paddingBottom: '0.5rem' }}>Guest Details</h3>

              {/* Toggle option for self booking */}
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
                {[{ val: true, label: 'I am the guest' }, { val: false, label: 'Booking for someone else' }].map(({ val, label }) => (
                  <label key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 300, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                    <input type="radio" checked={form.for_self === val} onChange={() => setForm(f => ({ ...f, for_self: val }))} style={{ accentColor: 'var(--color-primary)', width: 16, height: 16 }} />
                    {label}
                  </label>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ position: 'relative' }}>
                  <span style={getLabelStyle('orderer_name')}>Full Name *</span>
                  <input className="input" style={getInputStyle('orderer_name')} value={form.orderer_name} 
                    onFocus={() => setFocusedField('orderer_name')}
                    onBlur={() => setFocusedField(null)}
                    onChange={e => setForm(f => ({ ...f, orderer_name: e.target.value }))} 
                    required disabled={form.for_self} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div style={{ position: 'relative' }}>
                    <span style={getLabelStyle('orderer_phone')}>Phone Number *</span>
                    <input type="tel" className="input" style={getInputStyle('orderer_phone')} value={form.orderer_phone} 
                      onFocus={() => setFocusedField('orderer_phone')}
                      onBlur={() => setFocusedField(null)}
                      onChange={e => setForm(f => ({ ...f, orderer_phone: e.target.value }))} 
                      required disabled={form.for_self} />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <span style={getLabelStyle('orderer_email')}>Email Address *</span>
                    <input type="email" className="input" style={getInputStyle('orderer_email')} value={form.orderer_email} 
                      onFocus={() => setFocusedField('orderer_email')}
                      onBlur={() => setFocusedField(null)}
                      onChange={e => setForm(f => ({ ...f, orderer_email: e.target.value }))} 
                      required disabled={form.for_self} />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (35%): Order Summary */}
          <div style={{ position: 'sticky', top: 120 }}>
            <div className="card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-accent)', padding: '2.5rem 2rem', borderRadius: 'var(--radius-sm)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--color-text)', borderBottom: '1px solid var(--color-accent)', paddingBottom: '0.75rem', fontWeight: 300 }}>Order Summary</h3>
              
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ width: 64, height: 64, overflow: 'hidden', borderRadius: 2 }}>
                  <img src={hotel?.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=150'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--color-text)', fontWeight: 300 }}>{hotel?.name}</div>
                  <div style={{ color: 'var(--color-muted)', fontSize: '0.8rem', fontWeight: 300, marginTop: '0.25rem' }}>{hotel?.city?.name}</div>
                </div>
              </div>

              {selectedRoom && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--color-muted)', borderBottom: '1px solid var(--color-accent)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text)', fontWeight: 400 }}>
                    <span>Suite Type</span>
                    <span>{selectedRoom.name}</span>
                  </div>
                  {form.check_in && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Dates</span>
                      <span>{formatDate(form.check_in)} - {form.check_out ? formatDate(form.check_out) : '?'}</span>
                    </div>
                  )}
                  {nights > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Nights</span>
                      <span>{nights} night{nights > 1 ? 's' : ''}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Guests</span>
                    <span>{form.number_of_guest} Guest{form.number_of_guest > 1 ? 's' : ''}</span>
                  </div>
                </div>
              )}

              {nights > 0 && selectedRoom && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                    <span>Base Fare</span>
                    <span>{formatCurrency(selectedRoom.price_per_night)} × {nights}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                    <span>Taxes & Fees</span>
                    <span>Included</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--color-text)', borderTop: '1px solid var(--color-accent)', paddingTop: '1rem', marginTop: '0.5rem', fontWeight: 300 }}>
                    <span>Total Price</span>
                    <span style={{ color: 'var(--color-primary)' }}>{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-full animate-float" disabled={submitting} 
                style={{ 
                  marginTop: '2rem', 
                  justifyContent: 'center', 
                  height: 56, 
                  background: 'var(--color-primary)', 
                  opacity: submitting ? 0.7 : 1,
                  animation: 'none'
                }}>
                {submitting ? 'Processing...' : 'Complete Reservation'}
              </button>
            </div>
          </div>
          
        </form>
      </div>

      <style>{`
        @media (max-width: 900px) { 
          form { grid-template-columns: 1fr !important; gap: 3rem !important; } 
        }
      `}</style>
    </div>
  );
};

export default Booking;
