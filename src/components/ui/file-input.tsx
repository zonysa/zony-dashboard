"use client";

import { cn } from "@/lib/utils";
import { FileIcon, Trash2, Upload } from "lucide-react";
import * as React from "react";
import { Button } from "./button";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface FileInputProps {
  className?: string;
  value?: File | File[] | null;
  onChange?: (file: File | File[] | null) => void;
  disabled?: boolean;
  accept?: string;
  multiple?: boolean;
  placeholder?: string;
}

const FileInput = ({
  className,
  value,
  onChange,
  disabled,
  accept,
  multiple = false,
  placeholder,
}: FileInputProps) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const { t } = useTranslation();

  const handleFileSelection = (file: File | File[] | null) => {
    if (!disabled) onChange?.(file);
  };

  const handleDragEvents = (
    e: React.DragEvent<HTMLDivElement>,
    isOver: boolean
  ) => {
    e.preventDefault();
    if (!disabled) setIsDragging(isOver);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (!disabled) {
      if (multiple) {
        const files = Array.from(e.dataTransfer.files);
        handleFileSelection(files.length > 0 ? files : null);
      } else {
        const file = e.dataTransfer.files?.[0] ?? null;
        handleFileSelection(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (multiple) {
      const files = e.target.files ? Array.from(e.target.files) : null;
      handleFileSelection(files);
    } else {
      handleFileSelection(e.target.files?.[0] ?? null);
    }
  };

  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>, index?: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (multiple && Array.isArray(value) && index !== undefined) {
      const newFiles = value.filter((_, i) => i !== index);
      handleFileSelection(newFiles.length > 0 ? newFiles : null);
    } else {
      handleFileSelection(null);
    }

    if (inputRef.current) inputRef.current.value = "";
  };

  // Render files display
  const renderFiles = () => {
    if (!value) return null;

    const files = Array.isArray(value) ? value : [value];

    return (
      <div className="space-y-2">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="flex items-center gap-2 rounded-md bg-muted/50 p-2"
          >
            <div className="rounded-md bg-background p-2">
              <FileIcon className="size-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled}
              onClick={(e) => handleRemove(e, multiple ? index : undefined)}
              className="flex-none size-8"
            >
              <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
              <span className="sr-only">{t("form.removeFile")}</span>
            </Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => handleDragEvents(e, true)}
        onDragLeave={(e) => handleDragEvents(e, false)}
        onDrop={handleDrop}
        className={cn(
          "relative cursor-pointer rounded-md border border-dashed border-muted-foreground/25 px-6 py-8 text-center transition-colors hover:bg-muted/50",
          isDragging && "border-muted-foreground/50 bg-muted/50",
          disabled && "cursor-not-allowed opacity-60"
        )}
        role="button"
        tabIndex={0}
        aria-disabled={disabled}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          disabled={disabled}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-1">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-primary">
              {t("form.clickToUpload")}
            </span>{" "}
            {t("form.orDragAndDrop")}
          </p>
          {placeholder && (
            <p className="text-xs text-muted-foreground mt-1">{placeholder}</p>
          )}
          {multiple && (
            <p className="text-xs text-muted-foreground mt-1">
              (Multiple files allowed)
            </p>
          )}
        </div>
      </div>
      {renderFiles()}
    </div>
  );
};

export { FileInput };
