import type {
  ValidationResult,
  FieldMeta,
} from "@code2-base-ui/json-schema-toolkit";
import type { ReactNode } from "react";

export interface SchemaProvider<TSchema = unknown> {
  readonly fields: FieldMeta[];
  readonly jsonSchema: import("@code2-base-ui/json-schema-toolkit").JsonSchema;
  validate: (data: unknown) => ValidationResult;
  getFieldMeta: (path: string) => FieldMeta | undefined;
  readonly _type?: TSchema;
}

export interface SchemaProviderFactory {
  readonly name: string;
  create: <T>(schema: T) => SchemaProvider<T>;
}

export interface FormAPI {
  values: Record<string, unknown>;
  errors: Record<string, string | undefined>;
  submit: (e: { preventDefault: () => void }) => void;
  reset: () => void;
  dirty: boolean;
  isSubmitting: boolean;
}

export interface FieldController {
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur: () => void;
  error?: string;
  touched: boolean;
}

export interface FormStateAdapter {
  readonly name: string;
  useForm: (config: {
    defaultValues?: Record<string, unknown>;
    validate: (data: unknown) => ValidationResult;
  }) => FormAPI;
  useField: (name: string) => FieldController;
}

export interface AutoFormProps<TSchema = unknown> {
  schema: TSchema;
  onSubmit?: (data: unknown) => void | Promise<void>;
  defaultValues?: Record<string, unknown>;
  children?: ReactNode;
  className?: string;
}

export interface LayoutStrategy {
  readonly name: string;
  render: (
    fields: FieldMeta[],
    renderField: (field: FieldMeta) => ReactNode,
  ) => ReactNode;
}
