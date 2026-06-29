import { describe, it, expect } from "vitest";
import { z } from "zod";
import { createAutoForm } from "@code2-base-ui/auto-form";
import { zodProvider } from "@code2-base-ui/auto-form-provider-zod";
import { tanstackFormAdapter } from "@code2-base-ui/auto-form-adapter-tanstack";
import { createShadcnRegistry } from "@code2-base-ui/auto-form-render-shadcn";

const { AutoForm, AutoField, useForm, useField, AutoFormProvider } = createAutoForm({
  provider: zodProvider,
  form: tanstackFormAdapter,
  registry: createShadcnRegistry(),
});

describe("auto-form integration", () => {
  it("composes all packages correctly", () => {
    expect(AutoForm).toBeDefined();
    expect(AutoField).toBeDefined();
    expect(useForm).toBeDefined();
    expect(useField).toBeDefined();
    expect(AutoFormProvider).toBeDefined();
  });

  it("zodProvider extracts fields from schema", () => {
    const schema = z.object({
      name: z.string().min(1, "Name is required"),
      age: z.number().min(0).optional(),
    });

    const provider = zodProvider.create(schema);
    expect(provider.fields).toHaveLength(2);
    expect(provider.fields.some((f) => f.path === "name")).toBe(true);
    expect(provider.fields.some((f) => f.path === "age")).toBe(true);
  });

  it("validation works through full pipeline", () => {
    const schema = z.object({
      email: z.string().email("Invalid email"),
    });

    const provider = zodProvider.create(schema);
    const valid = provider.validate({ email: "test@example.com" });
    expect(valid.success).toBe(true);

    const invalid = provider.validate({ email: "bad" });
    expect(invalid.success).toBe(false);
    expect(invalid.errors.length).toBeGreaterThan(0);
  });

  it("registry resolves components for schema fields", () => {
    const schema = z.object({
      name: z.string(),
      active: z.boolean(),
      age: z.number(),
    });

    const provider = zodProvider.create(schema);
    const registry = createShadcnRegistry();

    for (const field of provider.fields) {
      const component = registry.resolve(field);
      expect(component).toBeDefined();
    }
  });

  it("tanstack adapter creates form with validation", () => {
    const schema = z.object({ name: z.string().min(1) });
    const provider = zodProvider.create(schema);

    const form = tanstackFormAdapter.useForm({
      defaultValues: { name: "" },
      validate: (data) => provider.validate(data),
    });

    expect(form.values).toEqual({ name: "" });
    expect(typeof form.submit).toBe("function");
    expect(typeof form.reset).toBe("function");
  });
});
