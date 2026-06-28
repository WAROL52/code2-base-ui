"use client";

import { DatePicker } from "@code2-base-ui/ui/components/date-picker";
import { Field, FieldLabel, FieldError } from "@code2-base-ui/ui/components/field";

export function DatePickerField(props: Record<string, unknown>) {
  const { name, label, placeholder } = props as {
    name: string;
    label?: string;
    placeholder?: string;
  };
  return (
    <Field>
      {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
      <DatePicker
        date={undefined}
        onSelect={() => {}}
        placeholder={placeholder}
      />
      <FieldError errors={[]} />
    </Field>
  );
}
