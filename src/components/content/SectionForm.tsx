"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import {
  FieldSpec,
  ICON_OPTIONS,
  SectionSpec,
} from "@/lib/config/siteContentFields";

type JsonValue = unknown;
type JsonRecord = Record<string, unknown>;

function emptyValueForField(field: FieldSpec): JsonValue {
  switch (field.type) {
    case "icon-select":
      return ICON_OPTIONS[0];
    case "string-array":
      return [];
    case "object":
      return emptyObjectForFields(field.fields ?? []);
    case "repeater":
      return [];
    default:
      return "";
  }
}

function emptyObjectForFields(fields: FieldSpec[]): JsonRecord {
  const obj: JsonRecord = {};
  for (const f of fields) obj[f.name] = emptyValueForField(f);
  return obj;
}

function StringArrayField({
  values,
  onChange,
}: {
  values: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      {values.map((v, i) => (
        <div key={i} className="flex gap-2">
          <Textarea
            value={v}
            onChange={(e) => {
              const next = [...values];
              next[i] = e.target.value;
              onChange(next);
            }}
            rows={2}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange(values.filter((_, idx) => idx !== i))}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...values, ""])}
      >
        <Plus className="h-4 w-4" />
        Add item
      </Button>
    </div>
  );
}

function RepeaterField({
  items,
  fields,
  onChange,
}: {
  items: JsonRecord[];
  fields: FieldSpec[];
  onChange: (v: JsonRecord[]) => void;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <Card key={i} className="p-4 relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <CardContent className="p-0 space-y-3">
            {fields.map((field) => (
              <FieldRenderer
                key={field.name}
                field={field}
                value={item[field.name]}
                onChange={(v) => {
                  const next = [...items];
                  next[i] = { ...next[i], [field.name]: v };
                  onChange(next);
                }}
              />
            ))}
          </CardContent>
        </Card>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...items, emptyObjectForFields(fields)])}
      >
        <Plus className="h-4 w-4" />
        Add
      </Button>
    </div>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: FieldSpec;
  value: JsonValue;
  onChange: (v: JsonValue) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{field.label}</Label>
      {field.type === "text" && (
        <Input
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {field.type === "textarea" && (
        <Textarea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
        />
      )}
      {field.type === "icon-select" && (
        <Select value={(value as string) ?? ICON_OPTIONS[0]} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ICON_OPTIONS.map((icon) => (
              <SelectItem key={icon} value={icon}>
                {icon}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {field.type === "string-array" && (
        <StringArrayField
          values={(value as string[]) ?? []}
          onChange={onChange}
        />
      )}
      {field.type === "object" && (
        <div className="pl-4 border-l space-y-3">
          {(field.fields ?? []).map((sub) => (
            <FieldRenderer
              key={sub.name}
              field={sub}
              value={(value as JsonRecord | undefined)?.[sub.name]}
              onChange={(v) =>
                onChange({ ...(value as JsonRecord), [sub.name]: v })
              }
            />
          ))}
        </div>
      )}
      {field.type === "repeater" && (
        <RepeaterField
          items={(value as JsonRecord[]) ?? []}
          fields={field.fields ?? []}
          onChange={onChange}
        />
      )}
    </div>
  );
}

interface SectionFormProps {
  spec: SectionSpec;
  value: JsonValue;
  onChange: (value: JsonValue) => void;
}

export function SectionForm({ spec, value, onChange }: SectionFormProps) {
  if (spec.isArrayRoot) {
    return (
      <RepeaterField
        items={(value as JsonRecord[]) ?? []}
        fields={spec.itemFields ?? []}
        onChange={onChange}
      />
    );
  }

  const objectValue = (value as JsonRecord) ?? {};

  return (
    <div className="space-y-4">
      {(spec.fields ?? []).map((field) => (
        <FieldRenderer
          key={field.name}
          field={field}
          value={objectValue[field.name]}
          onChange={(v) => onChange({ ...objectValue, [field.name]: v })}
        />
      ))}
    </div>
  );
}
