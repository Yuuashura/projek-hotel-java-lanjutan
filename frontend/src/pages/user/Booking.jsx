import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, Users, User, Phone, Mail, Hotel, ArrowRight, AlertCircle } from 'lucide-react';
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
      setForm(f => ({ ...f, orderer_name: `${user.first_name} ${user.last_name}`.trim(), orderer_phone: user.phone || '', orderer_email: user.email || '' }));
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

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', fontFamily: 'Space Grotesk', fontWeight: 700 }}>Memuat...</div>;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, textTransform: 'uppercase', fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', marginBottom: '2rem' }}>Form Pemesanan</h1>

      {error && (
        <div style={{ background: '#fff0f3', border: '3px solid var(--neo-pink)', padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.6rem', boxShadow: '4px 4px 0px 0px var(--neo-pink)' }}>
          <AlertCircle size={18} style={{ color: 'var(--neo-pink)', flexShrink: 0 }} />
          <span style={{ fontWeight: 600, color: '#be123c', fontSize: '0.875rem' }}>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Left: Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Tanggal & Tamu */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.95rem', marginBottom: '1.25rem', borderBottom: '2px solid var(--neo-dark)', paddingBottom: '0.75rem' }}>
              <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />Detail Menginap
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="label">Check-In *</label>
                <input type="date" className="input" min={today} value={form.check_in} onChange={e => setForm(f => ({ ...f, check_in: e.target.value, check_out: f.check_out && f.check_out <= e.target.value ? '' : f.check_out }))} required />
              </div>
              <div>
                <label className="label">Check-Out *</label>
                <input type="date" className="input" min={form.check_in || today} value={form.check_out} onChange={e => setForm(f => ({ ...f, check_out: e.target.value }))} required />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="label">Tipe Kamar *</label>
                <select className="input" value={form.room_type_id} onChange={e => setForm(f => ({ ...f, room_type_id: parseInt(e.target.value) }))} required>
                  {rooms.map(r => <option key={r.id_room_type} value={r.id_room_type}>{r.name} — {formatCurrency(r.price_per_night)}/malam</option>)}
                </select>
              </div>
              <div>
                <label className="label">Jumlah Tamu *</label>
                <input type="number" className="input" min={1} max={selectedRoom?.max_guest || 10} value={form.number_of_guest} onChange={e => setForm(f => ({ ...f, number_of_guest: parseInt(e.target.value) }))} required />
              </div>
            </div>
          </div>

          {/* Data Pemesan */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.95rem', marginBottom: '1.25rem', borderBottom: '2px solid var(--neo-dark)', paddingBottom: '0.75rem' }}>
              <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />Data Pemesan
            </h3>

            {/* Checkbox for self */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
              {[{ val: true, label: 'Pesan untuk diri saya' }, { val: false, label: 'Pesan untuk orang lain' }].map(({ val, label }) => (
                <label key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' }}>
                  <input type="radio" checked={form.for_self === val} onChange={() => setForm(f => ({ ...f, for_self: val }))} style={{ accentColor: 'var(--neo-orange)', width: 18, height: 18 }} />
                  {label}
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label">Nama Lengkap Pemesan *</label>
                <input className="input" placeholder="Nama sesuai identitas" value={form.orderer_name} onChange={e => setForm(f => ({ ...f, orderer_name: e.target.value }))} required disabled={form.for_self} style={{ background: form.for_self ? '#f3f4f6' : 'white' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="label">No. Telepon *</label>
                  <input type="tel" className="input" placeholder="08..." value={form.orderer_phone} onChange={e => setForm(f => ({ ...f, orderer_phone: e.target.value }))} required disabled={form.for_self} style={{ background: form.for_self ? '#f3f4f6' : 'white' }} />
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input type="email" className="input" placeholder="email@..." value={form.orderer_email} onChange={e => setForm(f => ({ ...f, orderer_email: e.target.value }))} required disabled={form.for_self} style={{ background: form.for_self ? '#f3f4f6' : 'white' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.95rem', marginBottom: '1.25rem', borderBottom: '2px solid var(--neo-dark)', paddingBottom: '0.75rem' }}>Ringkasan Pesanan</h3>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: 56, height: 56, border: '3px solid var(--neo-dark)', overflow: 'hidden', flexShrink: 0 }}>
                <img src={hotel?.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=100'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontFamily: 'Space Grotesk', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.9rem' }}>{hotel?.name}</div>
                <div style={{ color: '#6b7280', fontWeight: 500, fontSize: '0.8rem' }}>{hotel?.city?.name}</div>
              </div>
            </div>

            {selectedRoom && (
              <div style={{ background: 'var(--neo-light)', border: '2px solid var(--neo-dark)', padding: '1rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                <div style={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>{selectedRoom.name}</span>
                </div>
                {form.check_in && <div style={{ color: '#6b7280', fontWeight: 500 }}>📅 {formatDate(form.check_in)} → {form.check_out ? formatDate(form.check_out) : '?'}</div>}
                {nights > 0 && <div style={{ color: '#6b7280', fontWeight: 500 }}>🌙 {nights} malam</div>}
                <div style={{ color: '#6b7280', fontWeight: 500 }}>👤 {form.number_of_guest} tamu</div>
              </div>
            )}

            {nights > 0 && selectedRoom && (
              <div style={{ borderTop: '2px dashed var(--neo-dark)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                  <span>{formatCurrency(selectedRoom.price_per_night)} × {nights} malam</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1.1rem', borderTop: '2px solid var(--neo-dark)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                  <span>TOTAL</span>
                  <span style={{ color: 'var(--neo-orange)' }}>{formatCurrency(totalPrice)}</span>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-orange btn-full" disabled={submitting} style={{ marginTop: '1.25rem', justifyContent: 'center', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Memproses...' : <>Lanjut ke Pembayaran <ArrowRight size={16} /></>}
            </button>
          </div>
        </div>
      </form>

      <style>{`
        @media (max-width: 768px) { form { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
};

export default Booking;
