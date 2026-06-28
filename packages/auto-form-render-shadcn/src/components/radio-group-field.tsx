"use client";

import { RadioGroup, RadioGroupItem } from "@code2-base-ui/ui/components/radio-group";
import { Field, FieldLabel, FieldError } from "@code2-base-ui/ui/components/field";

export function RadioGroupField(props: Record<string, unknown>) {
  const { name, label, options } = props as {
    name: string;
    label?: string;
    options?: { value: string; label: string }[];
  };
  return (
    <Field>
      {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
      <RadioGroup id={name} name={name}>
        {(options ?? []).map((opt) => (
          <div key={opt.value} className="flex items-center gap-2">
            <RadioGroupItem value={opt.value} id={`${name}-${opt.value}`} />
            <FieldLabel htmlFor={`${name}-${opt.value}`}>{opt.label}</FieldLabel>
          </div>
        ))}
      </RadioGroup>
      <FieldError errors={[]} />
    </Field>
  );
}
