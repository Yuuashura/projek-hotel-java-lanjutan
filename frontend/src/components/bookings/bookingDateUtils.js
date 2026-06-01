export const toDateInputValue = (date) => {
  const localDate = new Date(date);
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  return localDate.toISOString().split('T')[0];
};

export const addDays = (dateString, days) => {
  if (!dateString) return '';
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
};

export const dateFromInput = (value) => new Date(`${value}T00:00:00`);

export const isBeforeDate = (value, minValue) => {
  if (!value || !minValue) return false;
  return dateFromInput(value) < dateFromInput(minValue);
};

export const monthLabel = (date) => date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

export const getCalendarCells = (monthDate) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const start = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      value: toDateInputValue(date),
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
    };
  });
};
