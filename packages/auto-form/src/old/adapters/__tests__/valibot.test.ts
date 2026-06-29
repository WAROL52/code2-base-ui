// =============================================================================
// Tests — Valibot Adapter
// =============================================================================

import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { valibotAdapter } from "../valibot";

describe("valibotAdapter", () => {
  it("name est 'valibot'", () => {
    expect(valibotAdapter.name).toBe("valibot");
  });

  describe("fromJsonSchema", () => {
    it("convertit les types de base", () => {
      const s = valibotAdapter.fromJsonSchema({ type: "string" }) as any;
      expect(s.type).toBe("string");
    });

    it("convertit un objet imbriqué", () => {
      const schema = {
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              active: { type: "boolean" },
            },
          },
        },
      } as const;
      const native = valibotAdapter.fromJsonSchema(schema);
      const res = v.safeParse(native, { user: { active: true } });
      expect(res.success).toBe(true);
    });

    it("fallback sur v.any()", () => {
      const native = valibotAdapter.fromJsonSchema({
        type: "tuple",
      } as any) as any;
      expect(native.type).toBe("any");
    });
  });

  describe("toJsonSchema", () => {
    it("convertit un schéma Valibot en JSON Schema", () => {
      const schema = v.object({ name: v.string() });
      const json = valibotAdapter.toJsonSchema(schema) as any;
      expect(json.type).toBe("object");
    });
  });

  describe("validate", () => {
    it("formate les erreurs de path", () => {
      const schema = v.object({
        list: v.array(v.string()),
      });
      const result = valibotAdapter.validate(schema, { list: [123] });
      expect(result.success).toBe(false);
      expect(result.errors?.[0]?.path).toBe("list.0");
    });
  });
});
