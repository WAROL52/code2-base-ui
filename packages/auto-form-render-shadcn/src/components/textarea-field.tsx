"use client";

import { Textarea } from "@code2-base-ui/ui/components/textarea";
import { Field, FieldLabel, FieldError, FieldDescription } from "@code2-base-ui/ui/components/field";

export function TextareaField(props: Record<string, unknown>) {
  const { name, label, description, placeholder, required } = props as {
    name: string;
    label?: string;
    description?: string;
    placeholder?: string;
    required?: boolean;
  };
  return (
    <Field data-invalid={undefined}>
      {label && <FieldLabel htmlFor={name}>{label}{required ? " *" : ""}</FieldLabel>}
      <Textarea id={name} name={name} placeholder={placeholder} aria-invalid={undefined} />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={[]} />
    </Field>
  );
}
