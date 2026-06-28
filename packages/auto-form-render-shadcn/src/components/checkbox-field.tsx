"use client";

import { Checkbox } from "@code2-base-ui/ui/components/checkbox";
import { Field, FieldLabel, FieldError } from "@code2-base-ui/ui/components/field";

export function CheckboxField(props: Record<string, unknown>) {
  const { name, label } = props as {
    name: string;
    label?: string;
  };
  return (
    <Field>
      <Checkbox id={name} name={name} />
      {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
      <FieldError errors={[]} />
    </Field>
  );
}
