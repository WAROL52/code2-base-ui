"use client";

import { Input } from "@code2-base-ui/ui/components/input";
import { Field, FieldLabel, FieldError, FieldDescription } from "@code2-base-ui/ui/components/field";

export function InputField(props: Record<string, unknown>) {
  const { name, label, description, type, placeholder, required } = props as {
    name: string;
    label?: string;
    description?: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
  };
  return (
    <Field data-invalid={undefined}>
      {label && <FieldLabel htmlFor={name}>{label}{required ? " *" : ""}</FieldLabel>}
      <Input id={name} name={name} type={type} placeholder={placeholder} aria-invalid={undefined} />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={[]} />
    </Field>
  );
}
