import type { FieldMeta, JsonSchema, JsonSchemaType } from "../types";

/**
 * Reconstructs a JSON Schema from an array of [key, FieldMeta] entries.
 * Useful for rebuilding schemas after transformation.
 *
 * @param entries - Array of [key, FieldMeta] tuples
 * @returns A JSON Schema object
 */
export function fromEntries(entries: [string, FieldMeta][]): JsonSchema {
  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];

  for (const [key, meta] of entries) {
    const prop: JsonSchema = { type: meta.type as JsonSchemaType };
    if (meta.format) prop.format = meta.format;
    if (meta.description) prop.description = meta.description;
    if (meta.defaultValue !== undefined) prop.default = meta.defaultValue;
    if (meta.enum) prop.enum = meta.enum;
    properties[key] = prop;

    if (meta.required) {
      required.push(key);
    }
  }

  return {
    type: "object",
    properties,
    ...(required.length > 0 ? { required } : {}),
  };
}