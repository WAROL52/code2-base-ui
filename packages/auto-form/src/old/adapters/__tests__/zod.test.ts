// =============================================================================
// Tests — Zod Adapter
// =============================================================================
import { describe, expect, it } from "vitest";
import { z } from "zod";
import type { JsonSchema } from "../../core/types";
import { zodAdapter } from "../zod";

describe("zodAdapter", () => {
  it("name est 'zod'", () => {
    expect(zodAdapter.name).toBe("zod");
  });

  describe("fromJsonSchema", () => {
    it("convertit un type simple", () => {
      const schema = { type: "string" } as const;
      const zodSchema = zodAdapter.fromJsonSchema(schema);
      expect(zodSchema).toBeDefined();
      expect(zodSchema.safeParse("hello").success).toBe(true);
    });

    it("convertit un objet simple", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
        },
        required: ["name"],
      } satisfies JsonSchema;
      const zodSchema = zodAdapter.fromJsonSchema(schema);
      expect(zodSchema.safeParse({ name: "Alice" }).success).toBe(true);
    });

    it("fallback sur z.any() en cas d'erreur de parsing", () => {
      // On passe un schéma qui va forcer une erreur
      const zodSchema = zodAdapter.fromJsonSchema({
        type: "object",
        properties: { a: { $ref: "invalid" } },
      } as any);
      expect(zodSchema).toBeDefined();
    });
  });

  describe("toJsonSchema", () => {
    it("convertit un schéma Zod en JSON Schema", () => {
      const zodSchema = z.object({ age: z.number() });
      const jsonSchema = zodAdapter.toJsonSchema(zodSchema) as any;
      expect(jsonSchema.type).toBe("object");
    });
  });

  describe("validate", () => {
    it("formate les erreurs complexes", () => {
      const zodSchema = z.object({
        meta: z.object({ tags: z.array(z.string()) }),
      });
      const result = zodAdapter.validate(zodSchema, { meta: { tags: [123] } });
      expect(result.success).toBe(false);
      expect(result.errors?.[0]?.path).toBe("meta.tags.0");
    });
  });
});
