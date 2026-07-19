import { useState } from 'react';
import type { DateRange } from 'react-day-picker';

import { CalendarIcon, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn, formatDate } from '@/lib/utils';

interface OrdersDateRangeFilterProps {
  dateFrom?: string;
  dateTo?: string;
  onChange: (dateFrom: string | undefined, dateTo: string | undefined) => void;
}

/** Local calendar date as `YYYY-MM-DD` — never UTC-shifted like `toISOString()`. */
function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fromISODate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

interface Preset {
  label: string;
  range: () => DateRange;
}

const PRESETS: Preset[] = [
  {
    label: 'Today',
    range: () => {
      const today = startOfDay(new Date());
      return { from: today, to: today };
    },
  },
  {
    label: 'Yesterday',
    range: () => {
      const yesterday = startOfDay(new Date());
      yesterday.setDate(yesterday.getDate() - 1);
      return { from: yesterday, to: yesterday };
    },
  },
  {
    label: 'Last 7 days',
    range: () => {
      const today = startOfDay(new Date());
      const from = new Date(today);
      from.setDate(from.getDate() - 6);
      return { from, to: today };
    },
  },
  {
    label: 'Last 30 days',
    range: () => {
      const today = startOfDay(new Date());
      const from = new Date(today);
      from.setDate(from.getDate() - 29);
      return { from, to: today };
    },
  },
  {
    label: 'This month',
    range: () => {
      const today = startOfDay(new Date());
      return {
        from: new Date(today.getFullYear(), today.getMonth(), 1),
        to: today,
      };
    },
  },
  {
    label: 'Last month',
    range: () => {
      const today = startOfDay(new Date());
      return {
        from: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        to: new Date(today.getFullYear(), today.getMonth(), 0),
      };
    },
  },
];

/**
 * Stripe-style date filter: a chip-like trigger button (showing the active
 * range as `DD/MM/YYYY`, always — see `formatDate`) opening a popover with
 * quick presets alongside a range calendar. Replaces plain native
 * `<input type="date">` fields specifically so the displayed format is
 * fully under our control instead of the browser/OS locale's.
 */
export function OrdersDateRangeFilter({
  dateFrom,
  dateTo,
  onChange,
}: OrdersDateRangeFilterProps) {
  const [open, setOpen] = useState(false);

  const selected: DateRange | undefined = dateFrom
    ? {
        from: fromISODate(dateFrom),
        to: dateTo ? fromISODate(dateTo) : undefined,
      }
    : undefined;

  const applyRange = (range: DateRange | undefined) => {
    onChange(
      range?.from ? toISODate(range.from) : undefined,
      range?.to ? toISODate(range.to) : undefined,
    );
  };

  const hasFilter = !!dateFrom;
  const label = !dateFrom
    ? 'Date range'
    : dateTo && dateTo !== dateFrom
      ? `${formatDate(fromISODate(dateFrom))} – ${formatDate(fromISODate(dateTo))}`
      : formatDate(fromISODate(dateFrom));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn('justify-start font-normal', hasFilter && 'pr-2')}
        >
          <CalendarIcon className="size-4" />
          {label}
          {hasFilter && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear date range"
              onClick={(e) => {
                e.stopPropagation();
                applyRange(undefined);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  applyRange(undefined);
                }
              }}
              className="hover:bg-accent-foreground/10 ml-1 rounded-sm p-0.5"
            >
              <X className="size-3.5" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-col gap-1 border-b p-2 sm:w-40 sm:border-r sm:border-b-0">
            {PRESETS.map((preset) => (
              <Button
                key={preset.label}
                type="button"
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => {
                  applyRange(preset.range());
                  setOpen(false);
                }}
              >
                {preset.label}
              </Button>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => {
                applyRange(undefined);
                setOpen(false);
              }}
            >
              All time
            </Button>
          </div>
          <Calendar
            mode="range"
            selected={selected}
            onSelect={(range) => {
              applyRange(range);
              if (range?.from && range?.to) setOpen(false);
            }}
            numberOfMonths={1}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
