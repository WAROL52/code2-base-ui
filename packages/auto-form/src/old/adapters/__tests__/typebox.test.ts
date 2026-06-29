// =============================================================================
// Tests — TypeBox Adapter
// =============================================================================

import { Type } from "@sinclair/typebox";
import { describe, expect, it } from "vitest";
import { typeboxAdapter } from "../typebox";

describe("typeboxAdapter", () => {
  it("name est 'typebox'", () => {
    expect(typeboxAdapter.name).toBe("typebox");
  });

  describe("fromJsonSchema", () => {
    it("retourne le schéma tel quel", () => {
      const schema = { type: "string" } as const;
      expect(typeboxAdapter.fromJsonSchema(schema)).toBe(schema);
    });
  });

  describe("validate", () => {
    it("valide avec succès", () => {
      const schema = Type.Object({ id: Type.Number() });
      const result = typeboxAdapter.validate(schema, { id: 1 });
      expect(result.success).toBe(true);
    });

    it("retourne des erreurs avec path formaté", () => {
      const schema = Type.Object({
        settings: Type.Object({
          theme: Type.String(),
        }),
      });
      // Path JSON Pointer "/settings/theme" -> "settings.theme"
      const result = typeboxAdapter.validate(schema, {
        settings: { theme: 123 },
      });
      expect(result.success).toBe(false);
      expect(result.errors?.[0]?.path).toBe("settings.theme");
    });
  });
});
