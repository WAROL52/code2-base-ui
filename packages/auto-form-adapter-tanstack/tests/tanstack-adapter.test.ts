import { describe, it, expect, expectTypeOf } from "vitest";
import type { FormStateAdapter } from "@code2-base-ui/auto-form";
import type { ValidationResult } from "@code2-base-ui/json-schema-toolkit";
import { tanstackFormAdapter } from "../src/tanstack-adapter";

describe("TanStackFormAdapter types", () => {
  it("conforms to FormStateAdapter", () => {
    expectTypeOf<typeof tanstackFormAdapter>().toMatchTypeOf<FormStateAdapter>();
  });
});

describe("tanstackFormAdapter", () => {
  it("has correct name", () => {
    expect(tanstackFormAdapter.name).toBe("tanstack-form");
  });

  it("useForm returns FormAPI", () => {
    const validate = (_data: unknown): ValidationResult => ({
      success: true,
      errors: [],
    });

    const form = tanstackFormAdapter.useForm({
      defaultValues: { name: "test" },
      validate,
    });

    expect(form).toBeDefined();
    expect(typeof form.submit).toBe("function");
    expect(typeof form.reset).toBe("function");
    expect(typeof form.dirty).toBe("boolean");
    expect(typeof form.isSubmitting).toBe("boolean");
  });
});
