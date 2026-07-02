import type { JsonSchema } from "../types";
import { flatfields } from "./flatfields";

/**
 * Extracts the keys (field paths) from a JSON Schema.
 *
 * @param schema - The JSON Schema
 * @returns An array of field path strings
 */
export function keys(schema: JsonSchema): string[] {
	return flatfields(schema).map((f) => f.path);
}
