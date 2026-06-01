import { CalendarDays } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import BookingCalendarPopover from './BookingCalendarPopover';

const getRoomAvailability = (room) => Number(room?.room_available ?? room?.roomAvailable ?? 0);

const DateCard = ({ field, label, helper, value, openCalendar, calendarMonth, setCalendarMonth, minDate, onOpen, onSelect }) => (
  <div className={`booking-date-card ${openCalendar === field ? 'is-open' : ''}`} style={{ zIndex: 2 }}>
    <div className="booking-date-icon"><CalendarDays size={18} /></div>
    <div className="booking-date-body">
      <label>{label}</label>
      <button type="button" className="booking-date-trigger" onClick={() => onOpen(field)}>
        {value ? formatDate(value) : 'Pilih tanggal'}
      </button>
      <span>{value ? formatDate(value) : helper}</span>
    </div>
    {openCalendar === field && (
      <BookingCalendarPopover
        month={calendarMonth}
        setMonth={setCalendarMonth}
        selected={value}
        minDate={minDate}
        onSelect={selected => onSelect(field, selected)}
      />
    )}
  </div>
);

const BookingStayDetails = ({
  form,
  setForm,
  rooms,
  selectedRoom,
  selectedRoomUnavailable,
  openCalendar,
  calendarMonth,
  setCalendarMonth,
  today,
  checkOutMin,
  onOpenCalendar,
  onSelectDate,
}) => (
  <div className="booking-panel" style={{ zIndex: 2 }}>
    <div className="booking-section-title">
      <CalendarDays size={18} />
      <div>
        <span>Langkah 1</span>
        <h3>Detail Menginap</h3>
      </div>
    </div>

    <div className="booking-date-grid">
      <DateCard
        field="check_in"
        label="Check-In"
        helper="Pilih tanggal datang"
        value={form.check_in}
        openCalendar={openCalendar}
        calendarMonth={calendarMonth}
        setCalendarMonth={setCalendarMonth}
        minDate={today}
        onOpen={onOpenCalendar}
        onSelect={onSelectDate}
      />
      <DateCard
        field="check_out"
        label="Check-Out"
        helper="Otomatis esok hari"
        value={form.check_out}
        openCalendar={openCalendar}
        calendarMonth={calendarMonth}
        setCalendarMonth={setCalendarMonth}
        minDate={checkOutMin}
        onOpen={onOpenCalendar}
        onSelect={onSelectDate}
      />
    </div>

    <div className="booking-field-grid">
      <div>
        <label className="label">Tipe Kamar *</label>
        <select className="input booking-solid-input" value={form.room_type_id} onChange={e => setForm(f => ({ ...f, room_type_id: parseInt(e.target.value) }))} required>
          {rooms.map(room => {
            const available = getRoomAvailability(room);
            return (
              <option key={room.id_room_type} value={room.id_room_type} disabled={available <= 0}>
                {room.name}{available <= 0 ? ' - Tidak tersedia' : ` - ${available} tersedia`}
              </option>
            );
          })}
        </select>
        {selectedRoomUnavailable && (
          <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 400 }}>
            Tipe kamar ini sedang tidak tersedia. Silakan pilih tipe kamar lain.
          </p>
        )}
      </div>
      <div>
        <label className="label">Jumlah Tamu *</label>
        <input type="number" className="input booking-solid-input" min={1} max={selectedRoom?.max_guest || 10} value={form.number_of_guest} onChange={e => setForm(f => ({ ...f, number_of_guest: parseInt(e.target.value) }))} required />
      </div>
    </div>
  </div>
);

export { getRoomAvailability };
export default BookingStayDetails;
