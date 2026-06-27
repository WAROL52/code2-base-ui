import { describe, it, expect } from "vitest";
import { keys } from "../../src/utils/keys";
import type { JsonSchema } from "../../src/types";

describe("keys", () => {
  it("returns field paths", () => {
    const schema: JsonSchema = {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "number" },
      },
    };
    expect(keys(schema)).toEqual(["name", "age"]);
  });

  it("returns nested field paths with dot notation", () => {
    const schema: JsonSchema = {
      type: "object",
      properties: {
        user: {
          type: "object",
          properties: {
            name: { type: "string" },
            address: {
              type: "object",
              properties: {
                city: { type: "string" },
                zip: { type: "string" },
              },
            },
          },
        },
      },
    };
    expect(keys(schema)).toEqual([
      "user",
      "user.name",
      "user.address",
      "user.address.city",
      "user.address.zip",
    ]);
  });

  it("returns empty array for schema without properties", () => {
    expect(keys({ type: "string" })).toEqual([]);
  });
});