import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Always `DD/MM/YYYY`, independent of the viewer's browser/OS locale —
 * `toLocaleDateString('en-IN')` doesn't zero-pad and isn't guaranteed
 * day-first on every machine, which is what this exists to avoid.
 */
export function formatDate(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${d.getFullYear()}`;
}

/** `formatDate` plus a locale-formatted time, e.g. "19/07/2026, 3:45 pm". */
export function formatDateTime(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  const time = d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${formatDate(d)}, ${time}`;
}
