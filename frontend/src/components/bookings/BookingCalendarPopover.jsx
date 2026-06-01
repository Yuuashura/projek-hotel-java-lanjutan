import { getCalendarCells, isBeforeDate, monthLabel } from './bookingDateUtils';

const BookingCalendarPopover = ({ month, setMonth, selected, minDate, onSelect }) => {
  const cells = getCalendarCells(month);
  const weekdays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const changeMonth = (offset) => {
    setMonth(current => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  return (
    <div className="booking-calendar-popover">
      <div className="booking-calendar-head">
        <button type="button" onClick={() => changeMonth(-1)} aria-label="Bulan sebelumnya">
          {'<'}
        </button>
        <strong>{monthLabel(month)}</strong>
        <button type="button" onClick={() => changeMonth(1)} aria-label="Bulan berikutnya">
          {'>'}
        </button>
      </div>

      <div className="booking-calendar-week" aria-hidden="true">
        {weekdays.map(day => <span key={day}>{day}</span>)}
      </div>

      <div className="booking-calendar-grid">
        {cells.map(cell => {
          const disabled = isBeforeDate(cell.value, minDate);
          return (
            <button
              type="button"
              key={cell.value}
              className={[
                'booking-calendar-day',
                !cell.isCurrentMonth ? 'is-muted' : '',
                selected === cell.value ? 'is-selected' : '',
                disabled ? 'is-disabled' : '',
              ].filter(Boolean).join(' ')}
              disabled={disabled}
              onClick={() => onSelect(cell.value)}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BookingCalendarPopover;
