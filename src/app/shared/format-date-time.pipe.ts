import { Pipe, PipeTransform } from '@angular/core';

function parseDate(value: string): Date | null {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    const date = new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
    return date.getFullYear() === Number(dateOnly[1]) &&
      date.getMonth() === Number(dateOnly[2]) - 1 &&
      date.getDate() === Number(dateOnly[3])
      ? date
      : null;
  }

  const monthDay = /^([A-Za-z]+)\s+(\d{1,2})(?:,?\s+(\d{4}))?$/.exec(value);
  if (monthDay) {
    const date = new Date(
      `${monthDay[1]} ${monthDay[2]}, ${monthDay[3] || new Date().getFullYear()}`,
    );
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatTime(value: string): string {
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?(?:\s*(AM|PM))?$/i.exec(value.trim());
  if (!match) return value;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();
  if (minute > 59 || hour > (meridiem ? 12 : 23) || hour < (meridiem ? 1 : 0)) return value;

  const hour24 = meridiem
    ? (hour % 12) + (meridiem === 'PM' ? 12 : 0)
    : hour;
  const displayHour = hour24 % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, '0')} ${hour24 < 12 ? 'AM' : 'PM'}`;
}

@Pipe({ name: 'displayDate', standalone: true })
export class DisplayDatePipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) return '—';
    const date = value instanceof Date ? value : parseDate(value);
    return date
      ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : String(value);
  }
}

@Pipe({ name: 'displayTime', standalone: true })
export class DisplayTimePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '—';
    const range = /^(.+?)\s*[–—-]\s*(.+)$/.exec(value.trim());
    if (range) return `${formatTime(range[1])}–${formatTime(range[2])}`;
    return formatTime(value);
  }
}
