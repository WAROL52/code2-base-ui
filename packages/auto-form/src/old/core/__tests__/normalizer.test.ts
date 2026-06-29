// =============================================================================
// Tests — normalizer.ts
// =============================================================================
import { describe, expect, it } from "vitest";
import {
  detectDiscriminant,
  getUnionVariants,
  getVariantLabel,
  isUnionSchema,
  normalizeUnion,
} from "../normalizer";
import type { JsonSchema } from "../types";

describe("isUnionSchema", () => {
  it("retourne true pour oneOf avec plusieurs variantes", () => {
    const schema: JsonSchema = {
      oneOf: [{ type: "string" }, { type: "number" }],
    };
    expect(isUnionSchema(schema)).toBe(true);
  });

  it("retourne true pour anyOf avec plusieurs variantes", () => {
    const schema: JsonSchema = {
      anyOf: [{ type: "object" }, { type: "array" }],
    };
    expect(isUnionSchema(schema)).toBe(true);
  });

  it("retourne false pour oneOf avec une seule variante", () => {
    expect(isUnionSchema({ oneOf: [{ type: "string" }] })).toBe(false);
  });

  it("retourne false pour un schéma sans union", () => {
    expect(isUnionSchema({ type: "object", properties: {} })).toBe(false);
  });
});

describe("getUnionVariants", () => {
  it("retourne les variantes oneOf (prioritaire sur anyOf)", () => {
    const schema: JsonSchema = {
      oneOf: [{ type: "string" }, { type: "number" }],
      anyOf: [{ type: "boolean" }],
    };
    const variants = getUnionVariants(schema);
    expect(variants).toHaveLength(2);
    expect(variants[0]?.type).toBe("string");
  });

  it("retourne les variantes anyOf si pas de oneOf", () => {
    const schema: JsonSchema = {
      anyOf: [{ type: "object" }, { type: "array" }],
    };
    expect(getUnionVariants(schema)).toHaveLength(2);
  });

  it("retourne [] si pas d'union", () => {
    expect(getUnionVariants({ type: "string" })).toEqual([]);
  });
});

describe("detectDiscriminant", () => {
  it("utilise discriminator.propertyName si présent", () => {
    const parent: JsonSchema = {
      discriminator: { propertyName: "type" },
    };
    const variants: JsonSchema[] = [
      { type: "object", properties: { type: { const: "A" } } },
      { type: "object", properties: { type: { const: "B" } } },
    ];
    expect(detectDiscriminant(parent, variants)).toBe("type");
  });

  it("détecte automatiquement le discriminant via const unique", () => {
    const variants: JsonSchema[] = [
      {
        type: "object",
        properties: { kind: { const: "cat" }, name: { type: "string" } },
      },
      {
        type: "object",
        properties: { kind: { const: "dog" }, name: { type: "string" } },
      },
    ];
    expect(detectDiscriminant({}, variants)).toBe("kind");
  });

  it("retourne undefined si pas de discriminant", () => {
    const variants: JsonSchema[] = [
      { type: "object", properties: { name: { type: "string" } } },
      { type: "object", properties: { age: { type: "number" } } },
    ];
    expect(detectDiscriminant({}, variants)).toBeUndefined();
  });
});

describe("getVariantLabel", () => {
  it("utilise title si présent", () => {
    expect(getVariantLabel({ title: "My Variant" }, undefined, 0)).toBe(
      "My Variant",
    );
  });

  it("utilise la valeur const du discriminant", () => {
    const schema: JsonSchema = {
      properties: { type: { const: "admin" } },
    };
    expect(getVariantLabel(schema, "type", 1)).toBe("admin");
  });

  it("retourne 'Variant N' par défaut", () => {
    expect(getVariantLabel({}, undefined, 2)).toBe("Variant 3");
  });
});

describe("normalizeUnion", () => {
  it("retourne autant de VariantInfo que de variantes", () => {
    const parent: JsonSchema = {};
    const variants: JsonSchema[] = [
      {
        title: "Option A",
        type: "object",
        properties: { a: { type: "string" } },
      },
      {
        title: "Option B",
        type: "object",
        properties: { b: { type: "number" } },
      },
    ];
    const infos = normalizeUnion(parent, variants);
    expect(infos).toHaveLength(2);
    expect(infos[0]?.label).toBe("Option A");
    expect(infos[1]?.label).toBe("Option B");
  });

  it("propage le discriminantKey dans chaque VariantInfo", () => {
    const parent: JsonSchema = { discriminator: { propertyName: "type" } };
    const variants: JsonSchema[] = [
      { type: "object", properties: { type: { const: "X" } } },
      { type: "object", properties: { type: { const: "Y" } } },
    ];
    const infos = normalizeUnion(parent, variants);
    expect(infos[0]?.discriminantKey).toBe("type");
    expect(infos[1]?.discriminantKey).toBe("type");
  });
});
