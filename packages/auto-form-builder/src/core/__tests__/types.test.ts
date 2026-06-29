// =============================================================================
// Type Testing — types.ts
// Utilise expectTypeOf de Vitest pour valider les types statiques.
// =============================================================================
import { describe, expectTypeOf, it } from "vitest";
import type {
  FieldMeta,
  JsonSchema,
  JsonSchemaType,
  ResolvedSchema,
  ValidationResult,
} from "../types";

describe("Static Type Testing", () => {
  it("JsonSchemaType doit contenir les types standards", () => {
    expectTypeOf<JsonSchemaType>().toMatchTypeOf<
      "string" | "number" | "integer" | "boolean" | "object" | "array" | "null"
    >();
  });

  it("FieldMeta doit être strictement structuré", () => {
    expectTypeOf<FieldMeta>().toBeObject();
    expectTypeOf<FieldMeta>().toHaveProperty("path").toBeString();
    expectTypeOf<FieldMeta>()
      .toHaveProperty("kind")
      .toMatchTypeOf<"primitive" | "object" | "array" | "enum" | "union">();
  });

  it("ResolvedSchema doit lier root et definitions", () => {
    expectTypeOf<ResolvedSchema>()
      .toHaveProperty("root")
      .toMatchTypeOf<JsonSchema>();
    expectTypeOf<ResolvedSchema>()
      .toHaveProperty("definitions")
      .toMatchTypeOf<Record<string, JsonSchema>>();
  });

  it("ValidationResult doit être exhaustif", () => {
    expectTypeOf<ValidationResult>().toHaveProperty("success").toBeBoolean();
  });
});
