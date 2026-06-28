import { describe, it, expect } from "vitest";
import { z } from "zod";
import { ZodProvider, zodProvider } from "../src/zod-provider";

describe("ZodProvider", () => {
  const schema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    age: z.number().min(0).optional(),
  });

  const provider = new ZodProvider(schema);

  it("extracts fields from schema", () => {
    const fields = provider.fields;
    expect(fields.length).toBeGreaterThan(0);
    expect(fields.some((f) => f.path === "name")).toBe(true);
    expect(fields.some((f) => f.path === "email")).toBe(true);
  });

  it("validates correct data", () => {
    const result = provider.validate({ name: "Alice", email: "alice@test.com", age: 30 });
    expect(result.success).toBe(true);
  });

  it("rejects invalid data", () => {
    const result = provider.validate({ name: "", email: "invalid" });
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("getFieldMeta returns metadata for existing field", () => {
    const meta = provider.getFieldMeta("name");
    expect(meta).toBeDefined();
    expect(meta?.path).toBe("name");
  });

  it("getFieldMeta returns undefined for missing field", () => {
    expect(provider.getFieldMeta("nonexistent")).toBeUndefined();
  });

  it("has jsonSchema", () => {
    expect(provider.jsonSchema.type).toBe("object");
  });

  it("zodProvider factory creates provider", () => {
    const p = zodProvider.create(schema);
    expect(p).toBeInstanceOf(ZodProvider);
  });
});
