"use client";

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@code2-base-ui/ui/components/select";
import { Field, FieldLabel, FieldError } from "@code2-base-ui/ui/components/field";

export function SelectField(props: Record<string, unknown>) {
  const { name, label, placeholder, options } = props as {
    name: string;
    label?: string;
    placeholder?: string;
    options?: { value: string; label: string }[];
  };
  return (
    <Field>
      {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
      <Select name={name}>
        <SelectTrigger id={name}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {(options ?? []).map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError errors={[]} />
    </Field>
  );
}
