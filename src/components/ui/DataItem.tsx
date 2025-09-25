import React from "react";
import { CardDescription, CardHeader, CardTitle } from "./card";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface SelectOption {
  value: string;
  label: string;
}

interface DataItemProps {
  label: string;
  value: string;
  isHeading?: boolean;
  icon?: React.ElementType;
  valueClassName?: string;
  iconClassName?: string;
  labelClassName?: string;
  // Edit mode props
  isEditable?: boolean;
  type?: "text" | "email" | "tel" | "number" | "select";
  selectOptions?: SelectOption[];
  placeholder?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export default function DataItem({
  label,
  value,
  icon: Icon = Package,
  isHeading = false,
  valueClassName,
  iconClassName,
  labelClassName,
  isEditable = false,
  type = "text",
  selectOptions = [],
  placeholder,
  onChange,
  disabled = false,
}: DataItemProps) {
  if (isHeading) {
    return (
      <CardHeader className="w-1/4 flex flex-col items-start justify-start pe-0 px-2">
        <CardTitle className="flex items-center gap-2">
          <Icon className={cn("w-4 h-4 text-primary", iconClassName)} />
          {label}
        </CardTitle>
        <CardDescription className="ms-6">{value}</CardDescription>
      </CardHeader>
    );
  }

  const renderInput = () => {
    if (type === "select") {
      return (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder || `Select ${label}`} />
          </SelectTrigger>
          <SelectContent>
            {selectOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        disabled={disabled}
        className="w-full"
      />
    );
  };

  const renderValue = () => {
    if (isEditable) {
      return renderInput();
    }

    return (
      <span
        className={cn(
          "text-black text-sm font-semibold font-mono",
          valueClassName
        )}
      >
        {value}
      </span>
    );
  };

  return (
    <div className="w-auto flex flex-col justify-start gap-1">
      <span className={cn("text-gray-500 text-sm", labelClassName)}>
        {label}
      </span>
      {renderValue()}
    </div>
  );
}
