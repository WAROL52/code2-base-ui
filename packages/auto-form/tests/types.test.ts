import { describe, it, expectTypeOf } from "vitest";
import type {
  SchemaProvider,
  SchemaProviderFactory,
  FormStateAdapter,
  FormAPI,
  FieldController,
  AutoFormProps,
  LayoutStrategy,
} from "../src/core/types";
import type { FieldMeta, ValidationResult } from "@code2-base-ui/json-schema-toolkit";
import type { ReactNode } from "react";

describe("SchemaProvider", () => {
  it("requires fields, validate, and getFieldMeta", () => {
    expectTypeOf<SchemaProvider<unknown>>().toMatchTypeOf<{
      fields: FieldMeta[];
      validate: (data: unknown) => ValidationResult;
      getFieldMeta: (path: string) => FieldMeta | undefined;
    }>();
  });

  it("SchemaProviderFactory has name and create", () => {
    expectTypeOf<SchemaProviderFactory>().toMatchTypeOf<{
      name: string;
      create: <T>(schema: T) => SchemaProvider<T>;
    }>();
  });
});

describe("FormStateAdapter", () => {
  it("has useForm and useField", () => {
    expectTypeOf<FormStateAdapter>().toMatchTypeOf<{
      name: string;
      useForm: (config: {
        defaultValues?: Record<string, unknown>;
        validate: (data: unknown) => ValidationResult;
      }) => FormAPI;
      useField: (name: string) => FieldController;
    }>();
  });
});

describe("FormAPI", () => {
  it("has all form state methods", () => {
    expectTypeOf<FormAPI>().toMatchTypeOf<{
      values: Record<string, unknown>;
      errors: Record<string, string | undefined>;
      submit: (e: { preventDefault: () => void }) => void;
      reset: () => void;
      dirty: boolean;
      isSubmitting: boolean;
    }>();
  });
});

describe("FieldController", () => {
  it("has value, onChange, onBlur, error, touched", () => {
    expectTypeOf<FieldController>().toMatchTypeOf<{
      value: unknown;
      onChange: (value: unknown) => void;
      onBlur: () => void;
      error?: string;
      touched: boolean;
    }>();
  });
});

describe("AutoFormProps", () => {
  it("requires schema and optional onSubmit", () => {
    expectTypeOf<AutoFormProps<unknown>>().toMatchTypeOf<{
      schema: unknown;
      onSubmit?: (data: unknown) => void | Promise<void>;
      defaultValues?: Record<string, unknown>;
      children?: ReactNode;
      className?: string;
    }>();
  });
});

describe("LayoutStrategy", () => {
  it("has a render method for fields", () => {
    expectTypeOf<LayoutStrategy>().toMatchTypeOf<{
      name: string;
      render: (fields: FieldMeta[], renderField: (field: FieldMeta) => ReactNode) => ReactNode;
    }>();
  });
});
