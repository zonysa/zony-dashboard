import React from "react";
import {
  Form,
  FormControl,
  FormDescription,
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
import { StepComponentProps } from "@/hooks/useMutliStepForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface OperatingHoursFormData {
  "same-hours-everyday"?: boolean;
  "24-7"?: boolean;
  "operating-hours"?: {
    [key: string]: {
      enabled: boolean;
      to: string;
      from: string;
      breakHour: string;
    };
  };
}

export const OperatingHoursStep: React.FC<
  StepComponentProps<OperatingHoursFormData>
> = ({ form, onNext, onBack, onSubmit, isFirstStep, isLastStep }) => {
  const { control, watch, setValue } = form;

  const sameHoursEveryday = watch("same-hours-everyday");
  const is24_7 = watch("24-7");

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
    if (checked && sameHoursEveryday) {
      // Get the first day's hours
      const firstDayHours = form.getValues(`operating-hours.saturday`);
      if (firstDayHours) {
        // Apply to all days
        days.forEach((day) => {
          setValue(`operating-hours.${day}`, {
            ...firstDayHours,
            enabled: true,
          });
        });
      }
    }
  };

  // Handle 24/7 checkbox
  const handle24_7 = (checked: boolean) => {
    if (checked) {
      days.forEach((day) => {
        setValue(`operating-hours.${day}`, {
          enabled: true,
          to: "00:00",
          from: "23:59",
          breakHour: "00:00",
        });
      });
    }
  };

  // Toggle day enabled/disabled
  const toggleDay = (day: string) => {
    const currentValue = watch(`operating-hours.${day}.enabled`);
    setValue(`operating-hours.${day}.enabled`, !currentValue);
  };

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Checkboxes */}
        <div className="flex gap-8">
          <FormField
            control={control}
            name="same-hours-everyday"
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
            name="24-7"
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
            <div className="text-sm font-medium text-center">To</div>
            <div className="text-sm font-medium text-center">From</div>
            <div className="text-sm font-medium text-center">Break Hour</div>
            <div></div>
          </div>

          {/* Days */}
          {days.map((day) => {
            const dayEnabled =
              watch(`operating-hours.${day}.enabled`) !== false;

            return (
              <div
                key={day}
                className={`grid grid-cols-[120px_1fr_1fr_1fr_48px] gap-4 items-center ${
                  !dayEnabled ? "opacity-50" : ""
                }`}
              >
                {/* Day Name */}
                <div className="capitalize font-medium">{day}</div>

                {/* To Time */}
                <FormField
                  control={control}
                  name={`operating-hours.${day}.to`}
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || "10:00"}
                        disabled={is24_7 || !dayEnabled}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue>
                              {timeOptions.find(
                                (opt) => opt.value === (field.value || "10:00")
                              )?.label || "10:00 AM"}
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
                  )}
                />

                {/* From Time */}
                <FormField
                  control={control}
                  name={`operating-hours.${day}.from`}
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || "10:00"}
                        disabled={is24_7 || !dayEnabled}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue>
                              {timeOptions.find(
                                (opt) => opt.value === (field.value || "10:00")
                              )?.label || "10:00 AM"}
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
                  )}
                />

                {/* Break Hour */}
                <FormField
                  control={control}
                  name={`operating-hours.${day}.breakHour`}
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || "10:00"}
                        disabled={is24_7 || !dayEnabled}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue>
                              {timeOptions.find(
                                (opt) => opt.value === (field.value || "10:00")
                              )?.label || "10:00 AM"}
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
                  )}
                />

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
