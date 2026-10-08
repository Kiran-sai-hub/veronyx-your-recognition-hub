import { format, isValid, parse } from "date-fns";
import { CalendarDays } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/** DD/MM/YYYY, the default date format for India (checklist §7.1, §8.4). */
export const DATE_FORMAT = "dd/MM/yyyy";

export function formatDmy(date: Date | undefined): string {
  return date && isValid(date) ? format(date, DATE_FORMAT) : "";
}

export function parseDmy(value: string): Date | undefined {
  const date = parse(value, DATE_FORMAT, new Date());
  return isValid(date) ? date : undefined;
}

/** Single date picker. Shows DD/MM/YYYY; the calendar opens on click. */
export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "DD/MM/YYYY",
  min,
  max,
  className,
  "aria-label": ariaLabel,
}: {
  id?: string | undefined;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  min?: Date | undefined;
  max?: Date | undefined;
  className?: string | undefined;
  "aria-label"?: string | undefined;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          aria-label={ariaLabel}
          className={cn(
            "w-full justify-start font-normal sm:w-44",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarDays className="size-4" />
          {value ? formatDmy(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          {...(value ? { defaultMonth: value } : {})}
          onSelect={(d) => {
            onChange(d);
            setOpen(false);
          }}
          disabled={[...(min ? [{ before: min }] : []), ...(max ? [{ after: max }] : [])]}
          weekStartsOn={1}
        />
      </PopoverContent>
    </Popover>
  );
}

/** Date range picker: DD/MM/YYYY – DD/MM/YYYY with a two-month calendar. */
export function DateRangePicker({
  id,
  value,
  onChange,
  placeholder = "DD/MM/YYYY – DD/MM/YYYY",
  className,
  "aria-label": ariaLabel,
}: {
  id?: string | undefined;
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string | undefined;
  "aria-label"?: string | undefined;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          aria-label={ariaLabel}
          className={cn(
            "w-full justify-start font-normal sm:w-64",
            !value?.from && "text-muted-foreground",
            className,
          )}
        >
          <CalendarDays className="size-4" />
          {value?.from
            ? `${formatDmy(value.from)} – ${value.to ? formatDmy(value.to) : "…"}`
            : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={value}
          {...(value?.from ? { defaultMonth: value.from } : {})}
          onSelect={onChange}
          numberOfMonths={2}
          weekStartsOn={1}
        />
      </PopoverContent>
    </Popover>
  );
}
