import type { FieldMeta, JsonSchema } from "../types";
import { humanizePath } from "./humanize-path";

export function flatfields(schema: JsonSchema, prefix = ""): FieldMeta[] {
	const fields: FieldMeta[] = [];
	const properties = schema.properties;

	if (!properties) return fields;

	for (const [key, value] of Object.entries(properties)) {
		const path = prefix ? `${prefix}.${key}` : key;
		const meta: FieldMeta = {
			path,
			type: (Array.isArray(value.type) ? value.type[0] : value.type) ?? "unknown",
			label: value.title ?? humanizePath(key),
			format: value.format,
			required: Array.isArray(schema.required) && schema.required.includes(key),
			description: value.description,
			defaultValue: value.default,
			enum: value.enum,
			uiWidget: ((value as Record<string, unknown>).widget as string | undefined) ?? (value.enum ? "select" : undefined),
		};

		if (value.type === "object" && value.properties) {
			meta.properties = value.properties as unknown as Record<string, FieldMeta>;
		}

		fields.push(meta);

		if (value.type === "object" && value.properties) {
			fields.push(...flatfields(value as JsonSchema, path));
		}
	}

	return fields;
}
