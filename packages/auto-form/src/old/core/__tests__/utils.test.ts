// =============================================================================
// Tests — utils.ts
// =============================================================================
import { describe, expect, it } from "vitest";
import type { JsonSchema } from "../types";
import {
  getConstraints,
  getEnum,
  getLabel,
  getType,
  inferTSType,
  isNullable,
} from "../utils";

describe("getType", () => {
  it("déduit 'string' pour un enum sans type", () => {
    expect(getType({ enum: ["a", "b"] })).toBe("string");
  });

  it("déduit 'object' pour properties sans type", () => {
    expect(getType({ properties: { a: { type: "string" } } })).toBe("object");
  });

  it("déduit 'array' pour items sans type", () => {
    expect(getType({ items: { type: "string" } })).toBe("array");
  });

  it("gère les types multiples (tableau) en ignorant 'null'", () => {
    expect(getType({ type: ["null", "integer"] })).toBe("integer");
  });
});

describe("getLabel", () => {
  it("donne priorité au title", () => {
    expect(getLabel({ title: "Mon Titre" }, "name")).toBe("Mon Titre");
  });

  it("donne priorité à x-ui-label sur title", () => {
    expect(getLabel({ title: "Titre", "x-ui-label": "Label UI" }, "name")).toBe(
      "Label UI",
    );
  });

  it("formate le name proprement en dernier recours", () => {
    expect(getLabel({}, "firstName")).toBe("First Name");
    expect(getLabel({}, "user_id")).toBe("User Id");
  });
});

describe("getEnum", () => {
  it("retourne enum", () => {
    expect(getEnum({ enum: [1, 2] })).toEqual([1, 2]);
  });

  it("convertit const en enum à un élément", () => {
    expect(getEnum({ const: "fixed" })).toEqual(["fixed"]);
  });
});

describe("getConstraints", () => {
  it("extrait les contraintes de base", () => {
    const c = getConstraints({ minLength: 5, maximum: 10 });
    expect(c?.minLength).toBe(5);
    expect(c?.maximum).toBe(10);
  });

  it("gère exclusiveMinimum en tant que nombre (Draft 2020-12)", () => {
    const c = getConstraints({ exclusiveMinimum: 5 });
    expect(c?.exclusiveMinimum).toBe(5);
  });
});

describe("inferTSType", () => {
  it("infère les types simples", () => {
    expect(inferTSType({ type: "string" })).toBe("string");
    expect(inferTSType({ type: "number" })).toBe("number");
    expect(inferTSType({ type: "boolean" })).toBe("boolean");
  });

  it("infère les unions d'énums", () => {
    expect(inferTSType({ enum: ["a", "b"] })).toBe('"a" | "b"');
  });

  it("infère les objets", () => {
    const schema: JsonSchema = {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "number" },
      },
      required: ["name"],
    };
    expect(inferTSType(schema)).toBe("{ name: string; age?: number }");
  });

  it("infère les tableaux", () => {
    expect(inferTSType({ type: "array", items: { type: "string" } })).toBe(
      "string[]",
    );
  });
});

describe("isNullable", () => {
  it("détecte null dans un tableau de types", () => {
    expect(isNullable({ type: ["string", "null"] })).toBe(true);
  });

  it("détecte null dans anyOf", () => {
    expect(isNullable({ anyOf: [{ type: "string" }, { type: "null" }] })).toBe(
      true,
    );
  });

  it("retourne false si pas de null", () => {
    expect(isNullable({ type: "string" })).toBe(false);
  });
});
