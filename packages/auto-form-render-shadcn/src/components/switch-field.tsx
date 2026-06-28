"use client";

import { Switch } from "@code2-base-ui/ui/components/switch";
import { Field, FieldLabel, FieldError } from "@code2-base-ui/ui/components/field";

export function SwitchField(props: Record<string, unknown>) {
  const { name, label } = props as {
    name: string;
    label?: string;
  };
  return (
    <Field>
      <Switch id={name} name={name} />
      {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
      <FieldError errors={[]} />
    </Field>
  );
}
