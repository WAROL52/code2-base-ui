import { describe, it, expect } from "vitest";
import { validateSchema } from "../../src/utils/validate-schema";
import type { JsonSchema } from "../../src/types";

describe("validateSchema", () => {
  it("validates a correct object", () => {
    const schema: JsonSchema = {
      type: "object",
      properties: {
        name: { type: "string" },
      },
    };
    const result = validateSchema(schema, { name: "Alice" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid data", () => {
    const schema: JsonSchema = {
      type: "object",
      properties: {
        age: { type: "number" },
      },
    };
    const result = validateSchema(schema, { age: "not-a-number" });
    expect(result.success).toBe(false);
  });
});