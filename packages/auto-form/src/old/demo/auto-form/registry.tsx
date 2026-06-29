"use client";
import {
  type FieldComponentProps,
  FieldRegistry,
  setupStandardRegistry,
} from "@code-base-ui/json-schema-toolkit/registry";
import {
  Button,
  cn,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@code-base-ui/ui";
import { SearchIcon } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import { ReactNode } from "react";
import z from "zod";

// 1. Définition du registre UI personnalisé pour la démo avec styles Tailwind simples
export const myAutoFormRegistry = new FieldRegistry();

function createFieldComponent<T = string>(
  renderFn: (props: FieldComponentProps<T>) => ReactNode,
) {
  return function FieldComponent(props: FieldComponentProps<T>) {
    const { field, error, id, label, className } = props;
    const invalid = !!error;
    const fieldProps = {
      "data-invalid": invalid,
      "aria-invalid": invalid,
    };
    const autoFormMeta: Partial<Record<string, string>> =
      field.resolvedSchema["auto-form"] || {};
    return (
      <Field
        {...fieldProps}
        className={cn("gap-2 flex-wrap", className)}
        orientation={"horizontal"}
      >
        <FieldLabel htmlFor={id} {...fieldProps}>
          {label || field.label || field.name}({field.type}.{field.format}.
          {field.uiWidget})
        </FieldLabel>
        <InputGroup>
          {renderFn(props)}
          {autoFormMeta["icon"] && (
            <InputGroupAddon
              align={autoFormMeta["icon-align"] as "inline-start"}
            >
              <DynamicIcon name={autoFormMeta["icon"] as "code"} />
            </InputGroupAddon>
          )}
        </InputGroup>
        <div className="basis-full">
          {error ? <FieldError>{error}</FieldError> : null}
          {field.description && (
            <FieldDescription className=" text-xs">
              {field.description}
            </FieldDescription>
          )}
        </div>
        <div className="p-4 bg-primary/10 text-primary border border-primary/20 rounded-md text-sm w-full overflow-x-auto">
          <pre>{JSON.stringify(field, null, 2)}</pre>
        </div>
      </Field>
    );
  };
}

const formatMap: Map<string, string> = new Map([
  ["text", "text"],
  ["password", "password"],
  ["email", "email"],
  ["date", "date"],
  ["date-time", "datetime-local"],
]);

setupStandardRegistry(myAutoFormRegistry, {
  Input: createFieldComponent(({ field, ...fieldState }) => {
    const invalid = !!fieldState.error;
    const fieldProps = {
      "data-invalid": invalid,
      "aria-invalid": invalid,
    };
    return (
      <InputGroupInput
        id={fieldState.id}
        type={formatMap.get(field.format || "text") || "text"}
        name={field.name}
        value={fieldState.value ? String(fieldState.value) : ""}
        onChange={(e) => fieldState.onChange(e.target.value)}
        disabled={fieldState.disabled}
        placeholder={fieldState.placeholder}
        autoComplete="off"
        {...fieldProps}
      />
    );
  }),
  Textarea: createFieldComponent(({ field, ...fieldState }) => {
    const invalid = !!fieldState.error;
    const fieldProps = {
      "data-invalid": invalid,
      "aria-invalid": invalid,
    };
    return (
      <Input
        id={fieldState.id}
        type={"color"}
        name={field.name}
        value={fieldState.value ? String(fieldState.value) : ""}
        onChange={(e) => fieldState.onChange(e.target.value)}
        disabled={fieldState.disabled}
        placeholder={fieldState.placeholder}
        {...fieldProps}
      />
    );
  }),
  Checkbox: createFieldComponent(({ field, ...fieldState }) => {
    const invalid = !!fieldState.error;
    const fieldProps = {
      "data-invalid": invalid,
      "aria-invalid": invalid,
    };
    return (
      <Input
        id={fieldState.id}
        type={"checkbox"}
        name={field.name}
        value={fieldState.value ? String(fieldState.value) : ""}
        onChange={(e) => fieldState.onChange(e.target.checked)}
        disabled={fieldState.disabled}
        placeholder={fieldState.placeholder}
        {...fieldProps}
      />
    );
  }),
  NumberInput: createFieldComponent(({ field, ...fieldState }) => {
    const invalid = !!fieldState.error;
    const fieldProps = {
      "data-invalid": invalid,
      "aria-invalid": invalid,
    };
    return (
      <Input
        id={fieldState.id}
        type={"number"}
        name={field.name}
        value={fieldState.value}
        onChange={(e) => fieldState.onChange(e.target.valueAsNumber || 0)}
        disabled={fieldState.disabled}
        placeholder={fieldState.placeholder}
        {...fieldProps}
      />
    );
  }),
});
