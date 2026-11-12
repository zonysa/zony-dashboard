"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type { DateRange };

interface DateRangePickerProps {
  range?: DateRange;
  onSelect?: (range: DateRange | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/** Range sibling of DatePicker. One month shown, so it fits a phone. */
export function DateRangePicker({
  range,
  onSelect,
  placeholder = "Pick a date range",
  disabled = false,
  className,
}: DateRangePickerProps) {
  const label = range?.from
    ? range.to && range.to.getTime() !== range.from.getTime()
      ? `${format(range.from, "d MMM yyyy")} – ${format(range.to, "d MMM yyyy")}`
      : format(range.from, "d MMM yyyy")
    : null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !label && "text-muted-foreground",
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">{label ?? placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={range}
          onSelect={onSelect}
          defaultMonth={range?.from}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
