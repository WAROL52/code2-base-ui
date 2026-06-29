// =============================================================================
// Tests — traverser.ts
// =============================================================================
import { describe, expect, it } from "vitest";
import { resolveSchema } from "../resolver";
import { getFieldMeta, traverseSchema } from "../traverser";
import type { JsonSchema } from "../types";

// ---------------------------------------------------------------------------
// traverseSchema — champs primitifs
// ---------------------------------------------------------------------------

describe("traverseSchema — champs primitifs", () => {
  it("extrait les champs string, number et boolean d'un objet plat", () => {
    const schema: JsonSchema = {
      type: "object",
      properties: {
        name: { type: "string", title: "Full Name" },
        age: { type: "number" },
        active: { type: "boolean" },
      },
      required: ["name"],
    };

    const fields = traverseSchema(resolveSchema(schema));
    expect(fields).toHaveLength(3);

    const nameField = fields.find((f) => f.name === "name");
    expect(nameField?.type).toBe("string");
    expect(nameField?.label).toBe("Full Name");
    expect(nameField?.required).toBe(true);

    const ageField = fields.find((f) => f.name === "age");
    expect(ageField?.type).toBe("number");
    expect(ageField?.required).toBe(false);

    expect(fields.find((f) => f.name === "active")?.type).toBe("boolean");
  });

  it("génère un label capitalisé depuis le name si title absent", () => {
    const schema: JsonSchema = {
      type: "object",
      properties: { firstName: { type: "string" } },
    };
    const fields = traverseSchema(resolveSchema(schema));
    expect(fields[0]?.label).toBe("First Name");
  });

  it("extrait correctement enum et defaultValue", () => {
    const schema: JsonSchema = {
      type: "object",
      properties: {
        color: {
          type: "string",
          enum: ["red", "green", "blue"],
          default: "red",
        },
      },
    };
    const fields = traverseSchema(resolveSchema(schema));
    const colorField = fields[0];
    expect(colorField?.kind).toBe("enum");
    expect(colorField?.enum).toEqual(["red", "green", "blue"]);
    expect(colorField?.defaultValue).toBe("red");
  });
});

// ---------------------------------------------------------------------------
// traverseSchema — objets imbriqués
// ---------------------------------------------------------------------------

describe("traverseSchema — objets imbriqués", () => {
  it("crée des children pour les champs de type object", () => {
    const schema: JsonSchema = {
      type: "object",
      properties: {
        address: {
          type: "object",
          properties: {
            street: { type: "string" },
            city: { type: "string" },
          },
          required: ["city"],
        },
      },
    };

    const fields = traverseSchema(resolveSchema(schema));
    const addressField = fields[0];
    expect(addressField?.kind).toBe("object");
    expect(addressField?.children).toHaveLength(2);

    const cityChild = addressField?.children?.find((c) => c.name === "city");
    expect(cityChild?.required).toBe(true);
    expect(cityChild?.path).toBe("address.city");
  });

  it("construit correctement les paths imbriqués", () => {
    const schema: JsonSchema = {
      type: "object",
      properties: {
        a: {
          type: "object",
          properties: {
            b: {
              type: "object",
              properties: {
                c: { type: "string" },
              },
            },
          },
        },
      },
    };

    const fields = traverseSchema(resolveSchema(schema));
    const cField = fields[0]?.children?.[0]?.children?.[0];
    expect(cField?.path).toBe("a.b.c");
  });
});

// ---------------------------------------------------------------------------
// traverseSchema — arrays
// ---------------------------------------------------------------------------

describe("traverseSchema — arrays", () => {
  it("crée un itemMeta pour les arrays d'objets", () => {
    const schema: JsonSchema = {
      type: "object",
      properties: {
        tags: {
          type: "array",
          items: { type: "string" },
        },
      },
    };

    const fields = traverseSchema(resolveSchema(schema));
    const tagsField = fields.find((f) => f.name === "tags");
    expect(tagsField?.kind).toBe("array");
    expect(tagsField?.itemMeta?.type).toBe("string");
  });

  it("extrait les contraintes minItems et maxItems", () => {
    const schema: JsonSchema = {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: { type: "number" },
          minItems: 1,
          maxItems: 10,
        },
      },
    };
    const fields = traverseSchema(resolveSchema(schema));
    expect(fields[0]?.constraints?.minItems).toBe(1);
    expect(fields[0]?.constraints?.maxItems).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// traverseSchema — oneOf/anyOf (unions)
// ---------------------------------------------------------------------------

describe("traverseSchema — unions (oneOf/anyOf)", () => {
  it("crée des variants pour oneOf", () => {
    const schema: JsonSchema = {
      type: "object",
      properties: {
        contact: {
          oneOf: [
            {
              title: "Email",
              type: "object",
              properties: { email: { type: "string" } },
            },
            {
              title: "Phone",
              type: "object",
              properties: { phone: { type: "string" } },
            },
          ],
        },
      },
    };

    const fields = traverseSchema(resolveSchema(schema));
    const contactField = fields.find((f) => f.name === "contact");
    expect(contactField?.kind).toBe("union");
    expect(contactField?.variants).toHaveLength(2);
    expect(contactField?.variants?.[0]?.[0]?.name).toBe("email");
    expect(contactField?.variants?.[1]?.[0]?.name).toBe("phone");
  });
});

// ---------------------------------------------------------------------------
// getFieldMeta — lookup par path
// ---------------------------------------------------------------------------

describe("getFieldMeta", () => {
  const schema: JsonSchema = {
    type: "object",
    properties: {
      user: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
        },
        required: ["email"],
      },
    },
  };

  it("retourne le FieldMeta correct pour un path imbriqué", () => {
    const resolved = resolveSchema(schema);
    const field = getFieldMeta(resolved, "user.email");
    expect(field?.name).toBe("email");
    expect(field?.format).toBe("email");
    expect(field?.required).toBe(true);
  });

  it("retourne null pour un path inexistant", () => {
    const resolved = resolveSchema(schema);
    expect(getFieldMeta(resolved, "user.nonexistent")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Tri par uiOrder
// ---------------------------------------------------------------------------

describe("traverseSchema — tri uiOrder", () => {
  it("trie les champs par x-ui-order", () => {
    const schema: JsonSchema = {
      type: "object",
      properties: {
        z: { type: "string", "x-ui-order": 3 },
        a: { type: "string", "x-ui-order": 1 },
        m: { type: "string", "x-ui-order": 2 },
      },
    };

    const fields = traverseSchema(resolveSchema(schema));
    expect(fields.map((f) => f.name)).toEqual(["a", "m", "z"]);
  });
});
