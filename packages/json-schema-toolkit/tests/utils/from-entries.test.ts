import { describe, it, expect } from "vitest";
import { fromEntries } from "../../src/utils/from-entries";
import type { JsonSchema, FieldMeta } from "../../src/types";

describe("fromEntries", () => {
  it("reconstructs a simple schema", () => {
    const input: [string, FieldMeta][] = [
      ["name", { path: "name", type: "string" }],
      ["age", { path: "age", type: "number" }],
    ];
    const result = fromEntries(input);
    expect(result.type).toBe("object");
    expect(result.properties?.name?.type).toBe("string");
    expect(result.properties?.age?.type).toBe("number");
  });
});