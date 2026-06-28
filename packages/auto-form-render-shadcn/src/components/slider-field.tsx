"use client";

import { Slider } from "@code2-base-ui/ui/components/slider";
import { Field, FieldLabel, FieldError } from "@code2-base-ui/ui/components/field";

export function SliderField(props: Record<string, unknown>) {
  const { name, label, min, max, step } = props as {
    name: string;
    label?: string;
    min?: number;
    max?: number;
    step?: number;
  };
  return (
    <Field>
      {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
      <Slider id={name} name={name} min={min} max={max} step={step} />
      <FieldError errors={[]} />
    </Field>
  );
}
