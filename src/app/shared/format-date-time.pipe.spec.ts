import { DisplayDatePipe, DisplayTimePipe } from './format-date-time.pipe';

describe('DisplayDatePipe', () => {
  const pipe = new DisplayDatePipe();

  it('formats ISO date-only strings in month-day-year order', () => {
    expect(pipe.transform('2026-11-09')).toBe('November 9, 2026');
  });

  it('adds the current year to legacy month-day dates', () => {
    expect(pipe.transform('Nov 09')).toBe(`November 9, ${new Date().getFullYear()}`);
  });

  it('returns a placeholder for missing values and preserves invalid input', () => {
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform('not a date')).toBe('not a date');
  });
});

describe('DisplayTimePipe', () => {
  const pipe = new DisplayTimePipe();

  it('formats 24-hour times as AM and PM', () => {
    expect(pipe.transform('08:05:00')).toBe('8:05 AM');
    expect(pipe.transform('13:30')).toBe('1:30 PM');
    expect(pipe.transform('00:00')).toBe('12:00 AM');
    expect(pipe.transform('12:00')).toBe('12:00 PM');
  });

  it('formats time ranges and leaves invalid values unchanged', () => {
    expect(pipe.transform('08:00–17:30')).toBe('8:00 AM–5:30 PM');
    expect(pipe.transform('—')).toBe('—');
    expect(pipe.transform(null)).toBe('—');
  });
});
