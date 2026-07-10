import type { FieldMeta, GroupCriteria, JsonSchema } from "../types";
import { flatfields } from "./flatfields";

/**
 * Groups fields from a JSON Schema by a given criteria.
 *
 * @param schema - The JSON Schema
 * @param criteria - How to group fields
 * @returns A record of group key → FieldMeta[]
 */
export function groupBy(
	schema: JsonSchema,
	criteria: GroupCriteria
): Record<string, FieldMeta[]> {
	const fields = flatfields(schema);
	const groups: Record<string, FieldMeta[]> = {};

	for (const field of fields) {
		const key =
			typeof criteria.by === "function"
				? criteria.by(field)
				: String(field[criteria.by] ?? "undefined");

		if (!groups[key]) {
			groups[key] = [];
		}
		groups[key]?.push(field);
	}

	return groups;
}
