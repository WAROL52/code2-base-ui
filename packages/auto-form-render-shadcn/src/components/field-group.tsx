"use client";

import { useState } from "react";
import { Button } from "@code2-base-ui/ui/components/button";
import { Field, FieldError } from "@code2-base-ui/ui/components/field";

export function FieldGroup(props: Record<string, unknown>) {
  const { label, children, defaultOpen } = props as {
    label?: string;
    children?: React.ReactNode;
    defaultOpen?: boolean;
  };
  const [isOpen, setIsOpen] = useState(defaultOpen ?? true);

  return (
    <Field>
      {label && (
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 p-0 h-auto font-medium"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          <span className="h-4 w-4 inline-flex items-center justify-center">{isOpen ? "▾" : "▸"}</span>
          {label}
        </Button>
      )}
      {isOpen && <div data-slot="field-group-content">{children}</div>}
      <FieldError errors={[]} />
    </Field>
  );
}
