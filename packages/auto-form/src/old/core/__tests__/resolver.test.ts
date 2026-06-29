// =============================================================================
// Tests — resolver.ts
// =============================================================================
import { describe, expect, it } from "vitest";
import { mergeAllOf, resolveSchema } from "../resolver";
import type { JsonSchema } from "../types";

// ---------------------------------------------------------------------------
// resolveSchema — $ref
// ---------------------------------------------------------------------------

describe("resolveSchema — $ref resolution", () => {
  it("résout un $ref simple dans $defs (Draft 2020-12)", () => {
    const schema: JsonSchema = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "object",
      properties: {
        user: { $ref: "#/$defs/User" },
      },
      $defs: {
        User: {
          type: "object",
          properties: {
            name: { type: "string" },
            age: { type: "number" },
          },
          required: ["name"],
        },
      },
    };

    const result = resolveSchema(schema);
    const userProp = result.root.properties?.user as JsonSchema;

    expect(userProp?.type).toBe("object");
    expect(
      (userProp?.properties as Record<string, JsonSchema>)?.name?.type,
    ).toBe("string");
    expect(userProp?.required).toContain("name");
  });

  it("résout un $ref simple dans definitions (Draft 7)", () => {
    const schema: JsonSchema = {
      type: "object",
      properties: {
        address: { $ref: "#/definitions/Address" },
      },
      definitions: {
        Address: {
          type: "object",
          properties: {
            city: { type: "string" },
            zip: { type: "string" },
          },
        },
      },
    };

    const result = resolveSchema(schema);
    const addressProp = result.root.properties?.address as JsonSchema;

    expect(addressProp?.type).toBe("object");
    expect(
      (addressProp?.properties as Record<string, JsonSchema>)?.city?.type,
    ).toBe("string");
  });

  it("ne boucle pas sur une référence circulaire", () => {
    const schema: JsonSchema = {
      type: "object",
      $defs: {
        Node: {
          type: "object",
          properties: {
            value: { type: "string" },
            child: { $ref: "#/$defs/Node" },
          },
        },
      },
      properties: {
        root: { $ref: "#/$defs/Node" },
      },
    };

    // Ne doit pas lancer d'erreur ni boucler infiniment
    expect(() => resolveSchema(schema)).not.toThrow();
    const result = resolveSchema(schema);
    expect(result.root.properties?.root).toBeDefined();
  });

  it("détecte correctement le draft 2020-12", () => {
    const schema: JsonSchema = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "object",
      properties: {},
    };
    const result = resolveSchema(schema);
    expect(result.draft).toBe("draft-2020-12");
  });

  it("utilise draft-7 par défaut si $schema absent", () => {
    const schema: JsonSchema = { type: "object", properties: {} };
    const result = resolveSchema(schema);
    expect(result.draft).toBe("draft-7");
  });
});

// ---------------------------------------------------------------------------
// resolveSchema — allOf fusion
// ---------------------------------------------------------------------------

describe("resolveSchema — allOf flattening", () => {
  it("fusionne les properties de deux allOf", () => {
    const schema: JsonSchema = {
      type: "object",
      allOf: [
        {
          type: "object",
          properties: { firstName: { type: "string" } },
          required: ["firstName"],
        },
        {
          type: "object",
          properties: { lastName: { type: "string" } },
          required: ["lastName"],
        },
      ],
    };

    const result = resolveSchema(schema);
    const props = result.root.properties as Record<string, JsonSchema>;

    expect(props?.firstName?.type).toBe("string");
    expect(props?.lastName?.type).toBe("string");
    expect(result.root.required).toContain("firstName");
    expect(result.root.required).toContain("lastName");
  });

  it("ne duplique pas les entrées required", () => {
    const schema: JsonSchema = {
      allOf: [
        {
          type: "object",
          properties: { a: { type: "string" } },
          required: ["a"],
        },
        {
          type: "object",
          properties: { b: { type: "string" } },
          required: ["a", "b"],
        },
      ],
    };

    const result = resolveSchema(schema);
    expect(result.root.required?.filter((r) => r === "a").length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// mergeAllOf
// ---------------------------------------------------------------------------

describe("mergeAllOf", () => {
  it("fusionne title du premier schéma qui le définit", () => {
    const merged = mergeAllOf([
      { type: "object", properties: { a: { type: "string" } } },
      {
        type: "object",
        title: "My Schema",
        properties: { b: { type: "number" } },
      },
    ]);
    expect(merged.title).toBe("My Schema");
  });

  it("fusionne correctement les propriétés imbriquées", () => {
    const merged = mergeAllOf([
      { properties: { x: { type: "string" } } },
      { properties: { y: { type: "boolean" } } },
    ]);
    const props = merged.properties as Record<string, JsonSchema>;
    expect(props.x?.type).toBe("string");
    expect(props.y?.type).toBe("boolean");
  });
});
