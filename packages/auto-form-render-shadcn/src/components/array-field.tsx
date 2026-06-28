"use client";

import { Button } from "@code2-base-ui/ui/components/button";
import { Field, FieldLabel, FieldError } from "@code2-base-ui/ui/components/field";

export function ArrayField(props: Record<string, unknown>) {
  const { name, label, children } = props as {
    name: string;
    label?: string;
    children?: React.ReactNode;
  };
  return (
    <Field>
      {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
      <div data-slot="array-items" className="flex flex-col gap-2">
        {children}
      </div>
      <div className="flex gap-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          type="button"
          className="flex items-center gap-1"
        >
          <span className="h-3 w-3 inline-flex items-center justify-center">+</span>
          Add
        </Button>
      </div>
      <FieldError errors={[]} />
    </Field>
  );
}
