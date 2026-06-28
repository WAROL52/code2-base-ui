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

  it("derives label from title when present", () => {
    const schema = z.object({
      email: z.string().email().meta({ title: "Email Address" }),
    });
    const provider = new ZodProvider(schema);
    expect(provider.fields[0]?.label).toBe("Email Address");
  });

  it("falls back to humanized path when no title", () => {
    const schema = z.object({
      email_address: z.string().email(),
    });
    const provider = new ZodProvider(schema);
    expect(provider.fields[0]?.label).toBe("Email Address");
  });

  it("propagates description from meta", () => {
    const schema = z.object({
      name: z.string().meta({ title: "Name", description: "Your full name" }),
    });
    const provider = new ZodProvider(schema);
    expect(provider.fields[0]?.description).toBe("Your full name");
  });

  it("sets uiWidget to select for enum fields", () => {
    const schema = z.object({
      role: z.enum(["admin", "user"]),
    });
    const provider = new ZodProvider(schema);
    expect(provider.fields[0]?.uiWidget).toBe("select");
    expect(provider.fields[0]?.enum).toEqual(["admin", "user"]);
  });

  it("produces JSON Schema via z.toJSONSchema", () => {
    const schema = z.object({
      name: z.string(),
    });
    const provider = new ZodProvider(schema);
    expect(provider.jsonSchema).toHaveProperty("$schema");
    expect(provider.jsonSchema.type).toBe("object");
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
