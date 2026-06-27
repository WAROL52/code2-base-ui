import type { FieldMeta, JsonSchema } from "../types";

export function flatfields(schema: JsonSchema, prefix = ""): FieldMeta[] {
	const fields: FieldMeta[] = [];
	const properties = schema.properties;

	if (!properties) return fields;

	for (const [key, value] of Object.entries(properties)) {
		const path = prefix ? `${prefix}.${key}` : key;
		const meta: FieldMeta = {
			path,
			type: (Array.isArray(value.type) ? value.type[0] : value.type) ?? "unknown",
			format: value.format,
			required: Array.isArray(schema.required) && schema.required.includes(key),
			description: value.description,
			defaultValue: value.default,
			enum: value.enum,
		};

		if (value.type === "object" && value.properties) {
			meta.properties = value.properties as Record<string, FieldMeta>;
		}

		fields.push(meta);

		if (value.type === "object" && value.properties) {
			fields.push(...flatfields(value as JsonSchema, path));
		}
	}

	return fields;
}
