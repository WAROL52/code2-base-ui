import type { FieldMeta, JsonSchema } from "../types";
import { flatfields } from "./flatfields";

/**
 * Extracts [key, FieldMeta] pairs from a JSON Schema.
 * Useful for generating UI components from schema definitions.
 *
 * @param schema - The JSON Schema to extract entries from
 * @returns An array of [key, FieldMeta] tuples
 */
export function entries(schema: JsonSchema): [string, FieldMeta][] {
	return flatfields(schema).map((field) => [field.path, field]);
}
