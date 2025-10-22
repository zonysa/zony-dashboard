import React from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { StepNavigation } from "@/forms/StepNavigation";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { BranchFormData } from "@/lib/schema/branch.schema";
import { StepComponentProps } from "@/lib/hooks/useMutliStepForm";

export const OperatingHoursStep: React.FC<
  StepComponentProps<BranchFormData>
> = ({ form, onNext, onBack, onSubmit, isFirstStep, isLastStep }) => {
  const { control, watch, setValue } = form;

  const sameHoursEveryday = watch("sameHoursEveryday");
  const is24_7 = watch("twentyFourSeven");
  const operatingHours = watch("operatingHours");

  const days = [
    "saturday",
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
  ];

  // Generate time options for AM/PM format
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const period = hour < 12 ? "AM" : "PM";
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const displayMinute = minute === 0 ? "00" : minute;
        const value = `${hour.toString().padStart(2, "0")}:${displayMinute}`;
        const label = `${displayHour}:${displayMinute} ${period}`;
        options.push({ value, label });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  // Handle same hours everyday checkbox
  const handleSameHoursEveryday = (checked: boolean) => {
    if (checked) {
      // Get the first day's hours (saturday)
      const firstDayHours = operatingHours?.saturday;
      if (firstDayHours) {
        // Apply to all days
        const newOperatingHours = { ...operatingHours };
        days.forEach((day) => {
          newOperatingHours[day] = {
            ...firstDayHours,
            enabled: true,
          };
        });
        setValue("operatingHours", newOperatingHours);
      }
    }
  };

  // Handle 24/7 checkbox
  const handle24_7 = (checked: boolean) => {
    if (checked) {
      const newOperatingHours: Record<
        string,
        {
          enabled: boolean;
          from: string;
          to: string;
          breakHour?: string;
        }
      > = {};

      days.forEach((day) => {
        newOperatingHours[day] = {
          enabled: true,
          from: "00:00",
          to: "23:59",
          breakHour: "00:00",
        };
      });
      setValue("operatingHours", newOperatingHours);
    }
  };

  // Toggle day enabled/disabled
  const toggleDay = (day: string) => {
    const currentHours = operatingHours || {};
    const currentDay = currentHours[day];
    const newOperatingHours = {
      ...currentHours,
      [day]: {
        ...(currentDay || { from: "09:00", to: "17:00", breakHour: "12:00" }),
        enabled: !currentDay?.enabled,
      },
    };
    setValue("operatingHours", newOperatingHours);
  };

  // Get day hours safely
  const getDayHours = (day: string) => {
    return (
      operatingHours?.[day] || {
        enabled: true,
        from: "09:00",
        to: "17:00",
        breakHour: "12:00",
      }
    );
  };

  // Update specific day field
  const updateDayField = (
    day: string,
    field: "from" | "to" | "breakHour",
    value: string
  ) => {
    const currentHours = operatingHours || {};
    const dayHours = getDayHours(day);
    const newOperatingHours = {
      ...currentHours,
      [day]: {
        ...dayHours,
        [field]: value,
      },
    };
    setValue("operatingHours", newOperatingHours);
  };

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Checkboxes */}
        <div className="flex gap-8">
          <FormField
            control={control}
            name="sameHoursEveryday"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      handleSameHoursEveryday(checked as boolean);
                    }}
                  />
                </FormControl>
                <FormLabel className="font-normal cursor-pointer">
                  Same Hours Everyday
                </FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="twentyFourSeven"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      handle24_7(checked as boolean);
                    }}
                  />
                </FormControl>
                <FormLabel className="font-normal cursor-pointer">
                  24/7
                </FormLabel>
              </FormItem>
            )}
          />
        </div>

        {/* Time Schedule Grid */}
        <div className="space-y-4">
          {/* Header */}
          <div className="grid grid-cols-[120px_1fr_1fr_1fr_48px] gap-4 pb-2">
            <div></div>
            <div className="text-sm font-medium text-center">From</div>
            <div className="text-sm font-medium text-center">To</div>
            <div className="text-sm font-medium text-center">Break Hour</div>
            <div></div>
          </div>

          {/* Days */}
          {days.map((day) => {
            const dayHours = getDayHours(day);
            const dayEnabled = dayHours.enabled !== false;

            return (
              <div
                key={day}
                className={`grid grid-cols-[120px_1fr_1fr_1fr_48px] gap-4 items-center ${
                  !dayEnabled ? "opacity-50" : ""
                }`}
              >
                {/* Day Name */}
                <div className="capitalize font-medium">{day}</div>

                {/* From Time */}
                <FormItem>
                  <Select
                    onValueChange={(value) =>
                      updateDayField(day, "from", value)
                    }
                    value={dayHours.from}
                    disabled={is24_7 || !dayEnabled}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          {timeOptions.find(
                            (opt) => opt.value === dayHours.from
                          )?.label || "9:00 AM"}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>

                {/* To Time */}
                <FormItem>
                  <Select
                    onValueChange={(value) => updateDayField(day, "to", value)}
                    value={dayHours.to}
                    disabled={is24_7 || !dayEnabled}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          {timeOptions.find((opt) => opt.value === dayHours.to)
                            ?.label || "5:00 PM"}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>

                {/* Break Hour */}
                <FormItem>
                  <Select
                    onValueChange={(value) =>
                      updateDayField(day, "breakHour", value)
                    }
                    value={dayHours.breakHour}
                    disabled={is24_7 || !dayEnabled}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          {timeOptions.find(
                            (opt) => opt.value === dayHours.breakHour
                          )?.label || "12:00 PM"}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>

                {/* Remove/Toggle Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleDay(day)}
                  disabled={is24_7}
                  className="h-10 w-10"
                >
                  <X
                    className={`h-5 w-5 ${
                      !dayEnabled ? "text-red-500" : "text-gray-500"
                    }`}
                  />
                </Button>
              </div>
            );
          })}
        </div>

        <StepNavigation
          onBack={onBack}
          onNext={onNext}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
        />
      </form>
    </Form>
  );
};
